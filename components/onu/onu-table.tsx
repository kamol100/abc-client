"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import { useSetting } from "@/context/app-provider";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { useOnuColumns } from "./onu-column";
import OnuFilterSchema from "./onu-filter-schema";
import { rxLowThreshold } from "./onu-power";
import type { OnuRow } from "./onu-type";

interface Props {
    /** Initial filter as a query string ("olt=<uuid>&pon_port=12"); the filter form replaces it once applied. */
    filterValue?: string;
    /** false when embedded (OLT page): no toolbar, no filter form. */
    tableToolBar?: boolean;
    showOlt?: boolean;
    /** The OLT page passes the API's threshold; the list page reads the company setting. */
    thresholdDbm?: number;
    /** The OLT's Device IP changed (retest_required): reboot is paused until a Test connection passes. */
    rebootBlocked?: boolean;
}

/** GET /onus (onus.access): the ONU list page and the ONU section of the OLT page. */
export default function OnuTable({ filterValue, tableToolBar = true, showOlt = true, thresholdDbm, rebootBlocked = false }: Props) {
    const { t } = useTranslation();
    const thresholdSetting = useSetting("onu_rx_power_low_dbm");
    const threshold = thresholdDbm ?? rxLowThreshold(thresholdSetting);
    const columns = useOnuColumns({ showOlt, thresholdDbm: threshold, rebootBlocked });
    const [filter, setFilter] = useState<string | null>(filterValue ?? null);

    const params = useMemo(
        () => (filter ? (Object.fromEntries(new URLSearchParams(filter)) as Record<string, string>) : undefined),
        [filter]
    );
    const { data, isLoading, isFetching, setCurrentPage } = useApiQuery<PaginatedApiResponse<OnuRow>>({
        queryKey: ["onus"],
        url: "onus",
        params,
    });

    const onus = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;
    const toolbarTitle = pagination?.total ? `${t("onu.title_plural")} (${pagination.total})` : t("onu.title_plural");
    const toolbarOptions = useMemo(() => ({ filter: OnuFilterSchema() }), []);

    return (
        <DataTable
            data={onus}
            setFilter={setFilter}
            columns={columns}
            toolbarOptions={toolbarOptions}
            toggleColumns={true}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            // Not `isLoading || isFetching`: a refetch must not swap the rows for a skeleton (open row dialogs would close).
            isLoading={isLoading}
            isFetching={isFetching}
            toolbarTitle={toolbarTitle}
            queryKey="onus"
            toolbar={tableToolBar}
        />
    );
}
