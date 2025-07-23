import { NextRequest, NextResponse } from "next/server";
import { quotationQueries } from "@/server/queries/quotation";
import { Quotations } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { HttpStatusCode } from "axios";
import { getUserToken } from "@/utils/getToken";
import { db } from "@/server/db";

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

    const quotation = await quotationQueries.getById(params.id);

    if (!quotation) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(quotation);
  } catch (error) {
    console.error("Error fetching quotation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/quotations/[id] - Update quotation
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

    // Check if quotation exists
    const [existing] = await db
      .select()
      .from(Quotations)
      .where(eq(Quotations.id, params.id));

    if (!existing) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 }
      );
    }

    // Don't allow editing confirmed/invoiced quotations
    if (["confirmed", "invoiced", "sold"].includes(existing.status)) {
      return NextResponse.json(
        {
          error: "Cannot edit quotation with status: " + existing.status,
        },
        { status: 400 }
      );
    }

    // Update quotation
    const [updated] = await db
      .update(Quotations)
      .set({
        ...body,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(Quotations.id, params.id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating quotation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
