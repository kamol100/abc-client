import PricingPage from "@/components/marketing/pricing/pricing-page";
import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: t("pricing_page.meta.title"),
  description: t("pricing_page.meta.description"),
};

export default function PricingRoute() {
  return <PricingPage />;
}
