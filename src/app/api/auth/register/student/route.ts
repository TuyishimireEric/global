import { NextRequest, NextResponse } from "next/server";
import { HttpStatusCode } from "axios";
import { registerStudentSchema } from "@/utils/validations/userValidations";
import {
  addNewUser,
  addOrganizationUser,
  addParentStudent,
} from "@/server/queries";
import bcrypt from "bcryptjs";
import { getUserToken } from "@/utils/getToken";
import { User } from "@/server/db/schema";
import { db } from "@/server/db";
import { max } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { userId, userRoleId, userEmail, userName } = await getUserToken(req);
    if (!userId || userRoleId !== 6) {
      return NextResponse.json(
        {
          status: "Error",
          data: null,
          message: "Unauthorized!",
        },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const formData = await req.json();

    const validation = registerStudentSchema.safeParse(formData);
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

    const { FullName, DateOfBirth, Password } = formData;

    const hashedPassword = await bcrypt.hash(Password, 10);

    const result = await db
      .select({
        lastUserNumber: max(User.UserNumber),
      })
      .from(User);

    const lastUserNumber = result[0]?.lastUserNumber || 0;

    const newUser = await addNewUser({
      FullName,
      ParentName: userName,
      ParentEmail: userEmail,
      DateOfBirth,
      Password: hashedPassword,
      IsVerified: true,
      UserNumber: lastUserNumber + 1,
    });

    await Promise.all([
      addOrganizationUser({
        UserId: newUser[0].Id,
        OrganizationId: process.env.DEFAULT_ORG_ID as string,
        RoleId: 2,
      }),
      addParentStudent({
        ParentId: userId,
        StudentId: newUser[0].Id,
      }),
    ]);

    return NextResponse.json(
      {
        status: "Success",
        message: "Student Registered successfully!",
        data: newUser[0],
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
