"use client";

import Card from "@/components/card";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { useTranslation } from "react-i18next";

interface PlanFeature {
  id: string;
  key: string;
  name: string;
  expired_mode: string;
}

interface MySubscriptionPayload {
  summary: {
    status: string;
    state: string;
    plan_name: string;
    ends_at: string | null;
  } | null;
  features: PlanFeature[];
}

export default function MySubscription() {
  const { t } = useTranslation();
  const { data, isLoading } = useApiQuery<ApiResponse<MySubscriptionPayload>>({
    queryKey: ["my-subscription"],
    url: "my-subscription",
    pagination: false,
  });

  const payload = data?.data;
  const summary = payload?.summary;

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t("common.loading")}</p>;
  }

  if (!summary) {
    return <p className="text-sm text-muted-foreground">{t("subscription.empty")}</p>;
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-2 p-4">
        <h1 className="text-lg font-medium">{summary.plan_name}</h1>
        <p className="text-sm text-muted-foreground">
          {t("subscription.status")}: {t(`subscription.state.${summary.state}`, { defaultValue: summary.state })}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("subscription.ends_at")}: {summary.ends_at ?? "-"}
        </p>
      </Card>
      <Card className="p-4">
        <h2 className="mb-3 text-sm font-medium">{t("subscription.features")}</h2>
        <ul className="space-y-2">
          {(payload?.features ?? []).map((feature) => (
            <li key={feature.id} className="flex items-center justify-between gap-3 text-sm">
              <span>{feature.name}</span>
              <span className="text-muted-foreground">
                {t(`subscription.mode.${feature.expired_mode}`, { defaultValue: feature.expired_mode })}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
