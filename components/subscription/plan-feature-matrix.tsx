"use client";

import { FormLoader } from "@/components/loader/form-loader";
import MyBadge, { type MyBadgeType } from "@/components/my-badge";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type ExpiredMode = "full" | "read_only" | "disabled";
type AccessType = "read" | "write";
type Standing = "active" | "expired";
type RouteFilter = "all" | "read" | "write" | "kept" | "dropped";
type RouteResult = "granted" | "kept" | "dropped" | "not_on_plan";

interface FeaturePermission {
  name: string;
  access_type?: string | null;
}

interface FeatureOption {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  permissions?: FeaturePermission[];
}

interface SelectedFeature {
  id: string;
  expired_mode: ExpiredMode;
}

interface SavedPlan {
  features?: Array<{ id: string; expired_mode: string }>;
}

interface RemovedFeatureImpact {
  id: string;
  name: string;
  companies: number;
  staff: number;
  resellers: number;
}

interface RouteRow {
  name: string;
  group: string;
  access: AccessType;
  kept: boolean;
  result: RouteResult;
}

const FILTERS: RouteFilter[] = ["all", "read", "write", "kept", "dropped"];

const RESULT_BADGE: Record<RouteResult, MyBadgeType> = {
  granted: "success",
  kept: "success",
  dropped: "warning",
  not_on_plan: "pending",
};

const isExpiredMode = (value: string): value is ExpiredMode =>
  value === "full" || value === "read_only" || value === "disabled";

const accessOf = (permission: FeaturePermission): AccessType =>
  permission.access_type === "read" ? "read" : "write";

const groupOf = (name: string): string => {
  const dot = name.indexOf(".");
  return dot === -1 ? name : name.slice(0, dot);
};

const toSelected = (features: Array<{ id: string; expired_mode: string }> | undefined): SelectedFeature[] =>
  (features ?? []).flatMap((feature) =>
    isExpiredMode(feature.expired_mode) ? [{ id: feature.id, expired_mode: feature.expired_mode }] : []
  );

const selectionSignature = (features: SelectedFeature[]) =>
  features.map((feature) => `${feature.id}:${feature.expired_mode}`).join("|");

const featureKeeps = (choice: SelectedFeature | undefined, access: AccessType, standing: Standing): boolean => {
  if (!choice) return false;
  if (standing === "active") return true;
  if (choice.expired_mode === "full") return true;
  return choice.expired_mode === "read_only" && access === "read";
};

const routeKept = (
  access: AccessType,
  choice: SelectedFeature | undefined,
  standing: Standing
): boolean => featureKeeps(choice, access, standing);

const routeResult = (
  access: AccessType,
  choice: SelectedFeature | undefined,
  standing: Standing
): RouteResult => {
  if (featureKeeps(choice, access, standing)) return standing === "active" ? "granted" : "kept";
  if (!choice) return "not_on_plan";
  return "dropped";
};

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

function featureRoutes(
  feature: FeatureOption,
  choice: SelectedFeature | undefined,
  standing: Standing
): RouteRow[] {
  return (feature.permissions ?? [])
    .map((permission) => {
      const access = accessOf(permission);
      return {
        name: permission.name,
        group: groupOf(permission.name),
        access,
        kept: routeKept(access, choice, standing),
        result: routeResult(access, choice, standing),
      };
    })
    .sort((left, right) => left.group.localeCompare(right.group) || left.name.localeCompare(right.name));
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [standing, setStanding] = useState<Standing>("expired");
  const [filter, setFilter] = useState<RouteFilter>("all");
  const [query, setQuery] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removed, setRemoved] = useState<RemovedFeatureImpact[]>([]);
  const [impactError, setImpactError] = useState(false);
  const pendingFeatures = useRef<SelectedFeature[]>(initial);
  const initialSignature = selectionSignature(initial);
  if (!open && syncedSignature !== initialSignature) {
    setSyncedSignature(initialSignature);
    setSelected(initial);
  }

  const { data, isLoading, isError } = useApiQuery<PaginatedApiResponse<FeatureOption>>({
    queryKey: ["features", "plan-inspector"],
    url: "features",
    params: { all: 1, permissions: 1 },
    pagination: false,
    enabled: open,
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
      setConfirmOpen(false);
      queryClient.setQueriesData({ queryKey: ["subscription-plans"] }, (current) =>
        updatePlanFeatures(current, planId, saved)
      );
    },
  });
  const impact = useApiMutation<{ removed: RemovedFeatureImpact[] }, { features: SelectedFeature[] }>({
    url: `/subscription-plans/${planId}/features/impact`,
    method: "POST",
    onSuccess: (result) => {
      setImpactError(false);
      if (result.removed.length === 0) {
        mutation.mutate({ features: pendingFeatures.current });
        return;
      }
      setRemoved(result.removed);
      setConfirmOpen(true);
    },
    onError: () => setImpactError(true),
  });

  const choiceFor = (id: string) => selected.find((item) => item.id === id);

  const toggle = (id: string, checked: boolean) => {
    setSelectedId(id);
    setSelected((current) => {
      if (!checked) return current.filter((item) => item.id !== id);
      if (current.some((item) => item.id === id)) return current;
      return [...current, { id, expired_mode: "read_only" }];
    });
  };

  const setMode = (id: string, expired_mode: ExpiredMode) => {
    setSelected((current) => current.map((item) => (item.id === id ? { ...item, expired_mode } : item)));
  };

  const counts = useMemo(() => {
    let included = 0;
    let active = 0;
    let kept = 0;
    for (const feature of features) {
      const choice = selected.find((item) => item.id === feature.id);
      if (choice) included += 1;
      for (const permission of feature.permissions ?? []) {
        const access = accessOf(permission);
        if (routeKept(access, choice, "active")) active += 1;
        if (routeKept(access, choice, "expired")) kept += 1;
      }
    }
    return { included, active, kept, total: features.length };
  }, [features, selected]);

  const current =
    features.find((feature) => feature.id === selectedId) ??
    features.find((feature) => selected.some((item) => item.id === feature.id)) ??
    features[0];
  const currentChoice = current ? choiceFor(current.id) : undefined;
  const routes = current ? featureRoutes(current, currentChoice, standing) : [];
  const normalizedQuery = query.trim().toLowerCase();
  const visibleRoutes = routes.filter((route) => {
    if (normalizedQuery && !route.name.toLowerCase().includes(normalizedQuery) && !route.group.includes(normalizedQuery)) {
      return false;
    }
    if (filter === "read" || filter === "write") return route.access === filter;
    if (filter === "kept") return route.kept;
    if (filter === "dropped") return !route.kept;
    return true;
  });
  const readCount = routes.filter((route) => route.access === "read").length;

  const requestSave = () => {
    pendingFeatures.current = selected;
    setImpactError(false);
    impact.mutate({ features: selected });
  };

  const closeInspector = (next: boolean) => {
    setOpen(next);
    if (next) return;
    setSelectedId(null);
    setStanding("expired");
    setFilter("all");
    setQuery("");
    setConfirmOpen(false);
    setImpactError(false);
  };

  return (
    <MyDialog
      size="4xl"
      contentClassName="sm:max-w-6xl"
      title="subscription.plan.features"
      description="subscription.plan.inspector.read_only_hint"
      open={open}
      onOpenChange={closeInspector}
      trigger={<MyButton action="edit" icon={false} title="subscription.plan.features" />}
    >
      {isLoading ? (
        <FormLoader grids={1} fieldCount={4} />
      ) : isError ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{t("common.failed_to_load_data")}</p>
      ) : features.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted-foreground">{t("subscription.plan.inspector.empty")}</p>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <p className="text-sm">
              {t("subscription.plan.inspector.summary", counts)}
            </p>
          </div>

          <div className="flex flex-col gap-4 lg:grid lg:h-[min(70vh,40rem)] lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-0">
            <div className="max-h-64 space-y-1 overflow-y-auto lg:max-h-none lg:border-r lg:pr-3">
              <p className="px-2 text-xs font-medium text-muted-foreground">{t("subscription.plan.inspector.features")}</p>
              {features.map((feature) => {
                const choice = choiceFor(feature.id);
                const checkboxId = `${planId}-${feature.id}`;
                const permissionCount = feature.permissions?.length ?? 0;
                const reads = (feature.permissions ?? []).filter((permission) => accessOf(permission) === "read").length;
                return (
                  <div
                    key={feature.id}
                    className={cn("rounded-md px-2 py-2", current?.id === feature.id && "bg-muted")}
                    onClick={() => setSelectedId(feature.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={checkboxId}
                        checked={Boolean(choice)}
                        onCheckedChange={(checked) => toggle(feature.id, checked === true)}
                      />
                      <label htmlFor={checkboxId} className="cursor-pointer text-sm font-medium">
                        {feature.name}
                      </label>
                    </div>
                    <p className="pl-6 text-xs text-muted-foreground">
                      {t(permissionCount === 1 ? "subscription.plan.inspector.route_one" : "subscription.plan.inspector.routes", {
                        count: permissionCount,
                        read: reads,
                        write: permissionCount - reads,
                      })}
                    </p>
                    <p className="pl-6 text-xs text-muted-foreground">
                      {choice ? t(`subscription.mode.${choice.expired_mode}`) : t("subscription.plan.inspector.off_plan")}
                    </p>
                  </div>
                );
              })}
            </div>

            {current && (
              <div className="min-w-0 space-y-3 lg:overflow-y-auto lg:pl-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold">{current.name}</h3>
                  {current.description ? <p className="text-sm text-muted-foreground">{current.description}</p> : null}
                  <p className="text-xs text-muted-foreground">
                    {t(routes.length === 1 ? "subscription.plan.inspector.route_one" : "subscription.plan.inspector.routes", {
                      count: routes.length,
                      read: readCount,
                      write: routes.length - readCount,
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {!currentChoice
                      ? t("subscription.plan.inspector.off_plan_detail")
                      : standing === "active"
                        ? t("subscription.plan.inspector.preview_active")
                        : t(`subscription.plan.inspector.expiry_${currentChoice.expired_mode}`)}
                  </p>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`${planId}-${current.id}-included`}
                      checked={Boolean(currentChoice)}
                      onCheckedChange={(checked) => toggle(current.id, checked === true)}
                    />
                    <label htmlFor={`${planId}-${current.id}-included`} className="cursor-pointer text-sm">
                      {t("subscription.plan.inspector.on_plan")}
                    </label>
                  </div>
                  <label className="sr-only" htmlFor={`${planId}-expiry`}>
                    {t("subscription.plan.inspector.expiry_rule")}
                  </label>
                  <select
                    id={`${planId}-expiry`}
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!currentChoice}
                    value={currentChoice?.expired_mode ?? "read_only"}
                    onChange={(event) => {
                      const mode = event.target.value;
                      if (isExpiredMode(mode)) setMode(current.id, mode);
                    }}
                  >
                    <option value="full">{t("subscription.mode.full")}</option>
                    <option value="read_only">{t("subscription.mode.read_only")}</option>
                    <option value="disabled">{t("subscription.mode.disabled")}</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
                  <MyButton
                    type="button"
                    icon={false}
                    size="sm"
                    variant={standing === "active" ? "default" : "outline"}
                    title="subscription.plan.inspector.while_active"
                    onClick={() => setStanding("active")}
                  />
                  <MyButton
                    type="button"
                    icon={false}
                    size="sm"
                    variant={standing === "expired" ? "default" : "outline"}
                    title="subscription.plan.inspector.after_expiry"
                    onClick={() => setStanding("expired")}
                  />
                  <Input
                    type="search"
                    value={query}
                    placeholder={t("subscription.plan.inspector.filter_routes")}
                    onChange={(event) => setQuery(event.target.value)}
                    className="sm:max-w-xs"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {FILTERS.map((value) => (
                    <MyButton
                      key={value}
                      type="button"
                      icon={false}
                      size="sm"
                      variant={filter === value ? "default" : "outline"}
                      title={`subscription.plan.inspector.filter_${value}`}
                      aria-pressed={filter === value}
                      onClick={() => setFilter(value)}
                    />
                  ))}
                </div>

                {visibleRoutes.length === 0 ? (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    {t(routes.length === 0 ? "subscription.feature.permissions_empty" : "subscription.plan.inspector.no_matches")}
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[36rem] text-sm">
                      <thead>
                        <tr className="border-b text-left text-xs text-muted-foreground">
                          <th className="py-2 pr-3 font-medium">{t("subscription.plan.inspector.group")}</th>
                          <th className="py-2 pr-3 font-medium">{t("subscription.plan.inspector.route")}</th>
                          <th className="py-2 pr-3 font-medium">{t("subscription.plan.inspector.access")}</th>
                          <th className="py-2 font-medium">
                            {t(standing === "active" ? "subscription.plan.inspector.result_while_active" : "subscription.plan.inspector.result_after_expiry")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleRoutes.map((route) => (
                          <tr key={route.name} className="border-b">
                            <td className="py-2 pr-3 text-muted-foreground">{route.group}</td>
                            <td className="py-2 pr-3 font-medium">{route.name}</td>
                            <td className="py-2 pr-3">
                              <MyBadge type={route.access === "read" ? "info" : "warning"} variant="soft" size="sm" icon={false}>
                                {t(`subscription.mode.${route.access}`)}
                              </MyBadge>
                            </td>
                            <td className="py-2">
                              <MyBadge type={RESULT_BADGE[route.result]} variant="soft" size="sm" icon={false}>
                                {t(`subscription.plan.inspector.${route.result}`)}
                              </MyBadge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <MyButton
                  type="button"
                  action="save"
                  title="common.save"
                  loading={impact.isPending || mutation.isPending}
                  onClick={requestSave}
                />
                {impactError ? (
                  <p className="text-sm text-destructive">{t("subscription.plan.inspector.impact_failed")}</p>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}
      <MyDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="subscription.plan.inspector.remove_title"
        description="subscription.plan.inspector.remove_restore"
        variant="destructive"
        confirmText="subscription.plan.inspector.remove_confirm"
        cancelText="common.cancel"
        loading={mutation.isPending}
        onConfirm={async () => {
          await mutation.mutateAsync({ features: pendingFeatures.current });
        }}
      >
        <div className="space-y-3">
          {removed.map((feature) => (
            <p key={feature.id} className="text-sm">
              {t("subscription.plan.inspector.remove_feature", {
                name: feature.name,
                companies: feature.companies,
                staff: feature.staff,
                resellers: feature.resellers,
              })}
            </p>
          ))}
        </div>
      </MyDialog>
    </MyDialog>
  );
}
