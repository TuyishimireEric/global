// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      sessionToken: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      isActive: boolean;
      isEmailVerified: boolean;
      roleId: string;
      role?: {
        id: string;
        name: string;
        description?: string;
        access: any;
      };
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    sessionToken?: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    isActive: boolean;
    isEmailVerified: boolean;
    roleId: string;
    role?: {
      id: string;
      name: string;
      description?: string;
      access: any;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    sessionToken: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    isActive: boolean;
    isEmailVerified: boolean;
    roleId: string;
    role?: {
      id: string;
      name: string;
      description?: string;
      access: any;
    };
  }
}