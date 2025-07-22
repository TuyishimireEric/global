import {
  PartItems,
  Parts,
  Companies,
  Users,
  Quotations,
} from "@/server/db/schema";
import { eq, and, or, like, desc, asc } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db";

// Types
export type PartItem = typeof PartItems.$inferSelect;
export type NewPartItem = typeof PartItems.$inferInsert;

// Get the actual enum values from your schema - these match your partItemStatusEnum
const statusValues = ["available", "sold", "damaged", "reserved"] as const;
const conditionValues = ["new", "refurbished", "used"] as const;

export const partItemSchema = z.object({
  partId: z.string().uuid(),
  barCode: z.string().max(100).optional(),
  serialNumber: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  shelveLocation: z.string().max(100).optional(),
  supplierId: z.string().uuid().optional(),
  purchasePrice: z.string().optional(),
  purchaseDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  warrantyPeriod: z.number().int().min(0).optional(),
  condition: z.enum(conditionValues).default("new"),
  status: z.enum(statusValues).default("available"),
  quotationId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export const updatePartItemSchema = partItemSchema.partial().extend({
  id: z.string().uuid(),
  updatedBy: z.string().uuid(),
});

export const bulkInsertSchema = z.array(partItemSchema).min(1).max(100);

// Query options
export interface GetPartItemsOptions {
  partId?: string;
  supplierId?: string;
  status?: string;
  condition?: string;
  location?: string;
  barCode?: string;
  serialNumber?: string;
  search?: string;
  limit?: number;
  offset?: number;
  orderBy?: "addedOn" | "updatedOn" | "purchaseDate" | "expiryDate";
  orderDirection?: "asc" | "desc";
  includeRelations?: boolean;
}

// Create a new part item
export async function createPartItem(
  data: z.infer<typeof partItemSchema>,
  userId: string
) {
  const validatedData = partItemSchema.parse(data);

  const insertData: NewPartItem = {
    ...validatedData,
    purchaseDate: validatedData.purchaseDate
      ? new Date(validatedData.purchaseDate)
      : undefined,
    expiryDate: validatedData.expiryDate
      ? new Date(validatedData.expiryDate)
      : undefined,
    status: validatedData.status,
    condition: validatedData.condition,
    addedBy: userId,
  };

  const [newPartItem] = await db
    .insert(PartItems)
    .values(insertData)
    .returning();

  return newPartItem;
}

// Bulk insert part items
export async function bulkInsertPartItems(
  items: z.infer<typeof bulkInsertSchema>,
  userId: string
) {
  const validatedItems = bulkInsertSchema.parse(items);

  const insertData: NewPartItem[] = validatedItems.map((item) => ({
    ...item,
    purchaseDate: item.purchaseDate ? new Date(item.purchaseDate) : undefined,
    expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
    status: item.status,
    condition: item.condition,
    addedBy: userId
  }));

  const newPartItems = await db
    .insert(PartItems)
    .values(insertData)
    .returning();

  return newPartItems;
}
const partItemStatusValues = [
  "available",
  "sold",
  "damaged",
  "reserved",
] as const;
const partItemConditionValues = ["new", "refurbished", "used"] as const;

export type PartItemStatus = (typeof partItemStatusValues)[number];
export type PartItemCondition = (typeof partItemConditionValues)[number];

// Then modify your getPartItems function:
export async function getPartItems(options: GetPartItemsOptions = {}) {
  const {
    partId,
    supplierId,
    status,
    condition,
    location,
    barCode,
    serialNumber,
    search,
    limit = 50,
    offset = 0,
    orderBy = "addedOn",
    orderDirection = "desc",
    includeRelations = false,
  } = options;

  // Build where conditions
  const conditions = [];

  if (partId) conditions.push(eq(PartItems.partId, partId));
  if (supplierId) conditions.push(eq(PartItems.supplierId, supplierId));

  // Validate status enum
  if (status) {
    if (partItemStatusValues.includes(status as PartItemStatus)) {
      conditions.push(eq(PartItems.status, status as PartItemStatus));
    } else {
      throw new Error(`Invalid status value: ${status}`);
    }
  }

  // Validate condition enum
  if (condition) {
    if (partItemConditionValues.includes(condition as PartItemCondition)) {
      conditions.push(eq(PartItems.condition, condition as PartItemCondition));
    } else {
      throw new Error(`Invalid condition value: ${condition}`);
    }
  }

  if (location) conditions.push(eq(PartItems.location, location));
  if (barCode) conditions.push(eq(PartItems.barCode, barCode));
  if (serialNumber) conditions.push(eq(PartItems.serialNumber, serialNumber));

  if (search) {
    conditions.push(
      or(
        like(PartItems.barCode, `%${search}%`),
        like(PartItems.serialNumber, `%${search}%`),
        like(PartItems.location, `%${search}%`),
        like(PartItems.shelveLocation, `%${search}%`),
        like(PartItems.notes, `%${search}%`)
      )
    );
  }

  // Rest of your function remains the same...
  if (includeRelations) {
    const query = db
      .select()
      .from(PartItems)
      .leftJoin(Parts, eq(PartItems.partId, Parts.id))
      .leftJoin(Companies, eq(PartItems.supplierId, Companies.id))
      .leftJoin(Users, eq(PartItems.addedBy, Users.id))
      .leftJoin(Quotations, eq(PartItems.quotationId, Quotations.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(
        orderDirection === "desc"
          ? desc(PartItems[orderBy])
          : asc(PartItems[orderBy])
      )
      .limit(limit)
      .offset(offset);

    const partItems = await query;
    return partItems;
  } else {
    const query = db
      .select()
      .from(PartItems)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(
        orderDirection === "desc"
          ? desc(PartItems[orderBy])
          : asc(PartItems[orderBy])
      )
      .limit(limit)
      .offset(offset);

    const partItems = await query;
    return partItems;
  }
}

export async function getPartItemByBarcode(barcode: string) {
  const partItem = await db
    .select({
      id: PartItems.id,
      partId: PartItems.partId,
      supplierId: PartItems.supplierId,
      quotationId: PartItems.quotationId,
      status: PartItems.status,
      condition: PartItems.condition,
      location: PartItems.location,
      shelveLocation: PartItems.shelveLocation,
      barCode: PartItems.barCode,
      serialNumber: PartItems.serialNumber,
      purchasePrice: PartItems.purchasePrice,
      sellingPrice: Parts.price,
      notes: PartItems.notes,
      addedBy: PartItems.addedBy,
      addedOn: PartItems.addedOn,
      updatedBy: PartItems.updatedBy,
      updatedOn: PartItems.updatedOn,
      partName: Parts.name,
      partNumber: Parts.partNumber,
      partImage: Parts.images,
      supplierName: Companies.name,
      quotationNumber: Quotations.quotationNumber,
    })
    .from(PartItems)
    .leftJoin(Parts, eq(PartItems.partId, Parts.id))
    .leftJoin(Companies, eq(PartItems.supplierId, Companies.id))
    .leftJoin(Quotations, eq(PartItems.quotationId, Quotations.id))
    .where(eq(PartItems.barCode, barcode))
    .limit(1);

  return partItem;
}

// Update a part item
export async function updatePartItem(
  data: z.infer<typeof updatePartItemSchema>
) {
  const validatedData = updatePartItemSchema.parse(data);
  const { id, ...updateData } = validatedData;

  const updatePayload: Partial<NewPartItem> = {
    ...updateData,
    purchaseDate: updateData.purchaseDate
      ? new Date(updateData.purchaseDate)
      : undefined,
    expiryDate: updateData.expiryDate
      ? new Date(updateData.expiryDate)
      : undefined,
    status: updateData.status,
    condition: updateData.condition,
    updatedOn: new Date(),
  };

  const [updatedPartItem] = await db
    .update(PartItems)
    .set(updatePayload)
    .where(eq(PartItems.id, id))
    .returning();

  return updatedPartItem;
}

// Get part items by part ID
export async function getPartItemsByPartId(
  partId: string,
  options: Omit<GetPartItemsOptions, "partId"> = {}
) {
  return getPartItems({ ...options, partId });
}

// Get part items by supplier ID
export async function getPartItemsBySupplierId(
  supplierId: string,
  options: Omit<GetPartItemsOptions, "supplierId"> = {}
) {
  return getPartItems({ ...options, supplierId });
}

// Get part items by status
export async function getPartItemsByStatus(
  status: string,
  options: Omit<GetPartItemsOptions, "status"> = {}
) {
  return getPartItems({ ...options, status });
}

export const checkBarcode = async (barCode: string) => {
  const item = await db
    .select()
    .from(PartItems)
    .where(eq(PartItems.barCode, barCode))
    .limit(1);

  return item;
};
