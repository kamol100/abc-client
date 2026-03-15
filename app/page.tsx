import { auth } from "@/auth/auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session: any = await auth();
  const isAuthenticated = Boolean(session?.token);

  if (isAuthenticated) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <p className="text-xl font-medium">Welcome to ISPTik</p>
    </main>
  );
}
