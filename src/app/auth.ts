import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { v4 as uuidv4 } from "uuid";
import { randomBytes } from "crypto";
import { db } from "@/server/db";
import { 
  getUserByEmail, 
  verifyCredentialsWithRole, 
  createUser, 
  updateLastLogin,
  getUserWithRoleByEmail
} from "@/server/queries";
import { sessions } from "@/server/db/schema";

export const options: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing required credentials");
        }

        try {
          const user = await verifyCredentialsWithRole(credentials.email, credentials.password);

          if (!user) {
            throw new Error("Invalid email or password");
          }

          if (!user.isActive) {
            throw new Error("Account is deactivated. Please contact support.");
          }

          if (!user.isEmailVerified) {
            throw new Error("Please verify your email before signing in");
          }

          // Return user object with role data for session
          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            image: user.profileImage || undefined,
            firstName: user.firstName,
            lastName: user.lastName,
            phoneNumber: user.phoneNumber || undefined,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            roleId: user.roleId,
            role: user.role, // Include role data for immediate access
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await getUserByEmail(user.email as string);

          if (!existingUser) {
            // Create new user for Google OAuth
            const newUser = await createUser({
              firstName: user.name?.split(" ")[0] || "",
              lastName: user.name?.split(" ").slice(1).join(" ") || "",
              email: user.email as string,
              password: randomBytes(32).toString("hex"), // Random password for OAuth users
              profileImage: user.image || undefined,
              isEmailVerified: true, // Google accounts are pre-verified
              isActive: true,
              roleId: process.env.DEFAULT_ROLE_ID as string || "default-role-id",
            });

            // Update user object with new user data
            Object.assign(user, {
              id: newUser.id,
              firstName: newUser.firstName,
              lastName: newUser.lastName,
              isActive: newUser.isActive,
              isEmailVerified: newUser.isEmailVerified,
              roleId: newUser.roleId,
              role: null,
            });
          } else {
            console.log("👤 Existing Google user found");
            // Get user with role data for Google OAuth
            const userWithRole = await getUserWithRoleByEmail(user.email as string);
            Object.assign(user, {
              id: existingUser.id,
              firstName: existingUser.firstName,
              lastName: existingUser.lastName,
              isActive: existingUser.isActive,
              isEmailVerified: existingUser.isEmailVerified,
              roleId: existingUser.roleId,
              email: existingUser.email,
              role: userWithRole?.role || null,
            });
          }
        } catch (err) {
          console.error("💥 Google sign-in error:", err);
          return false;
        }
      }

      // Create session for both Google and credentials login
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      const sessionToken = uuidv4();

      try {
        console.log("📝 Creating session for user:", user.id);
        await db.insert(sessions).values({
          sessionToken,
          userId: user.id,
          expires,
        });

        await updateLastLogin(user.id);
        Object.assign(user, { sessionToken });
        console.log("✅ Session created successfully");
      } catch (err) {
        console.error("💥 Session creation error:", err);
        return false;
      }

      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.sessionToken = user.sessionToken;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phoneNumber = user.phoneNumber;
        token.isActive = user.isActive;
        token.isEmailVerified = user.isEmailVerified;
        token.roleId = user.roleId;
        token.role = user.role;
      }

      if (trigger === "update") {
        // Refresh user data when token is updated
        const updatedUser = await getUserByEmail(token.email as string);
        if (updatedUser) {
          token.isActive = updatedUser.isActive;
          token.isEmailVerified = updatedUser.isEmailVerified;
          token.roleId = updatedUser.roleId;
          token.role = null; // No role object, just roleId
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.sessionToken = token.sessionToken as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.phoneNumber = token.phoneNumber as string;
        session.user.isActive = token.isActive as boolean;
        session.user.isEmailVerified = token.isEmailVerified as boolean;
        session.user.roleId = token.roleId as string;
        session.user.role = token.role as any;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Redirect to dashboard after successful login
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/dashboard`;
      }
      return baseUrl;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  jwt: {
    secret: process.env.JWT_SECRET as string,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  debug: process.env.NODE_ENV === "development",

  logger: {
    error(code, metadata) {
      console.error("🚨 NextAuth Error:", code, metadata);
    },
    warn(code) {
      console.warn("⚠️ NextAuth Warning:", code);
    },
    debug(code, metadata) {
      console.debug("🐛 NextAuth Debug:", code, metadata);
    },
  },
};