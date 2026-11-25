"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FC, useEffect, useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useFetch } from "@/app/actions";
import Label from "@/components/label";
import Card from "@/components/card";
import PermissionFormFieldSchema from "@/components/permissions/permission-form-schema";
import PermissionGroupsPanel, { PermissionGroupsPanelSkeleton } from "@/components/permissions/permission-groups-panel";
import { buildPermissionGroups, type PermissionShowFilter } from "@/components/permissions/permission-groups";
import { usePinnedPermissionGroups } from "@/components/permissions/use-pinned-permission-groups";
import { usePermissionGroupIcon } from "@/components/permissions/permission-group-icons";
import { CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import useApiQuery, { ApiResponse, PaginatedApiResponse } from "@/hooks/use-api-query";
import { parseApiError } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import {
  PermissionFormInput,
  PermissionFormSchema,
  PermissionPayload,
  PermissionRow,
  PermissionRowSchema,
  PermissionSelectionSchema,
  RoleRef,
  RoleRefSchema,
} from "./permission-type";

type RoleResponse = ApiResponse<RoleRef[]> | PaginatedApiResponse<RoleRef>;
type PermissionMutationInput = {
  action: "add" | "remove";
  permissions: string[];
};

const SHOW_FILTERS: PermissionShowFilter[] = ["all", "granted", "not_granted"];

const PermissionForm: FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [show, setShow] = useState<PermissionShowFilter>("all");
  const pinnedGroups = usePinnedPermissionGroups();
  const groupIcon = usePermissionGroupIcon();
  const roleFieldConfig = PermissionFormFieldSchema()[0];

  const form = useForm<PermissionFormInput>({
    resolver: zodResolver(PermissionFormSchema),
    defaultValues: {
      role_id: undefined,
      guard_name: null,
      permission: [],
    },
  });

  const selectedRoleId = form.watch("role_id");
  const selectedRoleGuard = form.watch("guard_name");

  const { data: rolesResponse, isLoading: isRolesLoading } = useApiQuery<RoleResponse>({
    queryKey: ["permission-roles"],
    url: "roles",
    pagination: false,
  });

  const {
    data: permissionsResponse,
    isLoading: isPermissionsLoading,
    isError: isPermissionsError,
  } = useApiQuery<ApiResponse<PermissionRow[]>>({
    queryKey: ["permissions"],
    url: "permissions",
    pagination: false,
  });

  const {
    data: rolePermissionsResponse,
    isLoading: isRolePermissionsLoading,
    isFetching: isRolePermissionsFetching,
    isError: isRolePermissionsError,
  } = useApiQuery<ApiResponse<string[]>>({
    queryKey: ["role-permissions", selectedRoleId ?? 0],
    url: `role-permissions/${selectedRoleId ?? 0}`,
    pagination: false,
    enabled: !!selectedRoleId,
  });

  const roles = useMemo(() => {
    const payload = rolesResponse?.data;
    if (!payload) return [] as RoleRef[];
    if (Array.isArray(payload)) {
      return payload
        .map((item) => RoleRefSchema.safeParse(item))
        .filter((item) => item.success)
        .map((item) => item.data);
    }

    if (Array.isArray(payload.data)) {
      return payload.data
        .map((item) => RoleRefSchema.safeParse(item))
        .filter((item) => item.success)
        .map((item) => item.data);
    }

    return [];
  }, [rolesResponse]);

  const permissions = useMemo(() => {
    const payload = permissionsResponse?.data ?? [];
    return payload
      .map((item) => PermissionRowSchema.safeParse(item))
      .filter((item) => item.success)
      .map((item) => item.data);
  }, [permissionsResponse]);

  useEffect(() => {
    // Always reset selections immediately on role changes.
    // This keeps the default state unchecked and prevents showing stale checks.
    setSelectedPermissions([]);
    form.setValue("permission", []);
  }, [form, selectedRoleId]);

  useEffect(() => {
    const incoming = rolePermissionsResponse?.data;
    if (!selectedRoleId || !incoming) {
      setSelectedPermissions([]);
      form.setValue("permission", []);
      return;
    }
    const parsed = PermissionSelectionSchema.safeParse(incoming);
    if (!parsed.success) {
      setSelectedPermissions([]);
      form.setValue("permission", []);
      return;
    }
    setSelectedPermissions(parsed.data);
    form.setValue("permission", parsed.data);
  }, [form, rolePermissionsResponse]);

  const permissionGroups = useMemo(() => buildPermissionGroups(permissions), [permissions]);

  const getGroupPermissionNames = (groupPermissions: PermissionRow[]): string[] =>
    groupPermissions.map((permission) => permission.name);

  const getErrorMessage = (error: unknown): string => {
    const parsed = parseApiError(error);
    if (parsed) return parsed;
    return t("permission.messages.failed_update");
  };

  const updatePermissionMutation = useMutation<string[], unknown, PermissionMutationInput>({
    mutationFn: async ({ action, permissions: mutationPermissions }) => {
      if (!selectedRoleId) {
        throw new Error(t("permission.messages.select_role_first"));
      }

      const payload: PermissionPayload = {
        role_id: selectedRoleId,
        guard_name: selectedRoleGuard ?? null,
        permission: mutationPermissions,
      };

      const response = await useFetch({
        url: `/permission-${action}`,
        method: "POST",
        data: payload,
      });

      if (!response?.success) {
        throw response;
      }

      const parsed = PermissionSelectionSchema.safeParse(response.data);
      return parsed.success ? parsed.data : [];
    },
    onSuccess: (updatedPermissions) => {
      setSelectedPermissions(updatedPermissions);
      form.setValue("permission", updatedPermissions);
      toast.success(t("permission.messages.updated"));
      if (selectedRoleId) {
        queryClient.setQueryData<ApiResponse<string[]>>(
          ["role-permissions", selectedRoleId],
          (previous) => {
            if (!previous) {
              return {
                success: true,
                data: updatedPermissions,
              };
            }
            return {
              ...previous,
              data: updatedPermissions,
            };
          }
        );
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const handleGroupToggle = (groupPermissions: PermissionRow[], checked: boolean) => {
    updatePermissionMutation.mutate({
      action: checked ? "add" : "remove",
      permissions: getGroupPermissionNames(groupPermissions),
    });
  };

  const handlePermissionToggle = (permissionName: string, checked: boolean) => {
    updatePermissionMutation.mutate({
      action: checked ? "add" : "remove",
      permissions: [permissionName],
    });
  };

  const isRolePermissionsBusy = isRolePermissionsLoading || isRolePermissionsFetching;
  const isToggleDisabled = updatePermissionMutation.isPending || !selectedRoleId || isRolePermissionsBusy;

  return (
    <FormProvider {...form}>
      <div className="flex flex-1 min-h-0 flex-col gap-4">
        <Card>
          <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-end">
            <div className="min-w-0 lg:mr-auto">
              <h1 className="text-lg font-semibold">{t("permission.title_plural")}</h1>
              <p className="text-sm text-muted-foreground">{t("permission.description")}</p>
            </div>

            <div className="w-full lg:w-64">
              <Label
                label={{
                  labelText: roleFieldConfig.label?.labelText,
                  mandatory: roleFieldConfig.label?.mandatory,
                }}
              />
              <Controller
                name="role_id"
                control={form.control}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : undefined}
                    onValueChange={(value) => {
                      const roleId = Number(value);
                      const role = roles.find((item) => item.id === roleId);
                      field.onChange(roleId);
                      form.setValue("guard_name", role?.guard_name ?? null);
                    }}
                    disabled={isRolesLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t(roleFieldConfig.placeholder ?? "permission.role.placeholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={String(role.id)}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <ToggleGroup
              type="single"
              value={show}
              onValueChange={(value) => value && setShow(value as PermissionShowFilter)}
              disabled={!selectedRoleId}
              aria-label={t("permission.show.label")}
              className="h-9 w-full gap-0 rounded-[var(--radius)] border border-input p-0.5 sm:w-auto"
            >
              {SHOW_FILTERS.map((value) => (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  className="h-full flex-1 rounded-[var(--radius)] px-3 text-xs font-medium data-[state=on]:bg-accent sm:flex-none"
                >
                  {t(`permission.show.${value}`)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <div
              className={cn(
                "flex h-9 items-center gap-2 whitespace-nowrap rounded-[var(--radius)] border px-3 text-xs text-muted-foreground",
                !selectedRoleId && "border-dashed",
              )}
            >
              {selectedRoleId ? (
                <>
                  {t("permission.granted")}
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {selectedPermissions.length} / {permissions.length}
                  </span>
                </>
              ) : (
                t("permission.select_role_prompt")
              )}
            </div>
          </CardContent>

          {!isRolesLoading && roles.length === 0 && (
            <p className="px-4 pb-4 text-sm text-destructive">{t("permission.errors.roles_fetch")}</p>
          )}
        </Card>

        {isPermissionsLoading && <PermissionGroupsPanelSkeleton />}

        {isPermissionsError && (
          <Card>
            <CardContent className="py-6 text-sm text-destructive">{t("permission.errors.permissions_fetch")}</CardContent>
          </Card>
        )}

        {!isPermissionsLoading && !isPermissionsError && selectedRoleId && isRolePermissionsError && (
          <Card>
            <CardContent className="py-6 text-sm text-destructive">
              {t("permission.errors.role_permissions_fetch")}
            </CardContent>
          </Card>
        )}

        {!isPermissionsLoading && !isPermissionsError && !(selectedRoleId && isRolePermissionsError) && (
          permissionGroups.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">{t("permission.empty_permissions")}</CardContent>
            </Card>
          ) : (
            <PermissionGroupsPanel
              groups={permissionGroups}
              selected={selectedPermissions}
              show={selectedRoleId ? show : "all"}
              disabled={isToggleDisabled}
              onTogglePermission={handlePermissionToggle}
              onToggleGroup={handleGroupToggle}
              pins={pinnedGroups.pins}
              canPin={pinnedGroups.canPin}
              pinDisabled={pinnedGroups.isSaving}
              onTogglePin={pinnedGroups.toggle}
              groupIcon={groupIcon}
            />
          )
        )}
      </div>
    </FormProvider>
  );
};

export default PermissionForm;
