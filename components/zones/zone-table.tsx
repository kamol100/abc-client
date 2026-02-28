"use client";

import { FC, useMemo, useState } from "react";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { DataTable } from "@/components/data-table/data-table";
import { ZoneRow } from "@/components/zones/zone-type";
import { ZonesColumns } from "@/components/zones/zones-column";
import ZoneForm from "@/components/zones/zone-form";

const ZoneTable: FC = () => {
    const [filterValue, setFilter] = useState<string | null>(null);
    const params = useMemo(
        () =>
            filterValue
                ? Object.fromEntries(new URLSearchParams(filterValue))
                : undefined,
        [filterValue]
    );

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<PaginatedApiResponse<ZoneRow>>({
            queryKey: ["zones"],
            url: "zones",
            params,
        });

    const zones = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const toolbarTitle = pagination?.total
        ? `Zones (${pagination.total})`
        : "Zones";

    return (
        <DataTable
            data={zones}
            setFilter={setFilter}
            columns={ZonesColumns}
            toggleColumns={true}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
            form={ZoneForm}
            toolbarTitle={toolbarTitle}
        />
    );
};

export default ZoneTable;
