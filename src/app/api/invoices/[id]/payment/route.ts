import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { invoiceQueries } from "@/server/queries/quotation";
import { db } from "@/server/db";
import { Invoices } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { getUserToken } from "@/utils/getToken";
import { HttpStatusCode } from "axios";

const paymentSchema = z.object({
  amount: z.number().positive(),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
  paymentDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// POST /api/invoices/[id]/payment - Record payment
export async function POST(
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
    const validatedData = paymentSchema.parse(body);

    const updated = await invoiceQueries.recordPayment(
      params.id,
      validatedData.amount,
      userId
    );

    // You might want to create a payment record here for audit trail
    // await createPaymentRecord({ invoiceId: params.id, ...validatedData });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error recording payment:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payment data", details: error.issues },
        { status: 400 }
      );
    }
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
