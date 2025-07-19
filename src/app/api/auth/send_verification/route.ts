import { addVerificationToken, getUserById } from "@/server/queries";
import { generateUserCode } from "@/utils/functions";
import { sendUserVerificationEmailWithRetry } from "@/utils/jobs/events";

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json();
    const { UserId } = formData;

    if (!UserId) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const user = await getUserById(UserId);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
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
    await addVerificationToken(UserId, Token);

    // Send user verification email with retry
    const emailResult = await sendUserVerificationEmailWithRetry({
      Email: user.Email,
      FullName: user.FullName,
      Token: Token,
    });

    // Check if email was sent successfully
    if (emailResult.success) {
      return NextResponse.json(
        {
          message: "Verification sent successfully",
          emailSent: true,
          recipient: emailResult.recipient,
        },
        { status: 200 }
      );
    } else {
      // Email failed but user/token operations succeeded
      console.error("Email sending failed:", emailResult.error);

      return NextResponse.json(
        {
          message:
            "Verification code generated, but email delivery failed. Please try again.",
          emailSent: false,
          error: emailResult.error,
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