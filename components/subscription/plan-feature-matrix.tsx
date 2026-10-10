"use client";

import { Checkbox } from "@/components/ui/checkbox";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface FeatureOption {
  id: string;
  key: string;
  name: string;
}

interface SelectedFeature {
  id: string;
  expired_mode: "full" | "read_only" | "disabled";
}

interface SavedPlan {
  features?: Array<{ id: string; expired_mode: string }>;
}

const isExpiredMode = (value: string): value is SelectedFeature["expired_mode"] =>
  value === "full" || value === "read_only" || value === "disabled";

const toSelected = (features: Array<{ id: string; expired_mode: string }> | undefined): SelectedFeature[] =>
  (features ?? []).flatMap((feature) =>
    isExpiredMode(feature.expired_mode) ? [{ id: feature.id, expired_mode: feature.expired_mode }] : []
  );

const selectionSignature = (features: SelectedFeature[]) =>
  features.map((feature) => `${feature.id}:${feature.expired_mode}`).join("|");

function updatePlanFeatures(current: unknown, planId: string, features: SelectedFeature[]): unknown {
  if (!current || typeof current !== "object" || !("data" in current)) return current;
  const body = current as { data?: { data?: Array<{ id: string }> } };
  const rows = body.data?.data;
  if (!rows) return current;

  return {
    ...current,
    data: {
      ...body.data,
      data: rows.map((plan) => (plan.id === planId ? { ...plan, features } : plan)),
    },
  };
}

export default function PlanFeatureMatrix({
  planId,
  initial = [],
}: {
  planId: string;
  initial?: SelectedFeature[];
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<SelectedFeature[]>(initial);
  const [syncedSignature, setSyncedSignature] = useState(() => selectionSignature(initial));
  const initialSignature = selectionSignature(initial);
  if (!open && syncedSignature !== initialSignature) {
    setSyncedSignature(initialSignature);
    setSelected(initial);
  }
  const { data } = useApiQuery<PaginatedApiResponse<FeatureOption>>({
    queryKey: ["features", "plan-matrix"],
    url: "features",
    params: { all: 1 },
    pagination: false,
  });
  const features = data?.data?.data ?? [];
  const mutation = useApiMutation<SavedPlan, { features: SelectedFeature[] }>({
    url: `/subscription-plans/${planId}/features`,
    method: "PUT",
    invalidateKeys: "subscription-plans",
    successMessage: "subscription.plan.features_saved",
    onSuccess: (plan) => {
      const saved = toSelected(plan.features);
      setSyncedSignature(selectionSignature(saved));
      setSelected(saved);
      queryClient.setQueriesData({ queryKey: ["subscription-plans"] }, (current) =>
        updatePlanFeatures(current, planId, saved)
      );
    },
  });

  const toggle = (id: string, checked: boolean) => {
    setSelected((current) => {
      if (!checked) return current.filter((item) => item.id !== id);
      if (current.some((item) => item.id === id)) return current;
      return [...current, { id, expired_mode: "read_only" }];
    });
  };

  const setMode = (id: string, expired_mode: SelectedFeature["expired_mode"]) => {
    setSelected((current) => current.map((item) => (item.id === id ? { ...item, expired_mode } : item)));
  };

  return (
    <MyDialog
      size="xl"
      title="subscription.plan.features"
      open={open}
      onOpenChange={setOpen}
      trigger={<MyButton action="edit" icon={false} title="subscription.plan.features" />}
    >
      <div className="space-y-3">
        {features.map((feature) => {
          const row = selected.find((item) => item.id === feature.id);
          const checkboxId = `${planId}-${feature.id}`;
          return (
            <div key={feature.id} className="flex flex-col gap-2 border-b pb-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Checkbox
                  id={checkboxId}
                  checked={Boolean(row)}
                  onCheckedChange={(checked) => toggle(feature.id, checked === true)}
                />
                <label htmlFor={checkboxId} className="cursor-pointer">
                  {feature.name}
                </label>
              </div>
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                disabled={!row}
                value={row?.expired_mode ?? "read_only"}
                onChange={(event) => setMode(feature.id, event.target.value as SelectedFeature["expired_mode"])}
              >
                <option value="full">{t("subscription.mode.full")}</option>
                <option value="read_only">{t("subscription.mode.read_only")}</option>
                <option value="disabled">{t("subscription.mode.disabled")}</option>
              </select>
            </div>
          );
        })}
        <MyButton type="button" action="save" title="common.save" loading={mutation.isPending} onClick={() => mutation.mutate({ features: selected })} />
      </div>
    </MyDialog>
  );
}
