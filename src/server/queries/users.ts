import {
  eq,
  and,
  or,
  like,
  desc,
  asc,
  count,
} from "drizzle-orm";
import {
  NewUser,
  User,
  Users,
  Address,
  UserCompanies,
  Companies,
  Roles,
} from "@/server/db/schema";
import bcrypt from "bcryptjs";
import { db } from "../db";

// ==================== CREATE OPERATIONS ====================

/**
 * Register a new user
 */
export const registerUser = async (
  userData: Omit<NewUser, "id" | "createdAt" | "updatedAt"> & {
    password: string;
  }
) => {
  const hashedPassword = await bcrypt.hash(userData.password, 12);

  const [newUser] = await db
    .insert(Users)
    .values({
      ...userData,
      password: hashedPassword,
    })
    .returning();

  // Remove password from return
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

/**
 * Create user by admin
 */
export const createUser = async (
  userData: Omit<NewUser, "id" | "createdAt" | "updatedAt">
) => {
  const [newUser] = await db.insert(Users).values(userData).returning();
  const { password, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// ==================== READ OPERATIONS ====================

/**
 * Get all users with pagination
 */
export const getAllUsers = async (page: number = 1, limit: number = 20) => {
  const offset = (page - 1) * limit;

  const users = await db
    .select({
      id: Users.id,
      firstName: Users.firstName,
      lastName: Users.lastName,
      email: Users.email,
      phoneNumber: Users.phoneNumber,
      roleId: Users.roleId,
      isActive: Users.isActive,
      isEmailVerified: Users.isEmailVerified,
      lastLoginAt: Users.lastLoginAt,
      profileImage: Users.profileImage,
      createdAt: Users.createdAt,
    })
    .from(Users)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(Users.createdAt));

  const [totalCount] = await db.select({ count: count() }).from(Users);

  return {
    users,
    totalCount: totalCount.count,
    currentPage: page,
    totalPages: Math.ceil(totalCount.count / limit),
  };
};

/**
 * Get user by ID with full details
 */
export const getUserById = async (userId: string) => {
  const [user] = await db
    .select({
      id: Users.id,
      firstName: Users.firstName,
      lastName: Users.lastName,
      email: Users.email,
      phoneNumber: Users.phoneNumber,
      roleId: Users.roleId,
      isActive: Users.isActive,
      isEmailVerified: Users.isEmailVerified,
      lastLoginAt: Users.lastLoginAt,
      profileImage: Users.profileImage,
      createdAt: Users.createdAt,
      updatedAt: Users.updatedAt,
    })
    .from(Users)
    .where(eq(Users.id, userId));

  return user;
};

/**
 * Get user by email (for authentication)
 */
export const getUserByEmail = async (email: string) => {
  const [user] = await db
    .select()
    .from(Users)
    .where(eq(Users.email, email.toLowerCase()));

  return user;
};

// ==================== DETAILED QUERIES (With Role Joins) ====================

/**
 * Get user with full role details - for authentication & session creation
 */
export const getUserWithRoleByEmail = async (email: string) => {
  const [user] = await db
    .select({
      // User fields
      id: Users.id,
      firstName: Users.firstName,
      lastName: Users.lastName,
      email: Users.email,
      phoneNumber: Users.phoneNumber,
      password: Users.password,
      roleId: Users.roleId,
      isActive: Users.isActive,
      isEmailVerified: Users.isEmailVerified,
      lastLoginAt: Users.lastLoginAt,
      profileImage: Users.profileImage,
      createdAt: Users.createdAt,
      updatedAt: Users.updatedAt,
      // Role fields
      role: {
        id: Roles.id,
        name: Roles.name,
        description: Roles.description,
        access: Roles.access,
      },
    })
    .from(Users)
    .leftJoin(Roles, eq(Users.roleId, Roles.id))
    .where(eq(Users.email, email.toLowerCase()));

  return user;
};

/**
 * Get user by ID with full role details - for profile pages, etc.
 */
export const getUserWithRoleById = async (userId: string) => {
  const [user] = await db
    .select({
      id: Users.id,
      firstName: Users.firstName,
      lastName: Users.lastName,
      email: Users.email,
      phoneNumber: Users.phoneNumber,
      roleId: Users.roleId,
      isActive: Users.isActive,
      isEmailVerified: Users.isEmailVerified,
      lastLoginAt: Users.lastLoginAt,
      profileImage: Users.profileImage,
      createdAt: Users.createdAt,
      updatedAt: Users.updatedAt,
      role: {
        id: Roles.id,
        name: Roles.name,
        description: Roles.description,
        access: Roles.access,
      },
    })
    .from(Users)
    .leftJoin(Roles, eq(Users.roleId, Roles.id))
    .where(eq(Users.id, userId));

  return user;
};

/**
 * Get role details by ID - for client-side role fetching
 */
export const getRoleById = async (roleId: string) => {
  const [role] = await db
    .select()
    .from(Roles)
    .where(eq(Roles.id, roleId));

  return role;
};

/**
 * Verify credentials with role data - for login
 */
export const verifyCredentialsWithRole = async (email: string, password: string) => {
  const user = await getUserWithRoleByEmail(email);

  if (!user) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return null;
  }

  // Update last login
  await updateLastLogin(user.id);

  // Return user without password but with role data
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};


/**
 * Get user with addresses
 */
export const getUserWithAddresses = async (userId: string) => {
  const user = await db
    .select({
      id: Users.id,
      firstName: Users.firstName,
      lastName: Users.lastName,
      email: Users.email,
      phoneNumber: Users.phoneNumber,
      roleId: Users.roleId,
      profileImage: Users.profileImage,
      address: {
        id: Address.id,
        addressLine1: Address.addressLine1,
        addressLine2: Address.addressLine2,
        city: Address.city,
        state: Address.state,
        postalCode: Address.postalCode,
        country: Address.country,
        isActive: Address.isActive,
      },
    })
    .from(Users)
    .leftJoin(Address, eq(Users.id, Address.userId))
    .where(eq(Users.id, userId));

  return user;
};

/**
 * Get user with company associations
 */
export const getUserWithCompanies = async (userId: string) => {
  const userCompanies = await db
    .select({
      user: {
        id: Users.id,
        firstName: Users.firstName,
        lastName: Users.lastName,
        email: Users.email,
        roleId: Users.roleId,
      },
      company: {
        id: Companies.id,
        name: Companies.name,
        type: Companies.type,
        email: Companies.email,
        phoneNumber: Companies.phoneNumber,
      },
      companyRoleId: UserCompanies.roleId, // Role in the company context
      isActive: UserCompanies.isActive,
    })
    .from(UserCompanies)
    .innerJoin(Users, eq(UserCompanies.userId, Users.id))
    .innerJoin(Companies, eq(UserCompanies.companyId, Companies.id))
    .where(eq(Users.id, userId));

  return userCompanies;
};

/**
 * Search users by name or email
 */
export const searchUsers = async (
  searchTerm: string,
  page: number = 1,
  limit: number = 20
) => {
  const offset = (page - 1) * limit;
  const searchPattern = `%${searchTerm}%`;

  const users = await db
    .select({
      id: Users.id,
      firstName: Users.firstName,
      lastName: Users.lastName,
      email: Users.email,
      phoneNumber: Users.phoneNumber,
      roleId: Users.roleId,
      isActive: Users.isActive,
    })
    .from(Users)
    .where(
      or(
        like(Users.firstName, searchPattern),
        like(Users.lastName, searchPattern),
        like(Users.email, searchPattern)
      )
    )
    .limit(limit)
    .offset(offset)
    .orderBy(asc(Users.firstName));

  return users;
};

/**
 * Get users by role
 */
export const getUsersByRole = async (roleId: string) => {
  const users = await db
    .select({
      id: Users.id,
      firstName: Users.firstName,
      lastName: Users.lastName,
      email: Users.email,
      roleId: Users.roleId,
      isActive: Users.isActive,
    })
    .from(Users)
    .where(and(eq(Users.roleId, roleId), eq(Users.isActive, true)))
    .orderBy(asc(Users.firstName));

  return users;
};

/**
 * Get active users
 */
export const getActiveUsers = async () => {
  const users = await db
    .select({
      id: Users.id,
      firstName: Users.firstName,
      lastName: Users.lastName,
      email: Users.email,
      roleId: Users.roleId,
      lastLoginAt: Users.lastLoginAt,
    })
    .from(Users)
    .where(eq(Users.isActive, true))
    .orderBy(desc(Users.lastLoginAt));

  return users;
};

/**
 * Get users without email verification
 */
export const getUnverifiedUsers = async () => {
  const users = await db
    .select({
      id: Users.id,
      firstName: Users.firstName,
      lastName: Users.lastName,
      email: Users.email,
      roleId: Users.roleId,
      createdAt: Users.createdAt,
    })
    .from(Users)
    .where(and(eq(Users.isEmailVerified, false), eq(Users.isActive, true)))
    .orderBy(desc(Users.createdAt));

  return users;
};

// ==================== UPDATE OPERATIONS ====================

/**
 * Update user profile
 */
export const updateUser = async (
  userId: string,
  updateData: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
) => {
  const [updatedUser] = await db
    .update(Users)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(Users.id, userId))
    .returning();

  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

/**
 * Update user password
 */
export const updatePassword = async (userId: string, newPassword: string) => {
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const [updatedUser] = await db
    .update(Users)
    .set({
      password: hashedPassword,
      updatedAt: new Date(),
    })
    .where(eq(Users.id, userId))
    .returning({
      id: Users.id,
      email: Users.email,
      updatedAt: Users.updatedAt,
    });

  return updatedUser;
};

/**
 * Update last login time
 */
export const updateLastLogin = async (userId: string) => {
  await db
    .update(Users)
    .set({
      lastLoginAt: new Date(),
    })
    .where(eq(Users.id, userId));
};

/**
 * Verify user email
 */
export const verifyEmail = async (userId: string) => {
  const [updatedUser] = await db
    .update(Users)
    .set({
      isEmailVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(Users.id, userId))
    .returning({
      id: Users.id,
      email: Users.email,
      isEmailVerified: Users.isEmailVerified,
    });

  return updatedUser;
};

/**
 * Activate/Deactivate user
 */
export const toggleUserStatus = async (userId: string, isActive: boolean) => {
  const [updatedUser] = await db
    .update(Users)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(Users.id, userId))
    .returning({
      id: Users.id,
      email: Users.email,
      isActive: Users.isActive,
    });

  return updatedUser;
};

/**
 * Update user role
 */
export const updateUserRole = async (userId: string, roleId: string) => {
  const [updatedUser] = await db
    .update(Users)
    .set({
      roleId,
      updatedAt: new Date(),
    })
    .where(eq(Users.id, userId))
    .returning({
      id: Users.id,
      email: Users.email,
      roleId: Users.roleId,
    });

  return updatedUser;
};

// ==================== DELETE OPERATIONS ====================

/**
 * Soft delete user (deactivate)
 */
export const softDeleteUser = async (userId: string) => {
  return await toggleUserStatus(userId, false);
};

// ==================== AUTHENTICATION OPERATIONS ====================

/**
 * Verify user credentials
 */
export const verifyCredentials = async (email: string, password: string) => {
  const user = await getUserByEmail(email);

  if (!user) {
    return null;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    return null;
  }

  // Update last login
  await updateLastLogin(user.id);

  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * Check if email exists
 */
export const emailExists = async (email: string) => {
  const [user] = await db
    .select({ id: Users.id })
    .from(Users)
    .where(eq(Users.email, email.toLowerCase()))
    .limit(1);

  return !!user;
};

// ==================== ANALYTICS OPERATIONS ====================

/**
 * Get user statistics
 */
export const getUserStats = async () => {
  const [stats] = await db
    .select({
      totalUsers: count(),
    })
    .from(Users);

  const [activeUsers] = await db
    .select({
      activeUsers: count(),
    })
    .from(Users)
    .where(eq(Users.isActive, true));

  const [verifiedUsers] = await db
    .select({
      verifiedUsers: count(),
    })
    .from(Users)
    .where(eq(Users.isEmailVerified, true));

  return {
    totalUsers: stats.totalUsers,
    activeUsers: activeUsers.activeUsers,
    verifiedUsers: verifiedUsers.verifiedUsers,
    inactiveUsers: stats.totalUsers - activeUsers.activeUsers,
    unverifiedUsers: stats.totalUsers - verifiedUsers.verifiedUsers,
  };
};

/**
 * Get users by role distribution
 */
export const getUserRoleDistribution = async () => {
  const roleDistribution = await db
    .select({
      roleId: Users.roleId,
      userCount: count(Users.id),
    })
    .from(Users)
    .groupBy(Users.roleId)
    .orderBy(desc(count(Users.id)));

  return roleDistribution;
};

/**
 * Get recently registered users
 */
export const getRecentUsers = async (days: number = 7) => {
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - days);

  const recentUsers = await db
    .select({
      id: Users.id,
      firstName: Users.firstName,
      lastName: Users.lastName,
      email: Users.email,
      roleId: Users.roleId,
      createdAt: Users.createdAt,
    })
    .from(Users)
    .where(eq(Users.isActive, true))
    .orderBy(desc(Users.createdAt))
    .limit(10);

  return recentUsers;
};