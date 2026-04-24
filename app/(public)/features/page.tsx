import FeaturesPage from "@/components/marketing/features/features-page";
import { t } from "@/lib/i18n/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: t("features_page.meta.title"),
  description: t("features_page.meta.description"),
};

export default function FeaturesRoute() {
  return <FeaturesPage />;
}
