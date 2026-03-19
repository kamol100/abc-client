"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { VendorRow } from "@/components/vendors/vendor-type";
import { VendorsColumns } from "@/components/vendors/vendors-column";
import VendorForm from "@/components/vendors/vendor-form";
import VendorFilterSchema from "@/components/vendors/vendor-filter-schema";

const VendorTable: FC = () => {
    const { t } = useTranslation();
    const [filterValue, setFilter] = useState<string | null>(null);
    const params = useMemo(
        () =>
            filterValue
                ? Object.fromEntries(new URLSearchParams(filterValue))
                : undefined,
        [filterValue]
    );

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<PaginatedApiResponse<VendorRow>>({
            queryKey: ["vendors"],
            url: "vendors",
            params,
        });

    const vendors = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const toolbarOptions = {
        filter: [...VendorFilterSchema()],
    };
    const toolbarTitle = pagination?.total
        ? `${t("vendor.title_plural")} (${pagination.total})`
        : t("vendor.title_plural");

    return (
        <DataTable
            data={vendors}
            setFilter={setFilter}
            columns={VendorsColumns}
            toolbarOptions={toolbarOptions}
            toggleColumns={true}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading || isFetching}
            isFetching={isFetching}
            form={VendorForm}
            toolbarTitle={toolbarTitle}
        />
    );
};

export default VendorTable;
