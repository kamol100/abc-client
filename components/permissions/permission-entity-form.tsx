"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { z } from "zod";
import { useFetch } from "@/app/actions";
import MyButton from "@/components/my-button";
import Card from "@/components/card";
import { Badge } from "@/components/ui/badge";
import PermissionGroupsPanel, { PermissionGroupsPanelSkeleton } from "@/components/permissions/permission-groups-panel";
import { buildPermissionGroups, type PermissionShowFilter } from "@/components/permissions/permission-groups";
import { usePermissionGroupIcon } from "@/components/permissions/permission-group-icons";
import { usePinnedPermissionGroups } from "@/components/permissions/use-pinned-permission-groups";
import { CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { parseApiError } from "@/lib/helper/helper";
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
  /** The user's or reseller's name, for the badge. */
  name?: string | null;
};

type EntityPermissionResponse = ApiResponse<EntityPermissionData>;

type PermissionMutationInput = {
  action: "add" | "remove";
  permissions: string[];
};

const SHOW_FILTERS: PermissionShowFilter[] = ["all", "granted", "not_granted"];

const PermissionEntityForm: FC<Props> = ({ entityId, userType }) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [show, setShow] = useState<PermissionShowFilter>("all");
  const pinnedGroups = usePinnedPermissionGroups();
  const groupIcon = usePermissionGroupIcon();

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

  const entityName = entityPermissionsResponse?.data?.name?.trim() || null;
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

  if (!userType) {
    return (
      <Card>
        <CardContent className="py-6 text-sm text-destructive">{t("common.request_failed")}</CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-4">
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
          <div className="flex min-w-0 items-center gap-3 lg:mr-auto">
            <MyButton
              variant="outline"
              size="icon"
              url={backUrl}
              className="shrink-0"
              aria-label={t("permission.back")}
              tooltip={t("permission.back")}
            >
              <ArrowLeft className="h-4 w-4" />
            </MyButton>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">{t("permission.title_plural")}</h1>
                <Badge variant="secondary" className="min-w-0 max-w-64 gap-1" title={entityName ?? undefined}>
                  <span className="capitalize">{userType}</span>
                  {entityName && (
                    <>
                      <span aria-hidden>:</span>
                      <span className="truncate">{entityName}</span>
                    </>
                  )}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{t("permission.description")}</p>
            </div>
          </div>

          <ToggleGroup
            type="single"
            value={show}
            onValueChange={(value) => value && setShow(value as PermissionShowFilter)}
            disabled={!roleId}
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

          <div className="flex h-9 items-center gap-2 whitespace-nowrap rounded-[var(--radius)] border px-3 text-xs text-muted-foreground">
            {t("permission.granted")}
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {selectedPermissions.length} / {permissions.length}
            </span>
          </div>
        </CardContent>
      </Card>

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

      {isPermissionsLoading && <PermissionGroupsPanelSkeleton />}

      {isPermissionsError && (
        <Card>
          <CardContent className="py-6 text-sm text-destructive">{t("permission.errors.permissions_fetch")}</CardContent>
        </Card>
      )}

      {!isPermissionsLoading && !isPermissionsError && !isEntityPermissionsError && (
        permissionGroups.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-sm text-muted-foreground">{t("permission.empty_permissions")}</CardContent>
          </Card>
        ) : (
          <PermissionGroupsPanel
            groups={permissionGroups}
            selected={selectedPermissions}
            show={roleId ? show : "all"}
            disabled={isDisabled}
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
  );
};

export default PermissionEntityForm;
