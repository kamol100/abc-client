import { ResetPasswordForm } from "@/components/login/password-reset-forms";
import { fetchHostName } from "@/app/layout";
import { getCompanyPublicData } from "@/lib/api/api";
import { resolveApiAssetUrlWithFallback } from "@/lib/helper/helper";
import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { Suspense } from "react";

const DEFAULT_LOGO = "/static/logo.png";

function ResetPasswordFallback() {
  return <div className="min-h-[400px] min-w-[400px] animate-pulse rounded-lg bg-muted" />;
}

export const metadata: Metadata = {
  title: t("password_reset.reset_title"),
  description: t("password_reset.reset_description"),
};

export default async function ResetPasswordPage() {
  const host = await fetchHostName();
  const company = await getCompanyPublicData(host);
  const companyLogoUrl = resolveApiAssetUrlWithFallback(company.logo, DEFAULT_LOGO);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <Suspense fallback={<ResetPasswordFallback />}>
        <ResetPasswordForm companyLogoUrl={companyLogoUrl} companyName={company.name} />
      </Suspense>
    </div>
  );
}
