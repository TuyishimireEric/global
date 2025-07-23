import { NextRequest, NextResponse } from "next/server";
import { quotationQueries } from "@/server/queries/quotation";
import { getUserToken } from "@/utils/getToken";
import { HttpStatusCode } from "axios";

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

    const result = await quotationQueries.convertToInvoice(params.id, userId);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error converting to invoice:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
