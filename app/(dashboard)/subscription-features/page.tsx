import FeatureTable from "@/components/subscription/feature-table";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: t("subscription.feature.title"),
};

export default function SubscriptionFeaturesPage() {
  return <FeatureTable />;
}
