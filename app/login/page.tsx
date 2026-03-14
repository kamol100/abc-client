import { LoginForm } from "@/components/login/login-form";
import { Suspense } from "react";

function LoginFormFallback() {
  return (
    <div className="min-h-[400px] min-w-[400px] animate-pulse rounded-lg bg-muted-foreground/10" />
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
