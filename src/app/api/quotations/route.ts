import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { HttpStatusCode } from "axios";
import { getUserToken } from "@/utils/getToken";
import { quotationQueries } from "@/server/queries/quotation";

const createQuotationSchema = z.object({
  quotation: z.object({
    quotationNumber: z.string().min(1),
    companyId: z.string().uuid().nullable().optional(),
    customerName: z.string().nullable().optional(),
    customerEmail: z.string().email().nullable().optional(),
    customerPhone: z.string().nullable().optional(),
    customerAddress: z.string().nullable().optional(),
    subtotal: z.number().positive(),
    taxAmount: z.number().min(0).default(0),
    discountAmount: z.number().min(0).default(0),
    shippingAmount: z.number().min(0).default(0),
    totalAmount: z.number().positive(),
    validUntil: z.string().datetime().nullable().optional(),
    paymentTerms: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    internalNotes: z.string().nullable().optional(),
  }),
  items: z
    .array(
      z.object({
        partId: z.string().uuid(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
        discount: z.number().min(0).max(100).default(0),
        totalPrice: z.number().positive(),
        notes: z.string().nullable().optional(),
      })
    )
    .min(1),
});

const quotationFiltersSchema = z.object({
  status: z
    .enum([
      "draft",
      "pending",
      "confirmed",
      "cancelled",
      "expired",
      "invoiced",
      "sold",
    ])
    .optional(),
  companyId: z.string().uuid().optional(),
  customerEmail: z.string().email().optional(),
  createdBy: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  minAmount: z.coerce.number().positive().optional(),
  maxAmount: z.coerce.number().positive().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  orderBy: z
    .enum(["createdAt", "updatedAt", "totalAmount", "quotationNumber"])
    .default("createdAt"),
  orderDirection: z.enum(["asc", "desc"]).default("desc"),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await getUserToken(request);

    if (!userId) {
      return NextResponse.json(
        { status: "Error", data: null, message: "Unauthorized" },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const filters = quotationFiltersSchema.parse({
      status: searchParams.get("status"),
      companyId: searchParams.get("companyId"),
      customerEmail: searchParams.get("customerEmail"),
      createdBy: searchParams.get("createdBy"),
      dateFrom: searchParams.get("dateFrom"),
      dateTo: searchParams.get("dateTo"),
      minAmount: searchParams.get("minAmount"),
      maxAmount: searchParams.get("maxAmount"),
      search: searchParams.get("search"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      orderBy: searchParams.get("orderBy"),
      orderDirection: searchParams.get("orderDirection"),
    });

    // Convert date strings to Date objects
    const processedFilters = {
      ...filters,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
    };

    const { page, limit, orderBy, orderDirection, ...queryFilters } =
      processedFilters;

    const result = await quotationQueries.list(queryFilters, {
      page,
      limit,
      orderBy,
      orderDirection,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching quotations:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid parameters", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await getUserToken(request);

    if (!userId) {
      return NextResponse.json(
        { status: "Error", data: null, message: "Unauthorized" },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const body = await request.json();
    const validatedData = createQuotationSchema.parse(body);

    if (!validatedData.quotation.quotationNumber) {
      validatedData.quotation.quotationNumber = `QT-${Date.now()}`;
    }

    // Convert numeric fields to strings for the quotation
    const quotationData = {
      ...validatedData.quotation,
      subtotal: validatedData.quotation.subtotal.toString(),
      taxAmount: validatedData.quotation.taxAmount.toString(),
      discountAmount: validatedData.quotation.discountAmount.toString(),
      shippingAmount: validatedData.quotation.shippingAmount.toString(),
      totalAmount: validatedData.quotation.totalAmount.toString(),
      createdBy: userId,
      status: "draft" as const,
      validUntil: validatedData.quotation.validUntil
        ? new Date(validatedData.quotation.validUntil)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
    };

    // Convert numeric fields to strings for items
    const itemsData = validatedData.items.map((item) => ({
      ...item,
      unitPrice: item.unitPrice.toString(),
      totalPrice: item.totalPrice.toString(),
      discount: item.discount.toString(),
    }));

    const result = await quotationQueries.create({
      quotation: quotationData,
      items: itemsData,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating quotation:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
