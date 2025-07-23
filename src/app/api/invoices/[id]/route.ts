import { NextRequest, NextResponse } from "next/server";
import { invoiceQueries } from "@/server/queries/quotation";
import { db } from "@/server/db";
import { Invoices } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getUserToken } from "@/utils/getToken";
import { HttpStatusCode } from "axios";

// GET /api/invoices/[id] - Get single invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getUserToken(request);

    if (!userId) {
      return NextResponse.json(
        { status: "Error", data: null, message: "Unauthorized" },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const invoice = await invoiceQueries.getById(params.id);

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/invoices/[id] - Update invoice (limited fields)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getUserToken(request);

    if (!userId) {
      return NextResponse.json(
        { status: "Error", data: null, message: "Unauthorized" },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const body = await request.json();

    // Check if invoice exists
    const [existing] = await db
      .select()
      .from(Invoices)
      .where(eq(Invoices.id, params.id));

    if (!existing) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Only allow updating certain fields
    const allowedFields = ["dueDate", "notes"];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update invoice
    const [updated] = await db
      .update(Invoices)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(Invoices.id, params.id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating invoice:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
