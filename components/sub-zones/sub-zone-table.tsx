"use client";

import { FC, useMemo, useState } from "react";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { SubZoneRow } from "@/components/sub-zones/sub-zone-type";
import { SubZonesColumns } from "@/components/sub-zones/sub-zones-column";
import SubZoneForm from "@/components/sub-zones/sub-zone-form";

const SubZoneTable: FC = () => {
    const [filterValue, setFilter] = useState<string | null>(null);
    const params = useMemo(
        () =>
            filterValue
                ? Object.fromEntries(new URLSearchParams(filterValue))
                : undefined,
        [filterValue]
    );

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<PaginatedApiResponse<SubZoneRow>>({
            queryKey: ["sub-zones"],
            url: "sub-zones",
            params,
        });

    const subZones = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const toolbarTitle = pagination?.total
        ? `Sub Zones (${pagination.total})`
        : "Sub Zones";

    return (
        <DataTable
            data={subZones}
            setFilter={setFilter}
            columns={SubZonesColumns}
            toggleColumns={true}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
            form={SubZoneForm}
            toolbarTitle={toolbarTitle}
        />
    );
};

export default SubZoneTable;
