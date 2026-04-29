import type { Metadata } from "next";
import CompanyProfileClient from "@/components/company-profile/company-profile";
import { t } from "@/lib/i18n/server";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: t("menu.company_profile.title"),
  description: t("menu.company_profile.title"),
};

export default async function CompanyProfileByIdPage({ params }: Props) {
  const { id } = await params;
  return <CompanyProfileClient companyId={id} />;
}
