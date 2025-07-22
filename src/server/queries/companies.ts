import { db } from "../db"; // Adjust import path as needed
import { Companies, UserCompanies } from "../db/schema"; // Adjust import path as needed
import { eq, and, sql } from "drizzle-orm";

// Types
export type CompanyType = "customer" | "supplier" | "both";

export interface CreateCompanyInput {
  name: string;
  type: CompanyType;
  logo?: string;
  email?: string;
  phoneNumber?: string;
  faxNumber?: string;
  website?: string;
  tin?: string;
  registrationNumber?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  swiftCode?: string;
  creditLimit?: string;
  paymentTerms?: string;
  taxRate?: string;
  isActive?: boolean;
  notes?: string;
}

export interface UpdateCompanyInput extends Partial<CreateCompanyInput> {
  id: string;
}

export interface CompanyFilters {
  name?: string;
  type?: CompanyType;
  isActive?: boolean;
  city?: string;
  country?: string;
  limit?: number;
  offset?: number;
}

// Get all companies with optional filtering
export async function getCompanies(filters: CompanyFilters = {}) {
  try {
    const conditions = [];

    if (filters.name) {
      conditions.push(sql`${Companies.name} ILIKE ${`%${filters.name}%`}`);
    }

    if (filters.type) {
      conditions.push(eq(Companies.type, filters.type));
    }

    if (filters.isActive !== undefined) {
      conditions.push(eq(Companies.isActive, filters.isActive));
    }

    if (filters.city) {
      conditions.push(sql`${Companies.city} ILIKE ${`%${filters.city}%`}`);
    }

    if (filters.country) {
      conditions.push(
        sql`${Companies.country} ILIKE ${`%${filters.country}%`}`
      );
    }

    // Build the query in one chain
    const baseQuery = db.select().from(Companies);

    let queryWithConditions =
      conditions.length > 0 ? baseQuery.where(and(...conditions)) : baseQuery;

    return await queryWithConditions;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw new Error("Failed to fetch companies");
  }
}

// Get company by ID
export async function getCompanyById(id: string) {
  try {
    const result = await db
      .select()
      .from(Companies)
      .where(eq(Companies.id, id))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Error fetching company by ID:", error);
    throw new Error("Failed to fetch company");
  }
}

// Get companies for a specific user
export async function getCompaniesByUserId(userId: string) {
  try {
    return await db
      .select({
        company: Companies,
        userCompany: UserCompanies,
      })
      .from(Companies)
      .innerJoin(UserCompanies, eq(Companies.id, UserCompanies.companyId))
      .where(
        and(
          eq(UserCompanies.userId, userId),
          eq(UserCompanies.isActive, true),
          eq(Companies.isActive, true)
        )
      )
      .orderBy(Companies.name);
  } catch (error) {
    console.error("Error fetching companies for user:", error);
    throw new Error("Failed to fetch user companies");
  }
}

// Create a new company
export async function createCompany(input: CreateCompanyInput) {
  try {
    const result = await db.insert(Companies).values(input).returning();

    return result[0];
  } catch (error) {
    console.error("Error creating company:", error);
    throw new Error("Failed to create company");
  }
}

// Update an existing company
export async function updateCompany(input: UpdateCompanyInput) {
  try {
    const { id, ...updateData } = input;

    const result = await db
      .update(Companies)
      .set(updateData)
      .where(eq(Companies.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error("Company not found");
    }

    return result[0];
  } catch (error) {
    console.error("Error updating company:", error);
    throw new Error("Failed to update company");
  }
}

// Soft delete a company (set isActive to false)
export async function deleteCompany(id: string) {
  try {
    const result = await db
      .update(Companies)
      .set({
        isActive: false,
      })
      .where(eq(Companies.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error("Company not found");
    }

    return result[0];
  } catch (error) {
    console.error("Error deleting company:", error);
    throw new Error("Failed to delete company");
  }
}

// Hard delete a company (permanently remove from database)
export async function permanentlyDeleteCompany(id: string) {
  try {
    // First, delete any related UserCompanies records
    await db.delete(UserCompanies).where(eq(UserCompanies.companyId, id));

    // Then delete the company
    const result = await db
      .delete(Companies)
      .where(eq(Companies.id, id))
      .returning();

    if (result.length === 0) {
      throw new Error("Company not found");
    }

    return result[0];
  } catch (error) {
    console.error("Error permanently deleting company:", error);
    throw new Error("Failed to permanently delete company");
  }
}

// Associate a user with a company
export async function addUserToCompany(
  userId: string,
  companyId: string,
  roleId: string
) {
  try {
    // Check if association already exists
    const existing = await db
      .select()
      .from(UserCompanies)
      .where(
        and(
          eq(UserCompanies.userId, userId),
          eq(UserCompanies.companyId, companyId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing association
      return await db
        .update(UserCompanies)
        .set({
          roleId,
          isActive: true,
        })
        .where(eq(UserCompanies.id, existing[0].id))
        .returning();
    } else {
      // Create new association
      return await db
        .insert(UserCompanies)
        .values({
          userId,
          companyId,
          roleId,
        })
        .returning();
    }
  } catch (error) {
    console.error("Error adding user to company:", error);
    throw new Error("Failed to add user to company");
  }
}

// Remove a user from a company (soft delete)
export async function removeUserFromCompany(userId: string, companyId: string) {
  try {
    const result = await db
      .update(UserCompanies)
      .set({
        isActive: false,
      })
      .where(
        and(
          eq(UserCompanies.userId, userId),
          eq(UserCompanies.companyId, companyId)
        )
      )
      .returning();

    return result;
  } catch (error) {
    console.error("Error removing user from company:", error);
    throw new Error("Failed to remove user from company");
  }
}

// Get company statistics
export async function getCompanyStats() {
  try {
    const stats = await db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`count(*) FILTER (WHERE ${Companies.isActive} = true)::int`,
        inactive: sql<number>`count(*) FILTER (WHERE ${Companies.isActive} = false)::int`,
      })
      .from(Companies);

    return stats[0];
  } catch (error) {
    console.error("Error fetching company stats:", error);
    throw new Error("Failed to fetch company statistics");
  }
}
