import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import {
  getPartById,
  updatePart,
  deletePart,
  softDeletePart,
} from "@/server/queries/parts";
import { getUserToken } from "@/utils/getToken";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getUserToken(req);

    // if (!userId) {
    //   return NextResponse.json(
    //     { status: "Error", data: null, message: "Unauthorized" },
    //     { status: HttpStatusCode.Unauthorized }
    //   );
    // }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { status: "Error", data: null, message: "Invalid part ID" },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const part = await getPartById(id);

    if (!part) {
      return NextResponse.json(
        { status: "Error", data: null, message: "Part not found" },
        { status: HttpStatusCode.NotFound }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Part fetched successfully!",
        data: part,
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { status: "Error", data: null, message: error.message },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getUserToken(req);

    if (!userId) {
      return NextResponse.json(
        { status: "Error", data: null, message: "Unauthorized" },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const { id } = params;
    const body = await req.json();

    if (!id) {
      return NextResponse.json(
        { status: "Error", data: null, message: "Invalid part ID" },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const updateData = {
      ...body,
      updatedBy: userId,
    };

    // Remove fields that shouldn't be updated this way
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.createdBy;

    const updatedPart = await updatePart(id, updateData);

    if (!updatedPart) {
      return NextResponse.json(
        { status: "Error", data: null, message: "Part not found" },
        { status: HttpStatusCode.NotFound }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Part updated successfully!",
        data: updatedPart,
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { status: "Error", data: null, message: error.message },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await getUserToken(req);

    if (!userId) {
      return NextResponse.json(
        { status: "Error", data: null, message: "Unauthorized" },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const { id } = params;
    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";

    if (!id) {
      return NextResponse.json(
        { status: "Error", data: null, message: "Invalid part ID" },
        { status: HttpStatusCode.BadRequest }
      );
    }

    let result;
    if (permanent) {
      result = await deletePart(id);
    } else {
      result = await softDeletePart(id);
    }

    if (!result) {
      return NextResponse.json(
        { status: "Error", data: null, message: "Part not found" },
        { status: HttpStatusCode.NotFound }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: permanent
          ? "Part permanently deleted successfully!"
          : "Part deactivated successfully!",
        data: result,
      },
      { status: HttpStatusCode.Ok }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { status: "Error", data: null, message: error.message },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
