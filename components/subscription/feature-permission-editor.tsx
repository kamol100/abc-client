"use client";

import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { SelectOption } from "@/components/form-wrapper/form-builder-type";
import { FormLoader } from "@/components/loader/form-loader";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import SelectDropdown from "@/components/select-dropdown";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";

interface PermissionRow {
  name: string;
  access_type: "read" | "write";
}

interface FeatureDetail {
  permissions?: PermissionRow[];
}

interface AddPermissionForm {
  name: string;
}

const READ_SUFFIXES = [".access", ".show", ".report", ".map", ".by-wallet"];

const accessTypeFor = (name: string): PermissionRow["access_type"] => {
  if (name.includes("dashboard") || READ_SUFFIXES.some((suffix) => name.endsWith(suffix))) {
    return "read";
  }
  return "write";
};

const permissionNames = (value: unknown): string[] => {
  const rows = Array.isArray(value)
    ? value
    : value && typeof value === "object" && "data" in value && Array.isArray(value.data)
      ? value.data
      : [];

  return rows.flatMap((item) => {
    if (!item || typeof item !== "object" || !("name" in item)) return [];
    return typeof item.name === "string" ? [item.name] : [];
  });
};

export default function FeaturePermissionEditor({ featureId }: { featureId: string }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const form = useForm<AddPermissionForm>({ defaultValues: { name: "" } });
  const selectedName = form.watch("name");
  const { data, isSuccess, isLoading } = useApiQuery<ApiResponse<FeatureDetail>>({
    queryKey: ["feature", featureId],
    url: `features/${featureId}`,
    pagination: false,
  });
  const { data: catalog, isLoading: isCatalogLoading } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["permissions"],
    url: "permissions",
    pagination: false,
    enabled: open,
  });
  const permissions = data?.data?.permissions ?? [];
  const [removingName, setRemovingName] = useState<string | null>(null);
  const addPermission = useApiMutation<ApiResponse<unknown>, { permissions: PermissionRow[] }>({
    url: `/features/${featureId}/permissions`,
    method: "PUT",
    invalidateKeys: "feature,features",
    successMessage: "subscription.feature.saved",
    onSuccess: () => form.reset({ name: "" }),
  });
  const removePermission = useApiMutation<ApiResponse<unknown>, { permissions: PermissionRow[] }>({
    url: `/features/${featureId}/permissions`,
    method: "PUT",
    invalidateKeys: "feature,features",
    successMessage: "subscription.feature.removed",
    onSuccess: () => setRemovingName(null),
    onError: () => setRemovingName(null),
  });
  const isSyncing = addPermission.isPending || removePermission.isPending;

  const options = useMemo<SelectOption[]>(() => {
    const assigned = new Set(permissions.map((permission) => permission.name));
    return permissionNames(catalog?.data)
      .filter((name) => !assigned.has(name))
      .map((name) => ({ value: name, label: name }));
  }, [catalog?.data, permissions]);

  const add = form.handleSubmit((values) => {
    const name = values.name.trim();
    if (!name) return;
    const next = permissions.filter((permission) => permission.name !== name);
    addPermission.mutate({ permissions: [...next, { name, access_type: accessTypeFor(name) }] });
  });

  const remove = (name: string) => {
    setRemovingName(name);
    removePermission.mutate({
      permissions: permissions.filter((permission) => permission.name !== name),
    });
  };

  return (
    <MyDialog
      size="xl"
      title="subscription.feature.permissions"
      open={open}
      onOpenChange={setOpen}
      trigger={<MyButton action="lock" icon={true} title="subscription.feature.permissions" />}
    >
      {isLoading ? (
        <FormLoader grids={1} fieldCount={1} />
      ) : isSuccess ? (
        <>
          <FormProvider {...form}>
            <form className="flex flex-col gap-2 sm:flex-row sm:items-center" onSubmit={add}>
              <div className="min-w-0 flex-1">
                <SelectDropdown
                  name="name"
                  options={options}
                  isLoading={isCatalogLoading}
                  placeholder="subscription.feature.permission_name"
                />
              </div>
              <MyButton
                action="add"
                type="submit"
                size="default"
                title="common.add"
                variant="default"
                loading={addPermission.isPending}
                disabled={isSyncing || !selectedName}
              />
            </form>
          </FormProvider>
          <ul className="mt-4 space-y-1 text-sm">
            {permissions.length === 0 ? (
              <li className="text-muted-foreground">{t("subscription.feature.permissions_empty")}</li>
            ) : (
              permissions.map((permission) => (
                <li key={permission.name} className="flex items-center justify-between gap-2">
                  <span>{permission.name}</span>
                  <MyButton
                    type="button"
                    action="delete"
                    size="icon"
                    variant="outline"
                    tooltip="subscription.feature.remove"
                    aria-label={t("subscription.feature.remove")}
                    loading={removingName === permission.name && removePermission.isPending}
                    disabled={isSyncing}
                    onClick={() => remove(permission.name)}
                  />
                </li>
              ))
            )}
          </ul>
        </>
      ) : (
        <p className="py-6 text-center text-sm text-muted-foreground">{t("common.failed_to_load_data")}</p>
      )}
    </MyDialog>
  );
}
