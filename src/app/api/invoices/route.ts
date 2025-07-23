import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { invoiceQueries } from "@/server/queries/quotation";
import { getUserToken } from "@/utils/getToken";
import { HttpStatusCode } from "axios";

const invoiceFiltersSchema = z.object({
  paymentStatus: z.enum(["pending", "partial", "paid", "overdue"]).optional(),
  companyId: z.string().uuid().optional(),
  quotationId: z.string().uuid().optional(),
  createdBy: z.string().uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  dueDateFrom: z.string().datetime().optional(),
  dueDateTo: z.string().datetime().optional(),
  minAmount: z.coerce.number().positive().optional(),
  maxAmount: z.coerce.number().positive().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  orderBy: z
    .enum(["createdAt", "updatedAt", "totalAmount", "invoiceNumber"])
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

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters = invoiceFiltersSchema.parse({
      paymentStatus: searchParams.get("paymentStatus"),
      companyId: searchParams.get("companyId"),
      quotationId: searchParams.get("quotationId"),
      createdBy: searchParams.get("createdBy"),
      dateFrom: searchParams.get("dateFrom"),
      dateTo: searchParams.get("dateTo"),
      dueDateFrom: searchParams.get("dueDateFrom"),
      dueDateTo: searchParams.get("dueDateTo"),
      minAmount: searchParams.get("minAmount"),
      maxAmount: searchParams.get("maxAmount"),
      search: searchParams.get("search"),
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      orderBy: searchParams.get("orderBy"),
      orderDirection: searchParams.get("orderDirection"),
    });

    const processedFilters = {
      ...filters,
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
      dueDateFrom: filters.dueDateFrom
        ? new Date(filters.dueDateFrom)
        : undefined,
      dueDateTo: filters.dueDateTo ? new Date(filters.dueDateTo) : undefined,
    };

    const { page, limit, orderBy, orderDirection, ...queryFilters } =
      processedFilters;

    const result = await invoiceQueries.list(queryFilters, {
      page,
      limit,
      orderBy,
      orderDirection,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching invoices:", error);
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
