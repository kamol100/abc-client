import { auth } from "@/auth/auth";
import { redirect } from "next/navigation";

type SessionWithToken = {
  token?: string;
};

export default async function RootPublicPage() {
  const session = (await auth()) as SessionWithToken | null;
  const isAuthenticated = Boolean(session?.token);

  redirect(isAuthenticated ? "/dashboard" : "/home");
}
