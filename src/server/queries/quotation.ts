import {
  eq,
  desc,
  asc,
  and,
  or,
  gte,
  lte,
  like,
  inArray,
  isNull,
  isNotNull,
  sql,
} from "drizzle-orm";
import { db } from "../db"; // Assuming you have a db instance
import {
  Quotations,
  QuotationItems,
  Invoices,
  InvoiceItems,
  Parts,
  Companies,
  Users,
  PartItems,
  type Quotation,
  type QuotationItem,
  type Invoice,
  type InvoiceItem,
  type NewQuotation,
  type NewQuotationItem,
  type NewInvoice,
  type NewInvoiceItem,
} from "../db/schema";

// ===== TYPES =====

// Quotation with related data
export type QuotationWithItems = Quotation & {
  items: (QuotationItem & {
    part: {
      id: string;
      partNumber: string;
      name: string;
      brand: string | null;
    };
  })[];
  company: {
    id: string;
    name: string;
    email: string | null;
    phoneNumber: string | null;
  } | null;
  createdByUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

// Invoice with related data
export type InvoiceWithItems = Invoice & {
  items: (InvoiceItem & {
    part: {
      id: string;
      partNumber: string;
      name: string;
      brand: string | null;
    };
  })[];
  quotation: {
    id: string;
    quotationNumber: string;
    customerName: string | null;
    customerEmail: string | null;
  };
  company: {
    id: string;
    name: string;
    email: string | null;
    phoneNumber: string | null;
  } | null;
  createdByUser: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
};

// Query filters
export type QuotationFilters = {
  status?: string;
  companyId?: string;
  customerEmail?: string;
  createdBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string; // Search in quotation number, customer name, email
};

export type InvoiceFilters = {
  paymentStatus?: string;
  companyId?: string;
  quotationId?: string;
  createdBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  search?: string; // Search in invoice number
};

// Pagination
export type PaginationParams = {
  page?: number;
  limit?: number;
  orderBy?:
    | "createdAt"
    | "updatedAt"
    | "totalAmount"
    | "quotationNumber"
    | "invoiceNumber";
  orderDirection?: "asc" | "desc";
};

export type PaginatedResult<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

// ===== QUOTATION QUERIES =====

export const quotationQueries = {
  // Create a new quotation with items
  async create(data: {
    quotation: NewQuotation;
    items: Omit<NewQuotationItem, "quotationId" | "createdAt" | "updatedAt">[];
  }) {
    return await db.transaction(async (tx) => {
      // Insert quotation
      const [quotation] = await tx
        .insert(Quotations)
        .values(data.quotation)
        .returning();

      // Insert quotation items
      const items = await tx
        .insert(QuotationItems)
        .values(
          data.items.map((item) => ({
            ...item,
            quotationId: quotation.id,
          }))
        )
        .returning();

      return { quotation, items };
    });
  },

  // Get quotation by ID with all related data
  async getById(id: string): Promise<QuotationWithItems | null> {
    const result = await db
      .select({
        quotation: Quotations,
        item: QuotationItems,
        part: {
          id: Parts.id,
          partNumber: Parts.partNumber,
          name: Parts.name,
          brand: Parts.brand,
        },
        company: {
          id: Companies.id,
          name: Companies.name,
          email: Companies.email,
          phoneNumber: Companies.phoneNumber,
        },
        createdByUser: {
          id: Users.id,
          firstName: Users.firstName,
          lastName: Users.lastName,
          email: Users.email,
        },
      })
      .from(Quotations)
      .leftJoin(QuotationItems, eq(QuotationItems.quotationId, Quotations.id))
      .leftJoin(Parts, eq(Parts.id, QuotationItems.partId))
      .leftJoin(Companies, eq(Companies.id, Quotations.companyId))
      .innerJoin(Users, eq(Users.id, Quotations.createdBy))
      .where(eq(Quotations.id, id));

    if (result.length === 0) return null;

    // Transform the flat result into nested structure
    const quotationData = result[0].quotation;
    const items = result
      .filter((r) => r.item !== null)
      .map((r) => ({
        ...r.item!,
        part: r.part!,
      }));

    return {
      ...quotationData,
      items,
      company: result[0].company,
      createdByUser: result[0].createdByUser,
    };
  },

  // Get paginated list of quotations with filters
  async list(
    filters: QuotationFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<QuotationWithItems>> {
    const {
      page = 1,
      limit = 20,
      orderBy = "createdAt",
      orderDirection = "desc",
    } = pagination;

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];

    if (filters.status) {
      whereConditions.push(eq(Quotations.status, filters.status as any));
    }
    if (filters.companyId) {
      whereConditions.push(eq(Quotations.companyId, filters.companyId));
    }
    if (filters.customerEmail) {
      whereConditions.push(eq(Quotations.customerEmail, filters.customerEmail));
    }
    if (filters.createdBy) {
      whereConditions.push(eq(Quotations.createdBy, filters.createdBy));
    }
    if (filters.dateFrom) {
      whereConditions.push(gte(Quotations.createdAt, filters.dateFrom));
    }
    if (filters.dateTo) {
      whereConditions.push(lte(Quotations.createdAt, filters.dateTo));
    }
    if (filters.minAmount) {
      whereConditions.push(
        gte(Quotations.totalAmount, filters.minAmount.toString())
      );
    }
    if (filters.maxAmount) {
      whereConditions.push(
        lte(Quotations.totalAmount, filters.maxAmount.toString())
      );
    }
    if (filters.search) {
      whereConditions.push(
        or(
          like(Quotations.quotationNumber, `%${filters.search}%`),
          like(Quotations.customerName, `%${filters.search}%`),
          like(Quotations.customerEmail, `%${filters.search}%`)
        )
      );
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(Quotations)
      .where(whereClause);

    // Get quotations
    const quotations = await db
      .select({
        quotation: Quotations,
        company: Companies,
        createdByUser: Users,
      })
      .from(Quotations)
      .leftJoin(Companies, eq(Companies.id, Quotations.companyId))
      .innerJoin(Users, eq(Users.id, Quotations.createdBy))
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    // Get items for all quotations
    const quotationIds = quotations.map((q) => q.quotation.id);
    const items =
      quotationIds.length > 0
        ? await db
            .select({
              item: QuotationItems,
              part: Parts,
            })
            .from(QuotationItems)
            .innerJoin(Parts, eq(Parts.id, QuotationItems.partId))
            .where(inArray(QuotationItems.quotationId, quotationIds))
        : [];

    // Group items by quotation
    const itemsByQuotation = items.reduce((acc, { item, part }) => {
      if (!acc[item.quotationId]) acc[item.quotationId] = [];
      acc[item.quotationId].push({ ...item, part });
      return acc;
    }, {} as Record<string, any[]>);

    // Combine data
    const data = quotations.map(({ quotation, company, createdByUser }) => ({
      ...quotation,
      items: itemsByQuotation[quotation.id] || [],
      company,
      createdByUser,
    }));

    return {
      data,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  },

  // Update quotation status
  async updateStatus(
    id: string,
    status: "confirmed" | "cancelled" | "expired",
    userId: string
  ) {
    const updateData: any = {
      status,
      updatedBy: userId,
      updatedAt: new Date(),
    };

    if (status === "confirmed") {
      updateData.confirmedBy = userId;
      updateData.confirmedAt = new Date();
    }

    return await db
      .update(Quotations)
      .set(updateData)
      .where(eq(Quotations.id, id))
      .returning();
  },

  // Convert quotation to invoice
  async convertToInvoice(quotationId: string, userId: string) {
    return await db.transaction(async (tx) => {
      // Get quotation with items
      const quotation = await quotationQueries.getById(quotationId);
      if (!quotation) throw new Error("Quotation not found");
      if (quotation.status !== "confirmed")
        throw new Error("Only confirmed quotations can be invoiced");

      // Generate invoice number (implement your logic)
      const invoiceNumber = `INV-${Date.now()}`;

      // Create invoice
      const [invoice] = await tx
        .insert(Invoices)
        .values({
          invoiceNumber,
          quotationId,
          companyId: quotation.companyId,
          subtotal: quotation.subtotal,
          taxAmount: quotation.taxAmount,
          discountAmount: quotation.discountAmount,
          shippingAmount: quotation.shippingAmount,
          totalAmount: quotation.totalAmount,
          balanceAmount: quotation.totalAmount,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          createdBy: userId,
        })
        .returning();

      // Create invoice items
      const invoiceItems = await tx
        .insert(InvoiceItems)
        .values(
          quotation.items.map((item) => ({
            invoiceId: invoice.id,
            quotationItemId: item.id,
            partId: item.partId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            totalPrice: item.totalPrice,
          }))
        )
        .returning();

      // Update quotation status
      await tx
        .update(Quotations)
        .set({
          status: "invoiced",
          invoicedAt: new Date(),
          updatedBy: userId,
          updatedAt: new Date(),
        })
        .where(eq(Quotations.id, quotationId));

      return { invoice, invoiceItems };
    });
  },

  // Get quotations expiring soon
  async getExpiringSoon(days: number = 7) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    return await db
      .select()
      .from(Quotations)
      .where(
        and(
          eq(Quotations.status, "pending"),
          lte(Quotations.validUntil, expiryDate),
          gte(Quotations.validUntil, new Date())
        )
      )
      .orderBy(asc(Quotations.validUntil));
  },

  // Get quotation statistics
  async getStatistics(
    filters: { dateFrom?: Date; dateTo?: Date; companyId?: string } = {}
  ) {
    const whereConditions = [];

    if (filters.dateFrom) {
      whereConditions.push(gte(Quotations.createdAt, filters.dateFrom));
    }
    if (filters.dateTo) {
      whereConditions.push(lte(Quotations.createdAt, filters.dateTo));
    }
    if (filters.companyId) {
      whereConditions.push(eq(Quotations.companyId, filters.companyId));
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const stats = await db
      .select({
        status: Quotations.status,
        count: sql<number>`count(*)`,
        totalAmount: sql<number>`sum(${Quotations.totalAmount})`,
      })
      .from(Quotations)
      .where(whereClause)
      .groupBy(Quotations.status);

    return stats;
  },
};

// ===== INVOICE QUERIES =====

export const invoiceQueries = {
  // Get invoice by ID with all related data
  async getById(id: string): Promise<InvoiceWithItems | null> {
    const result = await db
      .select({
        invoice: Invoices,
        item: InvoiceItems,
        part: {
          id: Parts.id,
          partNumber: Parts.partNumber,
          name: Parts.name,
          brand: Parts.brand,
        },
        quotation: {
          id: Quotations.id,
          quotationNumber: Quotations.quotationNumber,
          customerName: Quotations.customerName,
          customerEmail: Quotations.customerEmail,
        },
        company: {
          id: Companies.id,
          name: Companies.name,
          email: Companies.email,
          phoneNumber: Companies.phoneNumber,
        },
        createdByUser: {
          id: Users.id,
          firstName: Users.firstName,
          lastName: Users.lastName,
          email: Users.email,
        },
      })
      .from(Invoices)
      .leftJoin(InvoiceItems, eq(InvoiceItems.invoiceId, Invoices.id))
      .leftJoin(Parts, eq(Parts.id, InvoiceItems.partId))
      .innerJoin(Quotations, eq(Quotations.id, Invoices.quotationId))
      .leftJoin(Companies, eq(Companies.id, Invoices.companyId))
      .innerJoin(Users, eq(Users.id, Invoices.createdBy))
      .where(eq(Invoices.id, id));

    if (result.length === 0) return null;

    // Transform the flat result into nested structure
    const invoiceData = result[0].invoice;
    const items = result
      .filter((r) => r.item !== null)
      .map((r) => ({
        ...r.item!,
        part: r.part!,
      }));

    return {
      ...invoiceData,
      items,
      quotation: result[0].quotation,
      company: result[0].company,
      createdByUser: result[0].createdByUser,
    };
  },

  // Get paginated list of invoices with filters
  async list(
    filters: InvoiceFilters = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<Invoice>> {
    const {
      page = 1,
      limit = 20,
      orderBy = "createdAt",
      orderDirection = "desc",
    } = pagination;

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions = [];

    if (filters.paymentStatus) {
      whereConditions.push(eq(Invoices.paymentStatus, filters.paymentStatus));
    }
    if (filters.companyId) {
      whereConditions.push(eq(Invoices.companyId, filters.companyId));
    }
    if (filters.quotationId) {
      whereConditions.push(eq(Invoices.quotationId, filters.quotationId));
    }
    if (filters.createdBy) {
      whereConditions.push(eq(Invoices.createdBy, filters.createdBy));
    }
    if (filters.dateFrom) {
      whereConditions.push(gte(Invoices.createdAt, filters.dateFrom));
    }
    if (filters.dateTo) {
      whereConditions.push(lte(Invoices.createdAt, filters.dateTo));
    }
    if (filters.dueDateFrom) {
      whereConditions.push(gte(Invoices.dueDate, filters.dueDateFrom));
    }
    if (filters.dueDateTo) {
      whereConditions.push(lte(Invoices.dueDate, filters.dueDateTo));
    }
    if (filters.minAmount) {
      whereConditions.push(
        gte(Invoices.totalAmount, filters.minAmount.toString())
      );
    }
    if (filters.maxAmount) {
      whereConditions.push(
        lte(Invoices.totalAmount, filters.maxAmount.toString())
      );
    }
    if (filters.search) {
      whereConditions.push(like(Invoices.invoiceNumber, `%${filters.search}%`));
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(Invoices)
      .where(whereClause);

    // Get invoices
    const data = await db
      .select()
      .from(Invoices)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    return {
      data,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  },

  // Record payment for invoice
  async recordPayment(invoiceId: string, amount: number, userId: string) {
    return await db.transaction(async (tx) => {
      // Get current invoice
      const [invoice] = await tx
        .select()
        .from(Invoices)
        .where(eq(Invoices.id, invoiceId));

      if (!invoice) throw new Error("Invoice not found");

      const newPaidAmount = parseFloat(invoice.paidAmount ?? "") + amount;
      const newBalanceAmount = parseFloat(invoice.totalAmount) - newPaidAmount;

      let paymentStatus = "partial";
      if (newBalanceAmount <= 0) {
        paymentStatus = "paid";
      }

      // Update invoice
      const [updated] = await tx
        .update(Invoices)
        .set({
          paidAmount: newPaidAmount.toString(),
          balanceAmount: newBalanceAmount.toString(),
          paymentStatus,
          updatedAt: new Date(),
        })
        .where(eq(Invoices.id, invoiceId))
        .returning();

      return updated;
    });
  },

  // Get overdue invoices
  async getOverdue() {
    return await db
      .select({
        invoice: Invoices,
        quotation: Quotations,
        company: Companies,
      })
      .from(Invoices)
      .innerJoin(Quotations, eq(Quotations.id, Invoices.quotationId))
      .leftJoin(Companies, eq(Companies.id, Invoices.companyId))
      .where(
        and(
          lte(Invoices.dueDate, new Date()),
          or(
            eq(Invoices.paymentStatus, "pending"),
            eq(Invoices.paymentStatus, "partial")
          )
        )
      )
      .orderBy(asc(Invoices.dueDate));
  },

  // Get invoice statistics
  async getStatistics(
    filters: { dateFrom?: Date; dateTo?: Date; companyId?: string } = {}
  ) {
    const whereConditions = [];

    if (filters.dateFrom) {
      whereConditions.push(gte(Invoices.createdAt, filters.dateFrom));
    }
    if (filters.dateTo) {
      whereConditions.push(lte(Invoices.createdAt, filters.dateTo));
    }
    if (filters.companyId) {
      whereConditions.push(eq(Invoices.companyId, filters.companyId));
    }

    const whereClause =
      whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const stats = await db
      .select({
        paymentStatus: Invoices.paymentStatus,
        count: sql<number>`count(*)`,
        totalAmount: sql<number>`sum(${Invoices.totalAmount})`,
        paidAmount: sql<number>`sum(${Invoices.paidAmount})`,
        balanceAmount: sql<number>`sum(${Invoices.balanceAmount})`,
      })
      .from(Invoices)
      .where(whereClause)
      .groupBy(Invoices.paymentStatus);

    const overdueStat = await db
      .select({
        count: sql<number>`count(*)`,
        totalAmount: sql<number>`sum(${Invoices.balanceAmount})`,
      })
      .from(Invoices)
      .where(
        and(
          whereClause,
          lte(Invoices.dueDate, new Date()),
          or(
            eq(Invoices.paymentStatus, "pending"),
            eq(Invoices.paymentStatus, "partial")
          )
        )
      );

    return {
      byStatus: stats,
      overdue: overdueStat[0],
    };
  },

  // Get revenue by period
  async getRevenueByPeriod(
    period: "day" | "week" | "month" | "year",
    filters: { dateFrom?: Date; dateTo?: Date; companyId?: string } = {}
  ) {
    const whereConditions = [eq(Invoices.paymentStatus, "paid")];

    if (filters.dateFrom) {
      whereConditions.push(gte(Invoices.createdAt, filters.dateFrom));
    }
    if (filters.dateTo) {
      whereConditions.push(lte(Invoices.createdAt, filters.dateTo));
    }
    if (filters.companyId) {
      whereConditions.push(eq(Invoices.companyId, filters.companyId));
    }

    const dateFormat = {
      day: "%Y-%m-%d",
      week: "%Y-%W",
      month: "%Y-%m",
      year: "%Y",
    }[period];

    const result = await db
      .select({
        period: sql<string>`DATE_FORMAT(${Invoices.createdAt}, '${dateFormat}')`,
        revenue: sql<number>`sum(${Invoices.totalAmount})`,
        count: sql<number>`count(*)`,
      })
      .from(Invoices)
      .where(and(...whereConditions))
      .groupBy(sql`DATE_FORMAT(${Invoices.createdAt}, '${dateFormat}')`)
      .orderBy(sql`DATE_FORMAT(${Invoices.createdAt}, '${dateFormat}')`);

    return result;
  },
};
