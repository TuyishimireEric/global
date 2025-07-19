import {
  getUserById,
  getVerificationToken,
  verifyUser,
} from "@/server/queries";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Parse request data
    const formData = await req.json();
    const { UserId, Token } = formData;

    // Validate required parameters
    if (!UserId || !Token) {
      return NextResponse.json(
        { success: false, message: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Get user data
    const user = await getUserById(UserId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Verification failed" },
        { status: 401 }
      );
    }

    // Check if account is already verified
    if (user.IsVerified) {
      return NextResponse.json(
        { success: true, message: "Account is already verified" },
        { status: 200 }
      );
    }

    // Verify token - either login code or verification token
    let isTokenValid = false;

    if (user.LoginCode) {
      // Direct login code validation
      isTokenValid = user.LoginCode === Token;
    } else {
      // Verification token validation
      const userToken = await getVerificationToken(UserId);
      // If no token found or token doesn't match
      isTokenValid = userToken ? userToken.Token === Token : false;
    }

    // Handle invalid token
    if (!isTokenValid) {
      return NextResponse.json(
        { success: false, message: "Invalid verification token" },
        { status: 401 }
      );
    }

    await verifyUser(UserId);

    return NextResponse.json(
      {
        success: true,
        message: "Account verified successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    const err = error as Error;
    console.error("Error during verification:", err.message);

    // Return a generic error to the client
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred during verification",
      },
      { status: 500 }
    );
  }
}
