import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";
import { registerSchema } from "@/utils/validations/userValidations";
import {
  addNewUser,
  addOrganizationUser,
  addVerificationToken,
  userAlreadyExist,
} from "@/server/queries";
import { generateUserCode } from "@/utils/functions";
import { UserType } from "@/types";
import bcrypt from "bcryptjs";
import { sendUserVerificationEmailWithRetry } from "@/utils/jobs/events";

export async function POST(req: NextRequest) {
  const formData = await req.json();

  const validation = registerSchema.safeParse(formData);
  if (!validation.success) {
    return NextResponse.json(
      {
        status: "Error",
        data: null,
        message: `Validation Error: ${validation.error.errors[0].message}`,
      },
      { status: HttpStatusCode.BadRequest }
    );
  }

  const { Email, UserRole, Password } = formData;

  try {

    const existingUser = await userAlreadyExist(Email);

    if (existingUser) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "User already exists! Please login.",
        },
        { status: HttpStatusCode.BadRequest }
      );
    }

    const hashedPassword = await bcrypt.hash(Password, 10);

    const newUser = await addNewUser({
      ...formData,
      Password: hashedPassword,
    });

    console.log({ formData });

    const RoleId =
      UserRole === UserType.PARENT ? 6 : UserRole == UserType.STUDENT ? 2 : 5;

    await addOrganizationUser({
      UserId: newUser[0].Id,
      OrganizationId: process.env.DEFAULT_ORG_ID as string,
      RoleId,
    });

    const Token = generateUserCode(formData.FullName);

    await addVerificationToken(newUser[0].Id, Token);

    const verify = {
      Email: formData.Email,
      FullName: formData.FullName,
      Token,
    };

    await sendUserVerificationEmailWithRetry(verify);

    return NextResponse.json(
      {
        status: "Success",
        message: "Registered successfully!",
        data: newUser[0].Id,
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
