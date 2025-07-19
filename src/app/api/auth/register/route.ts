// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { registerUser, emailExists } from "@/server/queries";
import { HttpStatusCode } from "axios";
import { z } from "zod";

// Validation schema
const registerSchema = z.object({
  firstName: z.string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters and spaces"),
  
  lastName: z.string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters and spaces"),
  
  email: z.string()
    .email("Please enter a valid email address")
    .min(1, "Email is required")
    .max(100, "Email must be less than 100 characters")
    .toLowerCase(),
  
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .max(100, "Password must be less than 100 characters")
    .regex(/(?=.*[a-z])/, "Password must contain at least one lowercase letter")
    .regex(/(?=.*[A-Z])/, "Password must contain at least one uppercase letter")
    .regex(/(?=.*\d)/, "Password must contain at least one number"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input data
    const validationResult = registerSchema.safeParse(body);
    
    if (!validationResult.success) {
       return NextResponse.json(
      {
        status: "Error",
        data: null,
        message: `Validation Error: ${validationResult.error.issues[0].message}`,
      },
      { status: HttpStatusCode.BadRequest }
    );
    
    }

    const { firstName, lastName, email, password } = validationResult.data;

    // Check if user already exists
    const userExists = await emailExists(email);
    
    if (userExists) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = await registerUser({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      isActive: true,
      isEmailVerified: false, // Will be verified via email later
      roleId: process.env.DEFAULT_ROLE_ID || "default-role-id", // Set default role
    });

    // Return success response (without sensitive data)
    return NextResponse.json({
      message: "Account created successfully",
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        isActive: newUser.isActive,
        isEmailVerified: newUser.isEmailVerified,
      }
    }, { status: 201 });

  } catch (error) {
    console.error("Registration error:", error);
    
    // Handle database constraint errors
    if (error instanceof Error && error.message.includes("unique constraint")) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        error: "Internal server error",
        message: "Something went wrong. Please try again later."
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}