// app/api/parts/route.ts
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import {
  getAllParts,
  createPart,
  searchParts,
  getPartByPartNumber
} from "@/server/queries/parts";
import { getUserToken } from "@/utils/getToken";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const searchText = searchParams.get("searchText") || "";
    const category = searchParams.get("category") || "";
    const brand = searchParams.get("brand") || "";
    const isActive = searchParams.get("isActive");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const { userId } = await getUserToken(req);

    let result;

    if (searchText) {
      const parts = await searchParts(searchText, page, limit);
      result = {
        parts,
        totalCount: parts.length,
        currentPage: page,
        totalPages: Math.ceil(parts.length / limit),
      };
    } else {
      const filters: any = {};
      if (category) filters.category = category;
      if (brand) filters.brand = brand;
      if (isActive !== null) filters.isActive = isActive === "true";
      if (minPrice) filters.minPrice = parseFloat(minPrice);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

      result = await getAllParts(
        page,
        limit,
        Object.keys(filters).length > 0 ? filters : undefined
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Parts fetched successfully!",
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

export async function POST(req: NextRequest) {
  try {
    const { userId } = await getUserToken(req);

    if (!userId) {
      return NextResponse.json(
        { status: "Error", data: null, message: "Unauthorized" },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const body = await req.json();
    const {
      partNumber,
      name,
      description,
      brand,
      category,
      subcategory,
      compatibleModels,
      specifications,
      images,
      price,
      discount,
      costPrice,
      weight,
      dimensions,
      minimumStock,
      isActive,
    } = body;

    // Validation
    if (!partNumber || !name || !category || !price) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Missing required fields: partNumber, name, category, price",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    // Check if part number already exists
    const existingPart = await getPartByPartNumber(partNumber);
    if (existingPart) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Part number already exists",
        },
        { status: HttpStatusCode.Conflict }
      );
    }

    // Helper function to safely convert to number
    const safeParseFloat = (value: any): number => {
      if (value === null || value === undefined || value === "") return 0;
      if (typeof value === "number") return value;
      const parsed = parseFloat(value.toString());
      return isNaN(parsed) ? 0 : parsed;
    };

    // Helper function to safely convert to integer
    const safeParseInt = (value: any): number => {
      if (value === null || value === undefined || value === "") return 0;
      if (typeof value === "number") return Math.floor(value);
      const parsed = parseInt(value.toString(), 10);
      return isNaN(parsed) ? 0 : parsed;
    };

    // Helper function to parse weight (extracts number from strings like "0.8 kg", "800g", etc.)
    const parseWeight = (weightValue: any): string | null => {
      if (!weightValue) return null;
      
      if (typeof weightValue === "number") {
        return weightValue.toString();
      }
      
      if (typeof weightValue === "string") {
        // Extract number from string like "0.8 kg", "800g", "1.5 lbs"
        const match = weightValue.match(/(\d+\.?\d*)/);
        if (match) {
          const numericValue = parseFloat(match[1]);
          return isNaN(numericValue) ? null : numericValue.toString();
        }
      }
      
      return null;
    };

    // Helper function to parse dimensions into proper JSON object
    const parseDimensions = (dimensionsValue: any): object | null => {
      if (!dimensionsValue) return null;
      
      // If already an object, validate and return
      if (typeof dimensionsValue === "object" && !Array.isArray(dimensionsValue)) {
        return dimensionsValue;
      }
      
      // If it's a string, try to parse different formats
      if (typeof dimensionsValue === "string") {
        const dimensionsStr = dimensionsValue.toLowerCase();
        const dimensions: any = { unit: "mm" };
        
        // Pattern 1: "132mm H x 93mm D" or "132 H x 93 D"
        const heightMatch = dimensionsStr.match(/(\d+\.?\d*)\s*(?:mm)?\s*[h]/i);
        const widthMatch = dimensionsStr.match(/(\d+\.?\d*)\s*(?:mm)?\s*[w]/i);
        const lengthMatch = dimensionsStr.match(/(\d+\.?\d*)\s*(?:mm)?\s*[l]/i);
        const diameterMatch = dimensionsStr.match(/(\d+\.?\d*)\s*(?:mm)?\s*[d]/i);
        
        // Pattern 2: "L: 100mm, W: 50mm, H: 30mm"
        const lengthMatch2 = dimensionsStr.match(/[l]:\s*(\d+\.?\d*)/i);
        const widthMatch2 = dimensionsStr.match(/[w]:\s*(\d+\.?\d*)/i);
        const heightMatch2 = dimensionsStr.match(/[h]:\s*(\d+\.?\d*)/i);
        
        // Pattern 3: "100 x 50 x 30" (assume L x W x H)
        const dimensionArrayMatch = dimensionsStr.match(/(\d+\.?\d*)\s*x\s*(\d+\.?\d*)\s*x\s*(\d+\.?\d*)/i);
        
        if (heightMatch) dimensions.height = parseFloat(heightMatch[1]);
        if (widthMatch) dimensions.width = parseFloat(widthMatch[1]);
        if (lengthMatch) dimensions.length = parseFloat(lengthMatch[1]);
        if (diameterMatch) dimensions.diameter = parseFloat(diameterMatch[1]);
        
        if (lengthMatch2) dimensions.length = parseFloat(lengthMatch2[1]);
        if (widthMatch2) dimensions.width = parseFloat(widthMatch2[1]);
        if (heightMatch2) dimensions.height = parseFloat(heightMatch2[1]);
        
        if (dimensionArrayMatch) {
          dimensions.length = parseFloat(dimensionArrayMatch[1]);
          dimensions.width = parseFloat(dimensionArrayMatch[2]);
          dimensions.height = parseFloat(dimensionArrayMatch[3]);
        }
        
        // Check if we found any dimensions
        const hasValidDimensions = Object.keys(dimensions).some(key => 
          key !== 'unit' && typeof dimensions[key] === 'number' && !isNaN(dimensions[key])
        );
        
        return hasValidDimensions ? dimensions : null;
      }
      
      return null;
    };

    // Helper function to ensure array format
    const ensureArray = (value: any): any[] => {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [value];
        } catch {
          return [value];
        }
      }
      return [value];
    };

    // Helper function to ensure object format
    const ensureObject = (value: any): object => {
      if (!value) return {};
      if (typeof value === "object" && !Array.isArray(value)) return value;
      if (typeof value === "string") {
        try {
          const parsed = JSON.parse(value);
          return typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
        } catch {
          return {};
        }
      }
      return {};
    };

    // Parse and validate price
    const parsedPrice = safeParseFloat(price);
    if (parsedPrice <= 0) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Price must be greater than 0",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    // Parse and validate discount
    const parsedDiscount = safeParseFloat(discount);
    if (parsedDiscount < 0 || parsedDiscount > 100) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Discount must be between 0 and 100",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    // Format all data according to database schema
    const partData = {
      partNumber: partNumber?.toString() || "",
      name: name?.toString() || "",
      description: description ? description.toString() : null,
      brand: brand ? brand.toString() : null,
      category: category?.toString() || "",
      subcategory: subcategory ? subcategory.toString() : null,
      compatibleModels: ensureArray(compatibleModels),
      specifications: ensureObject(specifications),
      images: ensureArray(images),
      price: parsedPrice.toString(), // Convert to string for decimal field
      discount: parsedDiscount.toString(), // Convert to string for decimal field
      costPrice: costPrice ? safeParseFloat(costPrice).toString() : null,
      weight: parseWeight(weight), // Parse weight and convert to string
      dimensions: parseDimensions(dimensions), // Parse dimensions to JSON object
      minimumStock: safeParseInt(minimumStock), // Convert to integer
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdBy: userId,
      updatedBy: userId,
    };

    console.log("Formatted part data:", JSON.stringify(partData, null, 2));

    const newPart = await createPart(partData);

    return NextResponse.json(
      {
        status: "Success",
        message: "Part created successfully!",
        data: newPart,
      },
      { status: HttpStatusCode.Created }
    );
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Part creation error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { status: "Error", data: null, message: error.message },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}