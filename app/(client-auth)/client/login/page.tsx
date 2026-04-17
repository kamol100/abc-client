import { ClientLoginForm } from "@/components/client-area/login-form";
import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: t("client_login.title"),
  description: t("client_login.title"),
};

function LoginFormFallback() {
  return (
    <div className="min-h-[400px] min-w-[400px] animate-pulse rounded-lg bg-muted-foreground/10" />
  );
}

export default function ClientLoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <Suspense fallback={<LoginFormFallback />}>
        <ClientLoginForm />
      </Suspense>
    </div>
  );
}
