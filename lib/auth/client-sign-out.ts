"use client";

import { signOut } from "next-auth/react";

import { clientLoginUrl } from "@/lib/auth/routes";

export async function signOutClient(): Promise<void> {
  await signOut({ redirect: false });
  window.location.assign(clientLoginUrl(window.location.origin));
}
