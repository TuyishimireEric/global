import { db } from "../db";
import { Roles, Users, UserCompanies, NewRole, Role } from "@/server/db/schema";
import { eq, and, like, desc, asc, count } from "drizzle-orm";

export class RoleQueries {
  // ==================== CREATE OPERATIONS ====================

  /**
   * Create a new role
   */
  static async createRole(
    roleData: Omit<NewRole, "id" | "createdAt" | "updatedAt">
  ) {
    const [newRole] = await db
      .insert(Roles)
      .values({
        ...roleData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return newRole;
  }

  // ==================== READ OPERATIONS ====================

  /**
   * Get all roles
   */
  static async getAllRoles() {
    const roles = await db
      .select({
        id: Roles.id,
        name: Roles.name,
        description: Roles.description,
        access: Roles.access,
        isActive: Roles.isActive,
        createdAt: Roles.createdAt,
        userCount: count(Users.id),
      })
      .from(Roles)
      .leftJoin(Users, eq(Roles.id, Users.roleId))
      .groupBy(
        Roles.id,
        Roles.name,
        Roles.description,
        Roles.access,
        Roles.isActive,
        Roles.createdAt
      )
      .orderBy(asc(Roles.name));

    return roles;
  }

  /**
   * Get active roles only
   */
  static async getActiveRoles() {
    const roles = await db
      .select({
        id: Roles.id,
        name: Roles.name,
        description: Roles.description,
        access: Roles.access,
      })
      .from(Roles)
      .where(eq(Roles.isActive, true))
      .orderBy(asc(Roles.name));

    return roles;
  }

  /**
   * Get role by ID
   */
  static async getRoleById(roleId: string) {
    const [role] = await db.select().from(Roles).where(eq(Roles.id, roleId));

    return role;
  }

  /**
   * Get role by name
   */
  static async getRoleByName(name: string) {
    const [role] = await db.select().from(Roles).where(eq(Roles.name, name));

    return role;
  }

  /**
   * Get role with users
   */
  static async getRoleWithUsers(roleId: string) {
    const roleWithUsers = await db
      .select({
        role: {
          id: Roles.id,
          name: Roles.name,
          description: Roles.description,
          access: Roles.access,
          isActive: Roles.isActive,
        },
        user: {
          id: Users.id,
          firstName: Users.firstName,
          lastName: Users.lastName,
          email: Users.email,
          isActive: Users.isActive,
        },
      })
      .from(Roles)
      .leftJoin(Users, eq(Roles.id, Users.roleId))
      .where(eq(Roles.id, roleId))
      .orderBy(asc(Users.firstName));

    return roleWithUsers;
  }

  /**
   * Search roles by name
   */
  static async searchRoles(searchTerm: string) {
    const searchPattern = `%${searchTerm}%`;

    const roles = await db
      .select({
        id: Roles.id,
        name: Roles.name,
        description: Roles.description,
        isActive: Roles.isActive,
      })
      .from(Roles)
      .where(like(Roles.name, searchPattern))
      .orderBy(asc(Roles.name));

    return roles;
  }

  /**
   * Get roles with specific permissions
   */
  static async getRolesWithPermission(permission: string) {
    const roles = await db
      .select({
        id: Roles.id,
        name: Roles.name,
        description: Roles.description,
        access: Roles.access,
      })
      .from(Roles)
      .where(
        and(
          eq(Roles.isActive, true)
          // You'll need to implement JSON search based on your access structure
          // This is a placeholder - adjust based on your access JSON format
        )
      )
      .orderBy(asc(Roles.name));

    return roles;
  }

  // ==================== UPDATE OPERATIONS ====================

  /**
   * Update role
   */
  static async updateRole(
    roleId: string,
    updateData: Partial<Omit<Role, "id" | "createdAt" | "updatedAt">>
  ) {
    const [updatedRole] = await db
      .update(Roles)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(Roles.id, roleId))
      .returning();

    return updatedRole;
  }

  /**
   * Update role permissions
   */
  static async updateRolePermissions(roleId: string, access: any) {
    const [updatedRole] = await db
      .update(Roles)
      .set({
        access,
        updatedAt: new Date(),
      })
      .where(eq(Roles.id, roleId))
      .returning({
        id: Roles.id,
        name: Roles.name,
        access: Roles.access,
      });

    return updatedRole;
  }

  /**
   * Activate/Deactivate role
   */
  static async toggleRoleStatus(roleId: string, isActive: boolean) {
    const [updatedRole] = await db
      .update(Roles)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(Roles.id, roleId))
      .returning({
        id: Roles.id,
        name: Roles.name,
        isActive: Roles.isActive,
      });

    return updatedRole;
  }

  // ==================== DELETE OPERATIONS ====================

  /**
   * Soft delete role (deactivate)
   */
  static async softDeleteRole(roleId: string) {
    return await this.toggleRoleStatus(roleId, false);
  }

  /**
   * Check if role can be deleted (no users assigned)
   */
  static async canDeleteRole(roleId: string) {
    const [userCount] = await db
      .select({ count: count() })
      .from(Users)
      .where(eq(Users.roleId, roleId));

    const [userCompanyCount] = await db
      .select({ count: count() })
      .from(UserCompanies)
      .where(eq(UserCompanies.roleId, roleId));

    return userCount.count === 0 && userCompanyCount.count === 0;
  }

  /**
   * Hard delete role (permanent)
   */
  static async deleteRole(roleId: string) {
    // Check if role can be deleted
    const canDelete = await this.canDeleteRole(roleId);

    if (!canDelete) {
      throw new Error("Cannot delete role: Users are assigned to this role");
    }

    const [deletedRole] = await db
      .delete(Roles)
      .where(eq(Roles.id, roleId))
      .returning({
        id: Roles.id,
        name: Roles.name,
      });

    return deletedRole;
  }

  // ==================== VALIDATION OPERATIONS ====================

  /**
   * Check if role name exists
   */
//   static async roleNameExists(name: string, excludeId?: string) {
//     let whereCondition = eq(Roles.name, name);

//     if (excludeId) {
//       whereCondition = and(eq(Roles.name, name), ne(Roles.id, excludeId));
//     }

//     const [role] = await db
//       .select({ id: Roles.id })
//       .from(Roles)
//       .where(whereCondition)
//       .limit(1);

//     return !!role;
//   }

  /**
   * Validate role data
   */
//   static async validateRoleData(
//     roleData: Partial<NewRole>,
//     excludeId?: string
//   ) {
//     const errors: string[] = [];

//     if (roleData.name) {
//       const exists = await this.roleNameExists(roleData.name, excludeId);
//       if (exists) {
//         errors.push("Role name already exists");
//       }

//       if (roleData.name.length < 2) {
//         errors.push("Role name must be at least 2 characters long");
//       }
//     }

//     if (roleData.access) {
//       try {
//         // Validate access structure
//         if (typeof roleData.access !== "object") {
//           errors.push("Access must be a valid JSON object");
//         }
//       } catch (error) {
//         errors.push("Invalid access permissions format");
//       }
//     }

//     return {
//       isValid: errors.length === 0,
//       errors,
//     };
//   }

  // ==================== ANALYTICS OPERATIONS ====================

  /**
   * Get role statistics
   */
  static async getRoleStats() {
    const [totalRoles] = await db.select({ count: count() }).from(Roles);

    const [activeRoles] = await db
      .select({ count: count() })
      .from(Roles)
      .where(eq(Roles.isActive, true));

    return {
      totalRoles: totalRoles.count,
      activeRoles: activeRoles.count,
      inactiveRoles: totalRoles.count - activeRoles.count,
    };
  }

  /**
   * Get role usage statistics
   */
  static async getRoleUsageStats() {
    const roleUsage = await db
      .select({
        role: {
          id: Roles.id,
          name: Roles.name,
        },
        directUserCount: count(Users.id),
        companyUserCount: count(UserCompanies.id),
      })
      .from(Roles)
      .leftJoin(Users, eq(Roles.id, Users.roleId))
      .leftJoin(UserCompanies, eq(Roles.id, UserCompanies.roleId))
      .groupBy(Roles.id, Roles.name)
      .orderBy(desc(count(Users.id)));

    return roleUsage;
  }

  // ==================== PERMISSION OPERATIONS ====================

  /**
   * Check if role has specific permission
   */
  static async hasPermission(
    roleId: string,
    permission: string
  ): Promise<boolean> {
    const role = await this.getRoleById(roleId);

    if (!role || !role.access) {
      return false;
    }

    // This depends on your access structure
    // Example: if access is an array of permissions
    if (Array.isArray(role.access)) {
      return role.access.includes(permission);
    }

    // Example: if access is an object with nested permissions
    if (typeof role.access === "object") {
      return this.checkNestedPermission(role.access, permission);
    }

    return false;
  }

  /**
   * Helper function to check nested permissions
   */
  private static checkNestedPermission(
    access: any,
    permission: string
  ): boolean {
    // Example implementation - adjust based on your permission structure
    const parts = permission.split(".");
    let current = access;

    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        return false;
      }
    }

    return current === true || current === "allow";
  }

  /**
   * Get all permissions for a role
   */
  static async getRolePermissions(roleId: string) {
    const role = await this.getRoleById(roleId);

    if (!role || !role.access) {
      return [];
    }

    return role.access;
  }

  /**
   * Add permission to role
   */
  static async addPermission(roleId: string, permission: string) {
    const role = await this.getRoleById(roleId);

    if (!role) {
      throw new Error("Role not found");
    }

    let newAccess = role.access || [];

    // If access is an array
    if (Array.isArray(newAccess)) {
      if (!newAccess.includes(permission)) {
        newAccess.push(permission);
      }
    }
    // If access is an object - implement based on your structure
    else if (typeof newAccess === "object") {
      newAccess = { ...newAccess, [permission]: true };
    }

    return await this.updateRolePermissions(roleId, newAccess);
  }

  /**
   * Remove permission from role
   */
//   static async removePermission(roleId: string, permission: string) {
//     const role = await this.getRoleById(roleId);

//     if (!role) {
//       throw new Error("Role not found");
//     }

//     let newAccess = role.access || [];

//     // If access is an array
//     if (Array.isArray(newAccess)) {
//       newAccess = newAccess.filter((p) => p !== permission);
//     }
//     // If access is an object - implement based on your structure
//     else if (typeof newAccess === "object") {
//       const { [permission]: removed, ...rest } = newAccess;
//       newAccess = rest;
//     }

//     return await this.updateRolePermissions(roleId, newAccess);
//   }
}
