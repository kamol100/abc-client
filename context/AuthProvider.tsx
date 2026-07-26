"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";

/** Refresh session daily so the JWT sliding expiry stays within the 1-year maxAge */
const SESSION_REFETCH_INTERVAL_SECONDS = 24 * 60 * 60;

export default function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider
      basePath="/api/auth"
      refetchInterval={SESSION_REFETCH_INTERVAL_SECONDS}
    >
      {children}
    </SessionProvider>
  );
}
