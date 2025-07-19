import {
  addVerificationToken,
  getUserByEmail
} from "@/server/queries";
import { generateUserCode } from "@/utils/functions";
import {
  sendForgotPasswordEmailWithRetry
} from "@/utils/jobs/events";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json();
    const { email } = formData;

    if (!email) {
      return NextResponse.json(
        { message: "add a valid email" },
        { status: 404 }
      );
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { message: "User not found, Please Register!" },
        { status: 404 }
      );
    }

    if (!user.Email || !user.FullName) {
      return NextResponse.json(
        { message: "User missing required email or name information." },
        { status: 400 }
      );
    }

    const Token = generateUserCode(user.FullName);

    if (!Token) {
      return NextResponse.json(
        { message: "Failed to generate verification token." },
        { status: 500 }
      );
    }

    // Add verification token to database
    await addVerificationToken(user.Id, Token);

    const result = await sendForgotPasswordEmailWithRetry({
      Email: user.Email,
      FullName: user.FullName,
      Token: Token,
    });

    // Check if email was sent successfully
    if (result.success) {
      return NextResponse.json(
        {
          message: "Verification sent successfully",
          emailSent: true,
          recipient: user.Email,
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          message:
            "Verification code generated, but email delivery failed. Please try again.",
          emailSent: false,
          error: result.error,
          canRetry: true,
        },
        { status: 207 }
      );
    }
  } catch (error) {
    const Error = error as Error;
    console.error("Route error:", Error);

    return NextResponse.json(
      {
        message: "An error occurred while processing verification",
        error: Error.message,
      },
      { status: 500 }
    );
  }
}
