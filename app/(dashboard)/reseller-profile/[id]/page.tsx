import type { Metadata } from "next";
import CompanyProfileClient from "@/components/company-profile/company-profile";
import { t } from "@/lib/i18n/server";

type Props = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: t("menu.reseller_profile.title"),
  description: t("menu.reseller_profile.description"),
};

export default async function ResellerProfileByIdPage({ params }: Props) {
  const { id } = await params;
  return <CompanyProfileClient resellerId={id} isReseller />;
}
