"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import PackageForm from "@/components/packages/package-form";
import { usePackageColumns } from "@/components/packages/package-column";
import {
  PackageFormType,
} from "@/components/packages/package-form-schema";
import { PackageRow } from "@/components/packages/package-type";

type Props = {
  packageType?: PackageFormType;
};

const PackageTable: FC<Props> = ({ packageType = "client" }) => {
  const { t } = useTranslation();
  const { hasPermission } = usePermissions();
  const columns = usePackageColumns(packageType);
  const [filterValue, setFilter] = useState<string | null>(null);

  const params = useMemo(() => {
    const queryParams = filterValue
      ? Object.fromEntries(new URLSearchParams(filterValue))
      : {};

    if (packageType === "reseller") {
      return { ...queryParams, type: 1 };
    }

    return Object.keys(queryParams).length > 0 ? queryParams : undefined;
  }, [filterValue, packageType]);

  const { data, isLoading, isFetching, setCurrentPage } =
    useApiQuery<PaginatedApiResponse<PackageRow>>({
      queryKey: ["packages", packageType],
      url: "packages",
      params,
    });

  const packages = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;
  const toolbarTitle = pagination?.total
    ? `${t(
        packageType === "reseller"
          ? "package.title_plural_reseller"
          : "package.title_plural_client"
      )} (${pagination.total})`
    : t(
        packageType === "reseller"
          ? "package.title_plural_reseller"
          : "package.title_plural_client"
      );

  const FormComponent = () => (
    <PackageForm mode="create" api="/packages" packageType={packageType} />
  );

  return (
    <DataTable
      data={packages}
      setFilter={setFilter}
      columns={columns}
      toggleColumns={true}
      pagination={pagination}
      setCurrentPage={setCurrentPage}
      isLoading={isLoading}
      isFetching={isFetching}
      queryKey="packages"
      form={hasPermission("packages.create") ? FormComponent : undefined}
      toolbarTitle={toolbarTitle}
    />
  );
};

export default PackageTable;
