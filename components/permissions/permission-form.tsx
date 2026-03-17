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
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import useApiQuery, { ApiResponse, PaginatedApiResponse } from "@/hooks/use-api-query";
import { groupBy, parseApiError } from "@/lib/helper/helper";
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

const PermissionForm: FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
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

  const groupedPermissions = useMemo(
    () =>
      groupBy(permissions, (permission) => {
        const [group] = permission.name.split(".");
        return group || "__general__";
      }),
    [permissions]
  );

  const getGroupPermissionNames = (groupPermissions: PermissionRow[]): string[] =>
    groupPermissions.map((permission) => permission.name);

  const isGroupChecked = (groupPermissions: PermissionRow[]): boolean => {
    const groupNames = getGroupPermissionNames(groupPermissions);
    return groupNames.length > 0 && groupNames.every((permission) => selectedPermissions.includes(permission));
  };

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

  const formatPermissionName = (permission: string): string => permission.split(".").join(" ");

  return (
    <FormProvider {...form}>
      <div className="flex flex-col flex-1 min-h-0">
        <div className="space-y-4 flex-1 min-h-0 overflow-y-auto pr-3">
          <Card>
            <CardHeader>
              <CardTitle>{t("permission.title_plural")}</CardTitle>
              <p className="text-sm text-muted-foreground">{t("permission.description")}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="w-full max-w-md">
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

              {!isRolesLoading && roles.length === 0 && (
                <p className="text-sm text-destructive">{t("permission.errors.roles_fetch")}</p>
              )}

              {!selectedRoleId && (
                <p className="text-sm text-muted-foreground">{t("permission.select_role_prompt")}</p>
              )}
            </CardContent>
          </Card>

          {isPermissionsLoading && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={`permission-group-skeleton-${index}`}>
                  <CardHeader className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {isPermissionsError && (
            <Card>
              <CardContent className="py-6 text-sm text-destructive">{t("permission.errors.permissions_fetch")}</CardContent>
            </Card>
          )}

          {!isPermissionsLoading && !isPermissionsError && (
            <div className="space-y-3">
              {selectedRoleId && (isRolePermissionsLoading || isRolePermissionsFetching) && (
                <Card>
                  <CardContent className="py-6">
                    <Skeleton className="h-4 w-56" />
                  </CardContent>
                </Card>
              )}

              {selectedRoleId && isRolePermissionsError && (
                <Card>
                  <CardContent className="py-6 text-sm text-destructive">
                    {t("permission.errors.role_permissions_fetch")}
                  </CardContent>
                </Card>
              )}

              {!isRolePermissionsLoading && !isRolePermissionsFetching && !isRolePermissionsError && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {Object.entries(groupedPermissions).map(([groupName, groupPermissions]) => (
                    <Card key={groupName}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`permission-group-${groupName}`}
                            checked={isGroupChecked(groupPermissions)}
                            onCheckedChange={(value) => handleGroupToggle(groupPermissions, value === true)}
                            disabled={updatePermissionMutation.isPending || !selectedRoleId}
                          />
                          <label htmlFor={`permission-group-${groupName}`} className="cursor-pointer text-sm font-medium capitalize">
                            {groupName === "__general__" ? t("permission.general_group") : groupName} {t("permission.group")}
                          </label>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {groupPermissions.map((permission) => {
                          const isChecked = selectedPermissions.includes(permission.name);
                          const checkboxId = `permission-${permission.name}`;
                          return (
                            <div key={permission.name} className="flex items-center gap-3">
                              <Checkbox
                                id={checkboxId}
                                checked={isChecked}
                                onCheckedChange={(value) => handlePermissionToggle(permission.name, value === true)}
                                disabled={updatePermissionMutation.isPending || !selectedRoleId}
                              />
                              <label htmlFor={checkboxId} className="cursor-pointer text-sm capitalize text-muted-foreground">
                                {formatPermissionName(permission.name)}
                              </label>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {(!selectedRoleId ||
                (!isRolePermissionsLoading &&
                  !isRolePermissionsFetching &&
                  !isRolePermissionsError)) &&
                Object.keys(groupedPermissions).length === 0 && (
                  <Card>
                    <CardContent className="py-6 text-sm text-muted-foreground">{t("permission.empty_permissions")}</CardContent>
                  </Card>
                )}
            </div>
          )}
        </div>
      </div>
    </FormProvider>
  );
};

export default PermissionForm;

