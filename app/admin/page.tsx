import { LoginForm } from "@/components/login/login-form";
import { fetchHostName } from "@/app/layout";
import { getCompanyPublicData } from "@/lib/api/api";
import { resolveApiAssetUrlWithFallback } from "@/lib/helper/helper";
import { Suspense } from "react";

function LoginFormFallback() {
  return (
    <div className="min-h-[400px] min-w-[400px] animate-pulse rounded-lg bg-muted-foreground/10" />
  );
}

const DEFAULT_LOGO = "/static/logo.png";

export default async function AdminLoginPage() {
  const host = await fetchHostName();
  const company = await getCompanyPublicData(host);
  const companyLogoUrl = resolveApiAssetUrlWithFallback(company.logo, DEFAULT_LOGO);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm companyLogoUrl={companyLogoUrl} />
      </Suspense>
    </div>
  );
}
