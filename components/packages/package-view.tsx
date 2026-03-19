"use client";

import { FC, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DeleteModal } from "@/components/delete-modal";
import MyButton from "@/components/my-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/helper/helper";
import RemoveResellerPackageDialog from "@/components/packages/remove-reseller-package-dialog";
import {
  PackageChildRow,
  PackageRow,
} from "@/components/packages/package-type";

type Props = {
  packageId: string;
};

const PackageView: FC<Props> = ({ packageId }) => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const searchParams = useSearchParams();
  const redirectType = searchParams.get("type") ?? "client-packages";

  const { data, isLoading } = useApiQuery<ApiResponse<PackageRow>>({
    queryKey: ["package-view", packageId],
    url: `packages/${packageId}`,
    pagination: false,
  });

  const packageItem = data?.data;
  const resellerPackages = useMemo(
    () =>
      (packageItem?.children ?? []).filter(
        (item) =>
          Number(item.is_reseller_package ?? 0) === 0 &&
          Boolean(item.reseller?.uuid)
      ),
    [packageItem]
  );

  const resellerColumns = useMemo<ColumnDef<PackageChildRow>[]>(
    () => [
      {
        id: "reseller_name",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="package.view.reseller_name"
          />
        ),
        cell: ({ row }) => <div>{row.original.reseller?.name ?? "-"}</div>,
        enableSorting: false,
      },
      {
        accessorKey: "mikrotik_profile",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="package.table.mikrotik_profile"
          />
        ),
        cell: ({ row }) => <div>{row.original.mikrotik_profile ?? "-"}</div>,
        enableSorting: false,
      },
      {
        accessorKey: "bandwidth",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="package.table.bandwidth"
          />
        ),
        cell: ({ row }) => <div>{row.original.bandwidth ?? "-"}</div>,
        enableSorting: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="package.table.name" />
        ),
        cell: ({ row }) => <div>{row.original.name ?? "-"}</div>,
        enableSorting: false,
      },
      {
        id: "clients",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="package.view.clients" />
        ),
        cell: ({ row }) => <div>{row.original.clients?.length ?? 0}</div>,
        enableSorting: false,
      },
      {
        id: "actions",
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            className="flex justify-end capitalize mr-3"
            title="common.actions"
          />
        ),
        cell: ({ row }) => {
          const child = row.original;
          const resellerUuid = child.reseller?.uuid;
          const hasDeletePermission = hasPermission("packages.delete");
          const canRemove =
            hasDeletePermission && (child.clients?.length ?? 0) === 0 && !!resellerUuid;

          return (
            <div className="flex justify-end mr-3">
              {!hasDeletePermission ? null : canRemove && resellerUuid ? (
                <RemoveResellerPackageDialog
                  packageId={Number(packageItem?.id ?? 0)}
                  resellerUuid={resellerUuid}
                />
              ) : (
                <MyButton
                  action="delete"
                  variant="outline"
                  size="sm"
                  title={t("package.remove.button")}
                  disabled
                />
              )}
            </div>
          );
        },
        enableSorting: false,
      },
    ],
    [hasPermission, packageItem?.id, t]
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
        </div>
        <Skeleton className="h-56 w-full" />
      </div>
    );
  }

  if (!packageItem) return null;

  const canDeletePackage =
    hasPermission("packages.delete") &&
    Number(packageItem.active_clients ?? 0) === 0 &&
    Number(packageItem.reseller_clients ?? 0) === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold sm:text-2xl">
          {t("package.view.title")} #{packageItem.id}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {hasPermission("packages.delete") &&
            (canDeletePackage ? (
              <DeleteModal
                api_url={`/packages/${packageItem.id}`}
                keys="packages"
                confirmMessage="package.delete_confirmation"
                buttonText="common.confirm_delete"
                redirectTo={`/${redirectType}`}
              >
                <MyButton
                  action="delete"
                  variant="destructive"
                  size="default"
                  title={t("package.delete_button")}
                />
              </DeleteModal>
            ) : (
              <MyButton
                action="delete"
                variant="destructive"
                size="default"
                title={t("package.delete_button")}
                disabled
              />
            ))}
          <MyButton
            action="cancel"
            size="default"
            title={t("package.back_to_list")}
            url={`/${redirectType}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("package.view.basic_information")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t("package.name.label")}</span>
              <span>{packageItem.name}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                {t("package.mikrotik_profile.label")}
              </span>
              <span>{packageItem.mikrotik_profile ?? "-"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t("package.bandwidth.label")}</span>
              <span>{packageItem.bandwidth ?? "-"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t("package.price.label")}</span>
              <span>{formatMoney(packageItem.price)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                {t("package.buying_price.label")}
              </span>
              <span>{formatMoney(packageItem.buying_price)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t("package.note.label")}</span>
              <span>{packageItem.note || "-"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("package.view.usage_information")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">{t("package.network.label")}</span>
              <span>{packageItem.network?.name ?? "-"}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                {t("package.view.active_clients")}
              </span>
              <span>{packageItem.active_clients ?? 0}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                {t("package.view.inactive_clients")}
              </span>
              <span>{packageItem.inactive_clients ?? 0}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                {t("package.view.reseller_count")}
              </span>
              <span>{packageItem.reseller_count ?? 0}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">
                {t("package.view.reseller_clients")}
              </span>
              <span>{packageItem.reseller_clients ?? 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {resellerPackages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("package.view.assigned_resellers")}</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              toolbar={false}
              data={resellerPackages}
              columns={resellerColumns}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PackageView;
