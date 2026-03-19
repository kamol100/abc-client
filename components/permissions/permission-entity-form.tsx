"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { z } from "zod";
import { useFetch } from "@/app/actions";
import ActionButton from "@/components/action-button";
import Card from "@/components/card";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { groupBy, parseApiError } from "@/lib/helper/helper";
import {
  PermissionRow,
  PermissionRowSchema,
  PermissionSelectionSchema,
} from "./permission-type";

type UserType = "reseller" | "user";

type Props = {
  entityId: string;
  userType: UserType | null;
};

type EntityPermissionData = {
  role_id?: number | string | null;
  permissions?: string[];
};

type EntityPermissionResponse = ApiResponse<EntityPermissionData>;

type PermissionMutationInput = {
  action: "add" | "remove";
  permissions: string[];
};

const PermissionEntityForm: FC<Props> = ({ entityId, userType }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const backUrl = userType === "user" ? "/users" : "/resellers";
  const permissionUrl = userType ? `${userType}-permissions/${entityId}` : "";
  const permissionQueryKey = useMemo(
    () => ["entity-permissions", userType ?? "unknown", entityId],
    [entityId, userType]
  );

  const { data: permissionsResponse, isLoading: isPermissionsLoading, isError: isPermissionsError } =
    useApiQuery<ApiResponse<PermissionRow[]>>({
      queryKey: ["permissions"],
      url: "permissions",
      pagination: false,
    });

  const {
    data: entityPermissionsResponse,
    isLoading: isEntityPermissionsLoading,
    isFetching: isEntityPermissionsFetching,
    isError: isEntityPermissionsError,
  } = useApiQuery<EntityPermissionResponse>({
    queryKey: permissionQueryKey,
    url: permissionUrl,
    pagination: false,
    enabled: !!permissionUrl,
  });

  const permissions = useMemo(() => {
    const payload = permissionsResponse?.data ?? [];
    return payload
      .map((item) => PermissionRowSchema.safeParse(item))
      .filter((item) => item.success)
      .map((item) => item.data);
  }, [permissionsResponse]);

  const roleId = useMemo(() => {
    const parsed = z.coerce.number().safeParse(entityPermissionsResponse?.data?.role_id);
    return parsed.success ? parsed.data : undefined;
  }, [entityPermissionsResponse]);

  useEffect(() => {
    const parsed = PermissionSelectionSchema.safeParse(entityPermissionsResponse?.data?.permissions ?? []);
    setSelectedPermissions(parsed.success ? parsed.data : []);
  }, [entityPermissionsResponse]);

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
      if (!roleId) {
        throw new Error(t("permission.messages.select_role_first"));
      }

      const response = await useFetch({
        url: `/permission-${action}`,
        method: "POST",
        data: {
          role_id: roleId,
          permission: mutationPermissions,
        },
      });

      if (!response?.success) {
        throw response;
      }

      const parsed = PermissionSelectionSchema.safeParse(response.data);
      return parsed.success ? parsed.data : [];
    },
    onSuccess: (updatedPermissions) => {
      setSelectedPermissions(updatedPermissions);
      toast.success(t("permission.messages.updated"));

      if (userType) {
        queryClient.setQueryData<EntityPermissionResponse>(permissionQueryKey, (previous) => {
          if (!previous) {
            return {
              success: true,
              data: {
                role_id: roleId ?? null,
                permissions: updatedPermissions,
              },
            };
          }
          return {
            ...previous,
            data: {
              ...previous.data,
              permissions: updatedPermissions,
            },
          };
        });
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const isDetailLoading = isEntityPermissionsLoading || isEntityPermissionsFetching;
  const isDisabled = updatePermissionMutation.isPending || !roleId || isDetailLoading;

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

  if (!userType) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-destructive">{t("common.request_failed")}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 overflow-auto pr-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ActionButton variant="outline" size="icon" url={backUrl}>
            <ArrowLeft className="h-4 w-4" />
          </ActionButton>
          <h1 className="text-lg sm:text-xl font-semibold">{t("permission.title_plural")}</h1>
          <Badge variant="secondary" className="capitalize">
            {userType}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("permission.title_plural")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("permission.description")}</p>
        </CardHeader>
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
          {isDetailLoading && (
            <Card>
              <CardContent className="py-6">
                <Skeleton className="h-4 w-56" />
              </CardContent>
            </Card>
          )}

          {isEntityPermissionsError && (
            <Card>
              <CardContent className="py-6 text-sm text-destructive">
                {t("permission.errors.role_permissions_fetch")}
              </CardContent>
            </Card>
          )}

          {!isDetailLoading && !isEntityPermissionsError && !roleId && (
            <Card>
              <CardContent className="py-6 text-sm text-destructive">
                {t("permission.messages.select_role_first")}
              </CardContent>
            </Card>
          )}

          {!isDetailLoading && !isEntityPermissionsError && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Object.entries(groupedPermissions).map(([groupName, groupPermissions]) => (
                <Card key={groupName}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`permission-group-${groupName}`}
                        checked={isGroupChecked(groupPermissions)}
                        onCheckedChange={(value) => handleGroupToggle(groupPermissions, value === true)}
                        disabled={isDisabled}
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
                            disabled={isDisabled}
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

          {!isDetailLoading &&
            !isEntityPermissionsError &&
            Object.keys(groupedPermissions).length === 0 && (
              <Card>
                <CardContent className="py-6 text-sm text-muted-foreground">{t("permission.empty_permissions")}</CardContent>
              </Card>
            )}
        </div>
      )}
    </div>
  );
};

export default PermissionEntityForm;
