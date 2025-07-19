"use client";
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider
      refetchInterval={60 * 1000} // Disable periodic refetching
      refetchOnWindowFocus={false} // Disable refetch on window focus
    >
      {children}
    </NextAuthSessionProvider>
  );
}
