// server/queries/part-queries.ts
import {
  eq,
  and,
  or,
  like,
  desc,
  asc,
  count,
  sum,
  gte,
  lte,
  isNull,
  inArray,
  min,
  max,
  avg,
  ne,
  SQL,
} from "drizzle-orm";
import {
  NewPart,
  Part,
  Parts,
  PartItems,
  Users,
  Companies,
  StockTransactions,
} from "@/server/db/schema";
import { db } from "../db";

// ==================== CREATE OPERATIONS ====================

/**
 * Create a new part
 */
export async function createPart(
  partData: Omit<NewPart, "id" | "createdAt" | "updatedAt">
) {
  const [newPart] = await db
    .insert(Parts)
    .values({
      ...partData,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  return newPart;
}

/**
 * Bulk create parts
 */
export async function bulkCreateParts(
  partsData: Omit<NewPart, "id" | "createdAt" | "updatedAt">[]
) {
  const partsWithTimestamps = partsData.map((part) => ({
    ...part,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const newParts = await db
    .insert(Parts)
    .values(partsWithTimestamps)
    .returning();
  return newParts;
}

// ==================== READ OPERATIONS ====================

/**
 * Get all parts with pagination and filtering
 */
export async function getAllParts(
  page: number = 1,
  limit: number = 20,
  filters?: {
    category?: string;
    brand?: string;
    isActive?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }
) {
  const offset = (page - 1) * limit;
  let whereConditions = [];

  if (filters) {
    if (filters.category) {
      whereConditions.push(eq(Parts.category, filters.category));
    }
    if (filters.brand) {
      whereConditions.push(eq(Parts.brand, filters.brand));
    }
    if (filters.isActive !== undefined) {
      whereConditions.push(eq(Parts.isActive, filters.isActive));
    }
    if (filters.minPrice) {
      whereConditions.push(gte(Parts.price, filters.minPrice.toString()));
    }
    if (filters.maxPrice) {
      whereConditions.push(lte(Parts.price, filters.maxPrice.toString()));
    }
  }

  const whereClause =
    whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const parts = await db
    .select({
      id: Parts.id,
      partNumber: Parts.partNumber,
      name: Parts.name,
      description: Parts.description,
      brand: Parts.brand,
      category: Parts.category,
      subcategory: Parts.subcategory,
      price: Parts.price,
      discount: Parts.discount,
      images: Parts.images,
      isActive: Parts.isActive,
      createdAt: Parts.createdAt,
      createdBy: {
        firstName: Users.firstName,
        lastName: Users.lastName,
      },
    })
    .from(Parts)
    .leftJoin(Users, eq(Parts.createdBy, Users.id))
    .where(whereClause)
    .limit(limit)
    .offset(offset)
    .orderBy(desc(Parts.createdAt));

  const [totalCount] = await db
    .select({ count: count() })
    .from(Parts)
    .where(whereClause);

  return {
    parts,
    totalCount: totalCount.count,
    currentPage: page,
    totalPages: Math.ceil(totalCount.count / limit),
  };
}

/**
 * Get part by ID with full details
 */
export async function getPartById(partId: string) {
  const [part] = await db
    .select({
      id: Parts.id,
      partNumber: Parts.partNumber,
      name: Parts.name,
      description: Parts.description,
      brand: Parts.brand,
      category: Parts.category,
      subcategory: Parts.subcategory,
      compatibleModels: Parts.compatibleModels,
      specifications: Parts.specifications,
      images: Parts.images,
      price: Parts.price,
      discount: Parts.discount,
      costPrice: Parts.costPrice,
      weight: Parts.weight,
      dimensions: Parts.dimensions,
      minimumStock: Parts.minimumStock,
      isActive: Parts.isActive,
      createdAt: Parts.createdAt,
      updatedAt: Parts.updatedAt,
      createdBy: {
        id: Users.id,
        firstName: Users.firstName,
        lastName: Users.lastName,
      },
    })
    .from(Parts)
    .leftJoin(Users, eq(Parts.createdBy, Users.id))
    .where(eq(Parts.id, partId));

  return part;
}

/**
 * Get part by part number
 */
export async function getPartByPartNumber(partNumber: string) {
  const [part] = await db
    .select()
    .from(Parts)
    .where(eq(Parts.partNumber, partNumber));

  return part;
}

/**
 * Search parts by name, part number, or description
 */
export async function searchParts(
  searchTerm: string,
  page: number = 1,
  limit: number = 20
) {
  const offset = (page - 1) * limit;
  const searchPattern = `%${searchTerm}%`;

  const parts = await db
    .select({
      id: Parts.id,
      partNumber: Parts.partNumber,
      name: Parts.name,
      description: Parts.description,
      brand: Parts.brand,
      category: Parts.category,
      price: Parts.price,
      discount: Parts.discount,
      images: Parts.images,
      isActive: Parts.isActive,
    })
    .from(Parts)
    .where(
      and(
        eq(Parts.isActive, true),
        or(
          like(Parts.name, searchPattern),
          like(Parts.partNumber, searchPattern),
          like(Parts.description, searchPattern),
          like(Parts.brand, searchPattern)
        )
      )
    )
    .limit(limit)
    .offset(offset)
    .orderBy(asc(Parts.name));

  return parts;
}

/**
 * Get parts by category
 */
export async function getPartsByCategory(category: string, subcategory?: string) {
  let whereConditions = [
    eq(Parts.category, category),
    eq(Parts.isActive, true),
  ];

  if (subcategory) {
    whereConditions.push(eq(Parts.subcategory, subcategory));
  }

  const parts = await db
    .select({
      id: Parts.id,
      partNumber: Parts.partNumber,
      name: Parts.name,
      brand: Parts.brand,
      subcategory: Parts.subcategory,
      price: Parts.price,
      discount: Parts.discount,
      images: Parts.images,
    })
    .from(Parts)
    .where(and(...whereConditions))
    .orderBy(asc(Parts.name));

  return parts;
}

/**
 * Get parts by brand
 */
export async function getPartsByBrand(brand: string) {
  const parts = await db
    .select({
      id: Parts.id,
      partNumber: Parts.partNumber,
      name: Parts.name,
      category: Parts.category,
      subcategory: Parts.subcategory,
      price: Parts.price,
      discount: Parts.discount,
      images: Parts.images,
    })
    .from(Parts)
    .where(and(eq(Parts.brand, brand), eq(Parts.isActive, true)))
    .orderBy(asc(Parts.name));

  return parts;
}

/**
 * Get parts with low stock
 */
export async function getLowStockParts() {
  // Get parts where available quantity is below minimum stock
  const lowStockParts = await db
    .select({
      part: {
        id: Parts.id,
        partNumber: Parts.partNumber,
        name: Parts.name,
        brand: Parts.brand,
        minimumStock: Parts.minimumStock,
      },
      availableStock: count(PartItems.id),
    })
    .from(Parts)
    .leftJoin(
      PartItems,
      and(eq(Parts.id, PartItems.partId), eq(PartItems.status, "available"))
    )
    .where(eq(Parts.isActive, true))
    .groupBy(
      Parts.id,
      Parts.partNumber,
      Parts.name,
      Parts.brand,
      Parts.minimumStock
    )
    .having(({ availableStock, part }) =>
      lte(availableStock, part.minimumStock)
    )
    .orderBy(asc(Parts.name));

  return lowStockParts;
}

/**
 * Get parts with stock levels
 */
export async function getPartsWithStock() {
  const partsWithStock = await db
    .select({
      id: Parts.id,
      partNumber: Parts.partNumber,
      name: Parts.name,
      brand: Parts.brand,
      category: Parts.category,
      price: Parts.price,
      minimumStock: Parts.minimumStock,
      totalStock: count(PartItems.id),
      // availableStock: sum(),
      // Count only available items
      // This is a simplified approach, you might need to use a subquery
    })
    .from(Parts)
    .leftJoin(PartItems, eq(Parts.id, PartItems.partId))
    .where(eq(Parts.isActive, true))
    .groupBy(
      Parts.id,
      Parts.partNumber,
      Parts.name,
      Parts.brand,
      Parts.category,
      Parts.price,
      Parts.minimumStock
    )
    .orderBy(asc(Parts.name));

  return partsWithStock;
}

/**
 * Get featured/popular parts
 */
export async function getFeaturedParts(limit: number = 10) {
  // Parts with the most sales (you might need to adjust based on your business logic)
  const featuredParts = await db
    .select({
      id: Parts.id,
      partNumber: Parts.partNumber,
      name: Parts.name,
      brand: Parts.brand,
      price: Parts.price,
      discount: Parts.discount,
      images: Parts.images,
      salesCount: count(PartItems.id),
    })
    .from(Parts)
    .leftJoin(
      PartItems,
      and(eq(Parts.id, PartItems.partId), eq(PartItems.status, "sold"))
    )
    .where(eq(Parts.isActive, true))
    .groupBy(
      Parts.id,
      Parts.partNumber,
      Parts.name,
      Parts.brand,
      Parts.price,
      Parts.discount,
      Parts.images
    )
    .orderBy(desc(count(PartItems.id)))
    .limit(limit);

  return featuredParts;
}

/**
 * Get all categories and subcategories
 */
export async function getPartCategories() {
  const categories = await db
    .select({
      category: Parts.category,
      subcategory: Parts.subcategory,
      partCount: count(Parts.id),
    })
    .from(Parts)
    .where(eq(Parts.isActive, true))
    .groupBy(Parts.category, Parts.subcategory)
    .orderBy(asc(Parts.category), asc(Parts.subcategory));

  return categories;
}

/**
 * Get all brands
 */
export async function getPartBrands() {
  const brands = await db
    .select({
      brand: Parts.brand,
      partCount: count(Parts.id),
    })
    .from(Parts)
    .where(
      and(
        eq(Parts.isActive, true)
        // Exclude null brands
      )
    )
    .groupBy(Parts.brand)
    .orderBy(asc(Parts.brand));

  return brands;
}

// ==================== UPDATE OPERATIONS ====================

/**
 * Update part
 */
export async function updatePart(
  partId: string,
  updateData: Partial<Omit<Part, "id" | "createdAt" | "updatedAt">>
) {
  const [updatedPart] = await db
    .update(Parts)
    .set({
      ...updateData,
      updatedAt: new Date(),
    })
    .where(eq(Parts.id, partId))
    .returning();

  return updatedPart;
}

/**
 * Update part price
 */
export async function updatePartPrice(
  partId: string,
  price: number,
  discount?: number
) {
  const updateData: any = { price: price.toString(), updatedAt: new Date() };
  if (discount !== undefined) {
    updateData.discount = discount.toString();
  }

  const [updatedPart] = await db
    .update(Parts)
    .set(updateData)
    .where(eq(Parts.id, partId))
    .returning({
      id: Parts.id,
      partNumber: Parts.partNumber,
      price: Parts.price,
      discount: Parts.discount,
    });

  return updatedPart;
}

/**
 * Update part images
 */
export async function updatePartImages(partId: string, images: string[]) {
  const [updatedPart] = await db
    .update(Parts)
    .set({
      images: images,
      updatedAt: new Date(),
    })
    .where(eq(Parts.id, partId))
    .returning({
      id: Parts.id,
      partNumber: Parts.partNumber,
      images: Parts.images,
    });

  return updatedPart;
}

/**
 * Update part specifications
 */
export async function updatePartSpecifications(partId: string, specifications: any) {
  const [updatedPart] = await db
    .update(Parts)
    .set({
      specifications,
      updatedAt: new Date(),
    })
    .where(eq(Parts.id, partId))
    .returning({
      id: Parts.id,
      partNumber: Parts.partNumber,
      specifications: Parts.specifications,
    });

  return updatedPart;
}

/**
 * Update compatible models
 */
export async function updateCompatibleModels(
  partId: string,
  compatibleModels: string[]
) {
  const [updatedPart] = await db
    .update(Parts)
    .set({
      compatibleModels,
      updatedAt: new Date(),
    })
    .where(eq(Parts.id, partId))
    .returning({
      id: Parts.id,
      partNumber: Parts.partNumber,
      compatibleModels: Parts.compatibleModels,
    });

  return updatedPart;
}

/**
 * Activate/Deactivate part
 */
export async function togglePartStatus(partId: string, isActive: boolean) {
  const [updatedPart] = await db
    .update(Parts)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(Parts.id, partId))
    .returning({
      id: Parts.id,
      partNumber: Parts.partNumber,
      isActive: Parts.isActive,
    });

  return updatedPart;
}

// ==================== DELETE OPERATIONS ====================

/**
 * Soft delete part (deactivate)
 */
export async function softDeletePart(partId: string) {
  return await togglePartStatus(partId, false);
}

/**
 * Hard delete part (permanent)
 */
export async function deletePart(partId: string) {
  const [deletedPart] = await db
    .delete(Parts)
    .where(eq(Parts.id, partId))
    .returning({
      id: Parts.id,
      partNumber: Parts.partNumber,
    });

  return deletedPart;
}

// ==================== ANALYTICS OPERATIONS ====================

/**
 * Get part statistics
 */
export async function getPartStats() {
  const [totalParts] = await db.select({ count: count() }).from(Parts);

  const [activeParts] = await db
    .select({ count: count() })
    .from(Parts)
    .where(eq(Parts.isActive, true));

  const categoriesCount = await db
    .select({ 
      category: Parts.category,
      count: count() 
    })
    .from(Parts)
    .where(eq(Parts.isActive, true))
    .groupBy(Parts.category);

  const brandsCount = await db
    .select({ 
      brand: Parts.brand,
      count: count() 
    })
    .from(Parts)
    .where(eq(Parts.isActive, true))
    .groupBy(Parts.brand);

  return {
    totalParts: totalParts.count,
    activeParts: activeParts.count,
    inactiveParts: totalParts.count - activeParts.count,
    categoriesCount: categoriesCount.length,
    brandsCount: brandsCount.length,
    categories: categoriesCount,
    brands: brandsCount,
  };
}

/**
 * Get price range for parts
 */
export async function getPartPriceRange() {
  const [priceRange] = await db
    .select({
      minPrice: min(Parts.price),
      maxPrice: max(Parts.price),
      avgPrice: avg(Parts.price),
    })
    .from(Parts)
    .where(eq(Parts.isActive, true));

  return priceRange;
}

/**
 * Get parts by price range
 */
export async function getPartsByPriceRange(minPrice: number, maxPrice: number) {
  const parts = await db
    .select({
      id: Parts.id,
      partNumber: Parts.partNumber,
      name: Parts.name,
      brand: Parts.brand,
      price: Parts.price,
      discount: Parts.discount,
    })
    .from(Parts)
    .where(
      and(
        eq(Parts.isActive, true),
        gte(Parts.price, minPrice.toString()),
        lte(Parts.price, maxPrice.toString())
      )
    )
    .orderBy(asc(Parts.price));

  return parts;
}

/**
 * Get recently added parts
 */
export async function getRecentParts(days: number = 7, limit: number = 10) {
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - days);

  const recentParts = await db
    .select({
      id: Parts.id,
      partNumber: Parts.partNumber,
      name: Parts.name,
      brand: Parts.brand,
      category: Parts.category,
      price: Parts.price,
      createdAt: Parts.createdAt,
      createdBy: {
        firstName: Users.firstName,
        lastName: Users.lastName,
      },
    })
    .from(Parts)
    .leftJoin(Users, eq(Parts.createdBy, Users.id))
    .where(and(eq(Parts.isActive, true), gte(Parts.createdAt, daysAgo)))
    .orderBy(desc(Parts.createdAt))
    .limit(limit);

  return recentParts;
}

/**
 * Get top selling parts
 */
export async function getTopSellingParts(limit: number = 10) {
  const topParts = await db
    .select({
      part: {
        id: Parts.id,
        partNumber: Parts.partNumber,
        name: Parts.name,
        brand: Parts.brand,
        price: Parts.price,
      },
      salesCount: count(PartItems.id),
      totalRevenue: sum(Parts.price),
    })
    .from(Parts)
    .leftJoin(
      PartItems,
      and(eq(Parts.id, PartItems.partId), eq(PartItems.status, "sold"))
    )
    .where(eq(Parts.isActive, true))
    .groupBy(Parts.id, Parts.partNumber, Parts.name, Parts.brand, Parts.price)
    .orderBy(desc(count(PartItems.id)))
    .limit(limit);

  return topParts;
}

// ==================== VALIDATION OPERATIONS ====================

/**
 * Check if part number exists
 */
export async function partNumberExists(partNumber: string, excludeId?: string) {
  const conditions = [
    eq(Parts.partNumber, partNumber),
    excludeId ? ne(Parts.id, excludeId) : undefined,
  ].filter(Boolean) as SQL<unknown>[]; // <- ensures no undefined

  const [part] = await db
    .select({ id: Parts.id })
    .from(Parts)
    .where(and(...conditions))
    .limit(1);

  return !!part;
}

/**
 * Validate part data
 */
export async function validatePartData(partData: Partial<NewPart>) {
  const errors: string[] = [];

  if (partData.partNumber) {
    const exists = await partNumberExists(partData.partNumber);
    if (exists) {
      errors.push("Part number already exists");
    }
  }

  if (partData.price && parseFloat(partData.price) <= 0) {
    errors.push("Price must be greater than 0");
  }

  if (
    partData.discount &&
    (parseFloat(partData.discount) < 0 || parseFloat(partData.discount) > 100)
  ) {
    errors.push("Discount must be between 0 and 100");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ==================== ADVANCED QUERIES ====================

/**
 * Get parts with detailed stock information
 */
export async function getPartsWithDetailedStock() {
  const partsWithStock = await db
    .select({
      id: Parts.id,
      partNumber: Parts.partNumber,
      name: Parts.name,
      brand: Parts.brand,
      category: Parts.category,
      price: Parts.price,
      minimumStock: Parts.minimumStock,
      totalStock: count(PartItems.id),
    })
    .from(Parts)
    .leftJoin(PartItems, eq(Parts.id, PartItems.partId))
    .where(eq(Parts.isActive, true))
    .groupBy(
      Parts.id,
      Parts.partNumber,
      Parts.name,
      Parts.brand,
      Parts.category,
      Parts.price,
      Parts.minimumStock
    )
    .orderBy(asc(Parts.name));

  // Get available stock separately
  const availableStockQuery = await db
    .select({
      partId: PartItems.partId,
      availableStock: count(PartItems.id),
    })
    .from(PartItems)
    .where(eq(PartItems.status, "available"))
    .groupBy(PartItems.partId);

  // Merge the results
  const stockMap = new Map(
    availableStockQuery.map(item => [item.partId, item.availableStock])
  );

  return partsWithStock.map(part => ({
    ...part,
    availableStock: stockMap.get(part.id) || 0,
  }));
}

/**
 * Get parts inventory summary
 */
export async function getPartsInventorySummary() {
  const totalValue = await db
    .select({
      totalInventoryValue: sum(Parts.price),
      averagePrice: avg(Parts.price),
      totalParts: count(Parts.id),
    })
    .from(Parts)
    .where(eq(Parts.isActive, true));

  const categoryBreakdown = await db
    .select({
      category: Parts.category,
      count: count(Parts.id),
      totalValue: sum(Parts.price),
    })
    .from(Parts)
    .where(eq(Parts.isActive, true))
    .groupBy(Parts.category)
    .orderBy(desc(sum(Parts.price)));

  const brandBreakdown = await db
    .select({
      brand: Parts.brand,
      count: count(Parts.id),
      totalValue: sum(Parts.price),
    })
    .from(Parts)
    .where(eq(Parts.isActive, true))
    .groupBy(Parts.brand)
    .orderBy(desc(sum(Parts.price)));

  return {
    summary: totalValue[0],
    categoryBreakdown,
    brandBreakdown,
  };
}