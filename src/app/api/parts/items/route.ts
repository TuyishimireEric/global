import { NextRequest, NextResponse } from "next/server";
import {
  createPartItem,
  bulkInsertPartItems,
  getPartItems,
  getPartItemByBarcode,
  updatePartItem,
  checkBarcode,
  partItemSchema,
  updatePartItemSchema,
  bulkInsertSchema,
  type GetPartItemsOptions,
} from "@/server/queries/partItems";
import { z } from "zod";
import { HttpStatusCode } from "axios";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const options: GetPartItemsOptions = {
      partId: searchParams.get("partId") || undefined,
      supplierId: searchParams.get("supplierId") || undefined,
      status: searchParams.get("status") || undefined,
      condition: searchParams.get("condition") || undefined,
      location: searchParams.get("location") || undefined,
      barCode: searchParams.get("barCode") || undefined,
      serialNumber: searchParams.get("serialNumber") || undefined,
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : undefined,
      offset: searchParams.get("offset")
        ? parseInt(searchParams.get("offset")!)
        : undefined,
      orderBy:
        (searchParams.get("orderBy") as
          | "addedOn"
          | "updatedOn"
          | "purchaseDate"
          | "expiryDate") || undefined,
      orderDirection:
        (searchParams.get("orderDirection") as "asc" | "desc") || undefined,
      includeRelations: searchParams.get("includeRelations") === "true",
    };

    const barcode = searchParams.get("barcode");
    if (barcode) {
      const partItem = await getPartItemByBarcode(barcode);
      return NextResponse.json({
        success: true,
        data: partItem[0] || null,
      });
    }

    // Handle barcode check endpoint
    const checkBarcodeParam = searchParams.get("checkBarcode");
    if (checkBarcodeParam) {
      const existingItem = await checkBarcode(checkBarcodeParam);
      return NextResponse.json({
        success: true,
        exists: existingItem.length > 0,
        data: existingItem[0] || null,
      });
    }

    const partItems = await getPartItems(options);

    return NextResponse.json({
      success: true,
      data: partItems,
      meta: {
        limit: options.limit || 50,
        offset: options.offset || 0,
        count: partItems.length,
      },
    });
  } catch (error) {
    console.error("Error fetching part items:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to fetch part items",
      },
      { status: 500 }
    );
  }
}

// POST /api/part-items
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);

    // Handle bulk insert
    const isBulk = searchParams.get("bulk") === "true";

    if (isBulk) {
      // Validate bulk insert data
      const validatedData = bulkInsertSchema.parse(body);
      const newPartItems = await bulkInsertPartItems(validatedData);

      return NextResponse.json(
        {
          success: true,
          data: newPartItems,
          message: `Successfully created ${newPartItems.length} part items`,
        },
        { status: 201 }
      );
    } else {
      // Single part item creation
      const validatedData = partItemSchema.parse(body);
      const newPartItem = await createPartItem(validatedData);

      return NextResponse.json(
        {
          success: true,
          data: newPartItem,
          message: "Part item created successfully",
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error creating part item(s):", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          status: "Success",
          message: "Parts fetched successfully!",
          data: error.issues,
        },
        { status: HttpStatusCode.Ok }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create part item(s)",
      },
      { status: 500 }
    );
  }
}

// PUT /api/part-items
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const validatedData = updatePartItemSchema.parse(body);
    const updatedPartItem = await updatePartItem(validatedData);

    if (!updatedPartItem) {
      return NextResponse.json(
        {
          success: false,
          error: "Part item not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedPartItem,
      message: "Part item updated successfully",
    });
  } catch (error) {
    console.error("Error updating part item:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update part item",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  return PUT(request);
}
