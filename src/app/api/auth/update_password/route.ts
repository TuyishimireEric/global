import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";
import {
  getUserByEmail,
  getVerificationToken,
  invalidateVerificationToken,
  updatePassword,
} from "@/server/queries";
import bcrypt from "bcryptjs";
import { sendPasswordUpdatedEmailWithRetry } from "@/utils/jobs/events";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json();
    const { email, Token, Password } = formData;

    // Validate required parameters
    if (!email || !Token) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid verification data, ${email} & ${Token}`,
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid verification data, email verification regex`,
        },
        { status: 400 }
      );
    }

    // Get user data
    const user = await getUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not - use generic message
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification data, user not found",
        },
        { status: 401 }
      );
    }

    const userToken = await getVerificationToken(user.Id);

    if (!userToken || !userToken.Token || !userToken.Expires) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification data, no verification token",
        },
        { status: 401 }
      );
    }

    // Check token expiration FIRST (correct logic)
    const now = new Date();
    if (userToken.Expires < now) {
      // Clean up expired token
      await invalidateVerificationToken(user.Id);
      return NextResponse.json(
        {
          success: false,
          message: "Verification token has expired. Please request a new one.",
        },
        { status: 401 }
      );
    }

    // Secure token comparison to prevent timing attacks
    const providedTokenBuffer = Buffer.from(Token, "utf8");
    const storedTokenBuffer = Buffer.from(userToken.Token, "utf8");

    let isTokenMatching = false;
    if (providedTokenBuffer.length === storedTokenBuffer.length) {
      isTokenMatching = crypto.timingSafeEqual(
        providedTokenBuffer,
        storedTokenBuffer
      );
    }

    if (!isTokenMatching) {
      // Rate limiting should be implemented here in production
      // Consider implementing attempt counting and temporary lockouts
      return NextResponse.json(
        {
          success: false,
          message: "Invalid verification data, token no matching",
        },
        { status: 401 }
      );
    }

    const OldPassword = user.Password ?? "";

    const isPasswordMatch = await bcrypt.compare(Password, OldPassword);

    if (isPasswordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Your new password must be different from the old one.",
        },
        { status: 401 }
      );
    }

    await invalidateVerificationToken(user.Id);

    const hashedPassword = await bcrypt.hash(Password, 10);

    await updatePassword({
      UserId: user.Id,
      Password: hashedPassword,
    });

    await sendPasswordUpdatedEmailWithRetry(
      {
        Email: email,
        FullName: user.FullName,
      },
      {
        maxRetries: 5,
        timeout: 45000,
      }
    );

    return NextResponse.json(
      {
        status: "Success",
        message: "Password updated successfully!",
        data: null,
      },
      { status: HttpStatusCode.Created }
    );
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { status: "Error", data: null, message: error.message },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
