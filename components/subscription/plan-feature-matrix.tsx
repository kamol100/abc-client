"use client";

import { SelectOption } from "@/components/form-wrapper/form-builder-type";
import { FormLoader } from "@/components/loader/form-loader";
import MyBadge, { type MyBadgeType } from "@/components/my-badge";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import SelectDropdown from "@/components/select-dropdown";
import { accessTypeFor, catalogPermissionNames } from "@/components/subscription/feature-permission-editor";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { usePermissions } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
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

interface PermissionAction {
  featureId: string;
  name: string;
}

interface RouteRow {
  name: string;
  group: string;
  access: AccessType;
  kept: boolean;
  result: RouteResult;
}

const FILTERS: RouteFilter[] = ["all", "read", "write", "kept", "dropped"];

const EXPIRY_OPTIONS: SelectOption[] = [
  { value: "full", label: "subscription.mode.full" },
  { value: "read_only", label: "subscription.mode.read_only" },
  { value: "disabled", label: "subscription.mode.disabled" },
];

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

function ExpiryModeField({
  mode,
  disabled,
  onModeChange,
}: {
  mode: ExpiredMode;
  disabled: boolean;
  onModeChange: (mode: ExpiredMode) => void;
}) {
  const values = useMemo(() => ({ expired_mode: mode }), [mode]);
  const form = useForm<{ expired_mode: ExpiredMode }>({ values });

  return (
    <FormProvider {...form}>
      <div className="w-full sm:w-64">
        <SelectDropdown
          name="expired_mode"
          label={{
            labelText: "subscription.plan.inspector.expiry_rule",
            className: "sr-only",
          }}
          options={EXPIRY_OPTIONS}
          isDisabled={disabled}
          isClearable={false}
          isSearchable={false}
          onValueChange={(value) => {
            if (typeof value === "string" && isExpiredMode(value)) onModeChange(value);
          }}
        />
      </div>
    </FormProvider>
  );
}

function AddPermissionDialog({
  open,
  onOpenChange,
  features,
  defaultFeatureId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  features: FeatureOption[];
  defaultFeatureId: string;
}) {
  const { t } = useTranslation();
  const form = useForm<{ feature_id: string; name: string }>({
    defaultValues: { feature_id: defaultFeatureId, name: "" },
  });
  const featureId = form.watch("feature_id") || "";
  const permissionName = form.watch("name") || "";
  const { data: catalog, isLoading: isCatalogLoading } = useApiQuery<{ data?: unknown }>({
    queryKey: ["permissions", "unassigned"],
    url: "permissions",
    pagination: false,
    enabled: open,
  });
  const addPermission = useApiMutation<unknown, { permissions: Array<{ name: string; access_type: AccessType }> }>({
    url: `/features/${featureId || "_"}/permissions`,
    method: "PUT",
    invalidateKeys: "features,feature",
    successMessage: "subscription.feature.saved",
  });

  const featureOptions = useMemo<SelectOption[]>(
    () => features.map((feature) => ({ value: feature.id, label: feature.name })),
    [features]
  );
  const assignedNames = useMemo(() => {
    const names = new Set<string>();
    for (const feature of features) {
      for (const permission of feature.permissions ?? []) names.add(permission.name);
    }
    return names;
  }, [features]);
  const permissionOptions = useMemo<SelectOption[]>(
    () =>
      catalogPermissionNames(catalog?.data)
        .filter((name) => !assignedNames.has(name))
        .map((name) => ({ value: name, label: name })),
    [assignedNames, catalog?.data]
  );
  const canSave = featureId.length > 0 && permissionName.length > 0;

  const save = async (close: () => void) => {
    const feature = features.find((item) => item.id === featureId);
    if (!feature || !canSave) return;
    const permissions: Array<{ name: string; access_type: AccessType }> = (feature.permissions ?? []).map((permission) => ({
      name: permission.name,
      access_type: accessOf(permission),
    }));
    if (!permissions.some((permission) => permission.name === permissionName)) {
      permissions.push({ name: permissionName, access_type: accessTypeFor(permissionName) });
    }
    await addPermission.mutateAsync({ permissions });
    close();
  };

  return (
    <MyDialog
      open={open}
      onOpenChange={onOpenChange}
      title="subscription.plan.inspector.add_permission_title"
      description="subscription.plan.inspector.add_permission_detail"
      loading={addPermission.isPending}
      footer={({ close, loading }) => (
        <>
          <MyButton type="button" variant="outline" icon={false} title="common.cancel" onClick={close} disabled={loading} />
          <MyButton
            type="button"
            action="save"
            title="subscription.plan.inspector.add_permission_save"
            disabled={!canSave || loading}
            loading={loading}
            onClick={() => save(close)}
          />
        </>
      )}
    >
      <FormProvider {...form}>
        <div className="space-y-3">
          <SelectDropdown
            name="feature_id"
            label={{ labelText: "subscription.plan.inspector.add_permission_feature", mandatory: true }}
            options={featureOptions}
            isClearable={false}
            isSearchable
          />
          <SelectDropdown
            name="name"
            label={{ labelText: "subscription.plan.inspector.add_permission_permission", mandatory: true }}
            options={permissionOptions}
            isLoading={isCatalogLoading}
            isClearable={false}
            isSearchable
            placeholder="subscription.plan.inspector.add_permission_choose"
          />
          {!isCatalogLoading && permissionOptions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("subscription.plan.inspector.add_permission_empty")}</p>
          ) : null}
        </div>
      </FormProvider>
    </MyDialog>
  );
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
  readOnly = false,
}: {
  planId: string;
  initial?: SelectedFeature[];
  readOnly?: boolean;
}) {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const canManagePermissions = !readOnly && hasPermission("features.permissions");
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
  const [move, setMove] = useState<PermissionAction | null>(null);
  const [moveTarget, setMoveTarget] = useState("");
  const [remove, setRemove] = useState<PermissionAction | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addSession, setAddSession] = useState(0);
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
  const movePermission = useApiMutation<unknown, { name: string; feature_id: string }>({
    url: `/features/${move?.featureId ?? "_"}/permissions/move`,
    method: "POST",
    invalidateKeys: "features",
    successMessage: "subscription.plan.inspector.moved",
    onSuccess: () => {
      setMove(null);
      setMoveTarget("");
    },
  });
  const removePermission = useApiMutation<unknown, { name: string }>({
    url: `/features/${remove?.featureId ?? "_"}/permissions/remove`,
    method: "POST",
    invalidateKeys: "features",
    successMessage: "subscription.feature.removed",
    onSuccess: () => setRemove(null),
  });

  const choiceFor = (id: string) => selected.find((item) => item.id === id);

  const toggle = (id: string, checked: boolean) => {
    if (readOnly) return;
    setSelectedId(id);
    setSelected((current) => {
      if (!checked) return current.filter((item) => item.id !== id);
      if (current.some((item) => item.id === id)) return current;
      return [...current, { id, expired_mode: "read_only" }];
    });
  };

  const setMode = (id: string, expired_mode: ExpiredMode) => {
    if (readOnly) return;
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
    setMove(null);
    setMoveTarget("");
    setRemove(null);
    setAddOpen(false);
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
                        disabled={readOnly}
                        onCheckedChange={(checked) => toggle(feature.id, checked === true)}
                      />
                      <label htmlFor={checkboxId} className={cn("text-sm font-medium", readOnly ? "cursor-default" : "cursor-pointer")}>
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
                      disabled={readOnly}
                      onCheckedChange={(checked) => toggle(current.id, checked === true)}
                    />
                    <label htmlFor={`${planId}-${current.id}-included`} className={cn("text-sm", readOnly ? "cursor-default" : "cursor-pointer")}>
                      {t("subscription.plan.inspector.on_plan")}
                    </label>
                  </div>
                  <ExpiryModeField
                    mode={currentChoice?.expired_mode ?? "read_only"}
                    disabled={readOnly || !currentChoice}
                    onModeChange={(mode) => setMode(current.id, mode)}
                  />
                  {canManagePermissions ? (
                    <MyButton
                      type="button"
                      action="add"
                      size="default"
                      className="mt-2"
                      title="subscription.plan.inspector.add_permission"
                      onClick={() => {
                        setAddSession((session) => session + 1);
                        setAddOpen(true);
                      }}
                    />
                  ) : null}
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
                          <th className="py-2 pr-3 font-medium">
                            {t(standing === "active" ? "subscription.plan.inspector.result_while_active" : "subscription.plan.inspector.result_after_expiry")}
                          </th>
                          {canManagePermissions ? (
                            <th className="py-2 text-right font-medium">{t("subscription.plan.inspector.actions")}</th>
                          ) : null}
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
                            <td className="py-2 pr-3">
                              <MyBadge type={RESULT_BADGE[route.result]} variant="soft" size="sm" icon={false}>
                                {t(`subscription.plan.inspector.${route.result}`)}
                              </MyBadge>
                            </td>
                            {canManagePermissions ? (
                              <td className="py-2">
                                <div className="flex items-center justify-end gap-2">
                                  <MyButton
                                    type="button"
                                    action="move"
                                    size="sm"
                                    variant="outline"
                                    tooltip="subscription.plan.inspector.move_permission"
                                    aria-label={t("subscription.plan.inspector.move_permission")}
                                    disabled={movePermission.isPending || removePermission.isPending}
                                    onClick={() => {
                                      setMoveTarget("");
                                      setMove({ featureId: current.id, name: route.name });
                                    }}
                                  />
                                  <MyButton
                                    type="button"
                                    action="delete"
                                    size="sm"
                                    variant="outline"
                                    tooltip="subscription.plan.inspector.remove_permission"
                                    aria-label={t("subscription.plan.inspector.remove_permission")}
                                    disabled={movePermission.isPending || removePermission.isPending}
                                    onClick={() => setRemove({ featureId: current.id, name: route.name })}
                                  />
                                </div>
                              </td>
                            ) : null}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {readOnly ? null : (
                  <>
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
                  </>
                )}
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
      {current && canManagePermissions ? (
        <AddPermissionDialog
          key={addSession}
          open={addOpen}
          onOpenChange={setAddOpen}
          features={features}
          defaultFeatureId={current.id}
        />
      ) : null}
      <MyDialog
        open={move !== null}
        onOpenChange={(next) => {
          if (next) return;
          setMove(null);
          setMoveTarget("");
        }}
        title="subscription.plan.inspector.move_title"
        description="subscription.plan.inspector.move_detail"
        loading={movePermission.isPending}
        footer={({ close, loading }) => (
          <>
            <MyButton type="button" variant="outline" icon={false} title="common.cancel" onClick={close} disabled={loading} />
            <MyButton
              type="button"
              action="save"
              title="subscription.plan.inspector.move_confirm"
              disabled={!moveTarget || loading}
              loading={loading}
              onClick={async () => {
                if (!move || !moveTarget) return;
                await movePermission.mutateAsync({ name: move.name, feature_id: moveTarget });
                close();
              }}
            />
          </>
        )}
      >
        <div className="space-y-3">
          <p className="text-sm font-medium">{move?.name}</p>
          <div className="space-y-1">
            <label className="text-sm" htmlFor={`${planId}-move-target`}>
              {t("subscription.plan.inspector.move_target")}
            </label>
            <select
              id={`${planId}-move-target`}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
              value={moveTarget}
              onChange={(event) => setMoveTarget(event.target.value)}
            >
              <option value="">{t("subscription.plan.inspector.move_choose")}</option>
              {features
                .filter((feature) => feature.id !== move?.featureId)
                .map((feature) => (
                  <option key={feature.id} value={feature.id}>
                    {feature.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </MyDialog>
      <MyDialog
        open={remove !== null}
        onOpenChange={(next) => {
          if (!next) setRemove(null);
        }}
        title="subscription.plan.inspector.remove_permission_title"
        description="subscription.plan.inspector.remove_permission_detail"
        variant="destructive"
        confirmText="subscription.feature.remove"
        cancelText="common.cancel"
        loading={removePermission.isPending}
        onConfirm={async () => {
          if (!remove) return;
          await removePermission.mutateAsync({ name: remove.name });
        }}
      >
        <p className="text-sm font-medium">{remove?.name}</p>
      </MyDialog>
    </MyDialog>
  );
}
