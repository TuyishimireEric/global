// types/next-auth.d.ts
import "next-auth";

interface AuthUserI {
  id: string;
  sessionToken?: string;
  email: string;
  name?: string;
  image?: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  roleId: string;
  role?: {
    id: string;
    name: string;
    description?: string | null;
    access?: unknown;
  } | null;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

declare module "next-auth" {
  interface Session {
    user: AuthUserI;
  }

  interface User {
    id: string;
    sessionToken?: string;
    email: string;
    name?: string;
    image?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    isActive?: boolean;
    isEmailVerified?: boolean;
    roleId?: string;
    role?: {
      id: string;
      name: string;
      description?: string | null;
      access?: unknown;
    } | null;
    lastLoginAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
  }

  interface JWT {
    id: string;
    sessionToken?: string;
    email?: string;
    name?: string;
    image?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    isActive?: boolean;
    isEmailVerified?: boolean;
    roleId?: string;
  }
}