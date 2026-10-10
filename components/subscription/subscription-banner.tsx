"use client";

import MyButton from "@/components/my-button";
import { useSubscription } from "@/context/app-provider";
import { useTranslation } from "react-i18next";

export default function SubscriptionBanner() {
  const { subscription } = useSubscription();
  const { t } = useTranslation();

  if (!subscription || (subscription.state !== "grace" && subscription.state !== "expired")) {
    return null;
  }

  const expired = subscription.state === "expired";
  const readOnly = subscription.read_only_features.join(", ");
  const disabled = subscription.disabled_features.join(", ");

  return (
    <div
      role="status"
      className="border-b bg-muted px-4 py-3 text-sm text-foreground"
    >
      <p className="font-medium">
        {expired ? t("subscription.banner.expired") : t("subscription.banner.grace")}
      </p>
      <p className="text-muted-foreground">
        {t("subscription.banner.ends", { date: subscription.ends_at ?? "-" })}
      </p>
      {expired && readOnly ? (
        <p className="text-muted-foreground">{t("subscription.banner.read_only", { features: readOnly })}</p>
      ) : null}
      {expired && disabled ? (
        <p className="text-muted-foreground">{t("subscription.banner.disabled", { features: disabled })}</p>
      ) : null}
      <MyButton action="edit" icon={false} title="subscription.banner.view" url="/subscription" />
    </div>
  );
}
