"use client";

import { FC } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { DeleteModal } from "@/components/delete-modal";
import MyButton from "@/components/my-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/helper/helper";
import { PackageRow } from "@/components/packages/package-type";

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-52 w-full" />
        </div>
      </div>
    );
  }

  if (!packageItem) return null;

  const canDeletePackage =
    hasPermission("packages.delete") &&
    Number(packageItem.active_clients ?? 0) === 0;

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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PackageView;
