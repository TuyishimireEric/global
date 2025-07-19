import { getToken } from "next-auth/jwt";

import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET!;

export const getUserToken = async (req: NextRequest) => {
  const cookieName =
    process.env.NODE_ENV === "production"
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

  const user = (await getToken({
    req,
    secret: JWT_SECRET,
    cookieName,
  }));

  return {
    userId: user?.id ?? null,
    userRole: user?.role?.name ?? null,
    userRoleId: user?.RoleId ?? null,
    userEmail: user?.email ?? "",
    userName: user?.name ?? "",
    body: req.body,
  };
};
