import { useSession } from "next-auth/react";

export const useClientSession = () => {
  const { data: session, status } = useSession();
  const userRole = session?.user.role?.name ?? "";
  const userRoleId = session?.user.roleId ?? "";
  const userId = session?.user.id ?? "";
  const userName = session?.user.name ?? "";
  const userEmail = session?.user.email ?? "";
  const userImage = session?.user.image ?? "";

  return {
    userRole,
    userRoleId,
    userId,
    userName,
    userEmail,
    userImage,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  };
};
