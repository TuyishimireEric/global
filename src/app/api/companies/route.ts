// app/api/companies/route.ts
import { HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
import {
  getCompanies,
  createCompany,
  getCompanyById,
  type CompanyFilters,
  type CreateCompanyInput,
} from "@/server/queries/companies";
import { getUserToken } from "@/utils/getToken";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const name = searchParams.get("name") || "";
    const type = searchParams.get("type") as "customer" | "supplier" | "both" | undefined;
    const isActive = searchParams.get("isActive");
    const city = searchParams.get("city") || "";
    const country = searchParams.get("country") || "";
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const { userId } = await getUserToken(req);

    let result;

    // If ID is provided, get specific company
    if (id) {
      const company = await getCompanyById(id);
      if (!company) {
        return NextResponse.json(
          {
            status: "Error",
            data: null,
            message: "Company not found",
          },
          { status: HttpStatusCode.NotFound }
        );
      }
      result = company;
    } else {
      // Build filters object
      const filters: CompanyFilters = {};
      if (name) filters.name = name;
      if (type) filters.type = type;
      if (isActive !== null) filters.isActive = isActive === "true";
      if (city) filters.city = city;
      if (country) filters.country = country;
      if (limit) filters.limit = limit;
      if (offset) filters.offset = offset;

      const companies = await getCompanies(filters);
      result = {
        companies,
        totalCount: companies.length,
        limit,
        offset,
      };
    }

    return NextResponse.json(
      {
        status: "Success",
        message: id ? "Company fetched successfully!" : "Companies fetched successfully!",
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
      name,
      type,
      logo,
      email,
      phoneNumber,
      faxNumber,
      website,
      tin,
      registrationNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      bankName,
      accountNumber,
      routingNumber,
      swiftCode,
      creditLimit,
      paymentTerms,
      taxRate,
      isActive,
      notes,
    } = body;

    // Validation for required fields
    if (!name || !type) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Missing required fields: name, type",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    // Validate company type
    if (!["customer", "supplier", "both"].includes(type)) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Invalid company type. Must be 'customer', 'supplier', or 'both'",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Invalid email format",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    // Validate website URL format if provided
    if (website && !/^https?:\/\/.+/.test(website)) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Invalid website URL format. Must start with http:// or https://",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    // Helper function to safely convert string values
    const safeString = (value: any): string | undefined => {
      if (value === null || value === undefined || value === "") return undefined;
      return value.toString().trim();
    };

    // Helper function to validate and format numeric strings
    const validateNumericString = (value: any, fieldName: string): string | undefined => {
      if (!value) return undefined;
      const stringValue = value.toString().trim();
      if (!/^\d+(\.\d{1,2})?$/.test(stringValue)) {
        throw new Error(`Invalid ${fieldName} format. Must be a valid number`);
      }
      return stringValue;
    };

    try {
      // Format company data according to schema
      const companyData: CreateCompanyInput = {
        name: name.toString().trim(),
        type: type as "customer" | "supplier" | "both",
        logo: safeString(logo),
        email: safeString(email),
        phoneNumber: safeString(phoneNumber),
        faxNumber: safeString(faxNumber),
        website: safeString(website),
        tin: safeString(tin),
        registrationNumber: safeString(registrationNumber),
        addressLine1: safeString(addressLine1),
        addressLine2: safeString(addressLine2),
        city: safeString(city),
        state: safeString(state),
        postalCode: safeString(postalCode),
        country: safeString(country),
        bankName: safeString(bankName),
        accountNumber: safeString(accountNumber),
        routingNumber: safeString(routingNumber),
        swiftCode: safeString(swiftCode),
        creditLimit: validateNumericString(creditLimit, "credit limit"),
        paymentTerms: safeString(paymentTerms),
        taxRate: validateNumericString(taxRate, "tax rate"),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        notes: safeString(notes),
      };

      console.log("Formatted company data:", JSON.stringify(companyData, null, 2));

      const newCompany = await createCompany(companyData);

      return NextResponse.json(
        {
          status: "Success",
          message: "Company created successfully!",
          data: newCompany,
        },
        { status: HttpStatusCode.Created }
      );
    } catch (validationError: any) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: validationError.message,
        },
        { status: HttpStatusCode.BadRequest }
      );
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Company creation error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      { status: "Error", data: null, message: error.message },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}