import MySubscription from "@/components/subscription/my-subscription";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: t("subscription.title"),
};

export default function SubscriptionPage() {
  return <MySubscription />;
}
