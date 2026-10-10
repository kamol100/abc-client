import CompanySubscriptionTable from "@/components/subscription/company-subscription-table";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: t("subscription.company.title"),
};

export default function CompanySubscriptionsPage() {
  return <CompanySubscriptionTable />;
}