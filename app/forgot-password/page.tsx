import { ForgotPasswordForm } from "@/components/login/password-reset-forms";
import { fetchHostName } from "@/app/layout";
import { getCompanyPublicData } from "@/lib/api/api";
import { resolveApiAssetUrlWithFallback } from "@/lib/helper/helper";
import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";

const DEFAULT_LOGO = "/static/logo.png";

export const metadata: Metadata = {
  title: t("password_reset.forgot_title"),
  description: t("password_reset.forgot_description"),
};

export default async function ForgotPasswordPage() {
  const host = await fetchHostName();
  const company = await getCompanyPublicData(host);
  const companyLogoUrl = resolveApiAssetUrlWithFallback(company.logo, DEFAULT_LOGO);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <ForgotPasswordForm companyLogoUrl={companyLogoUrl} companyName={company.name} />
    </div>
  );
}
