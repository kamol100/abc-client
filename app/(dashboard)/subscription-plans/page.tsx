import SubscriptionPlanTable from "@/components/subscription/subscription-plan-table";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: t("subscription.plan.title"),
};

export default function SubscriptionPlansPage() {
  return <SubscriptionPlanTable />;
}
