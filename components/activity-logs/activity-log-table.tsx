"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import useApiQuery, { PaginatedApiResponse } from "@/hooks/use-api-query";
import { useSetting } from "@/context/app-provider";
import { getActivityLogColumns } from "./activity-log-column";
import ActivityLogFilterSchema from "./activity-log-filter-schema";
import type { ActivityLogRow } from "./activity-log-type";
import { useTranslation } from "react-i18next";

const ActivityLogTable: FC = () => {
    const { t } = useTranslation();
    const [filterValue, setFilter] = useState<string | null>(null);
    const roles = useSetting("roles") ?? [];
    const isSuperAdmin = Array.isArray(roles) && roles.includes("Super Admin");

    const params = useMemo(
        () =>
            filterValue
                ? Object.fromEntries(new URLSearchParams(filterValue))
                : undefined,
        [filterValue]
    );

    const { data, isLoading, isFetching, setCurrentPage } =
        useApiQuery<PaginatedApiResponse<ActivityLogRow>>({
            queryKey: ["activities"],
            url: "activity-logs",
            params,
        });

    const activities = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const columns = useMemo(
        () => getActivityLogColumns(() => pagination),
        [pagination]
    );

    const initialColumnVisibility = useMemo(
        () => ({
            company: !isSuperAdmin,
            reseller: !isSuperAdmin,
        }),
        [isSuperAdmin]
    );

    useEffect(() => {
        if (!filterValue?.includes("#")) {
            setCurrentPage(1);
        }
    }, [filterValue, setCurrentPage]);

    const toolbarTitle = pagination?.total
        ? `${t("activity_log.title_plural")} (${pagination.total})`
        : t("activity_log.title_plural");

    const toolbarOptions = useMemo(
        () => ({
            filter: ActivityLogFilterSchema(),
            watchFields: ["log_name", "description"],
        }),
        []
    );

    return (
        <DataTable
            data={activities}
            setFilter={setFilter}
            columns={columns}
            toggleColumns={true}
            pagination={pagination}
            setCurrentPage={setCurrentPage}
            isLoading={isLoading}
            isFetching={isFetching}
            toolbarTitle={toolbarTitle}
            toolbarOptions={toolbarOptions}
            queryKey="activities"
            form={undefined}
            initialColumnVisibility={initialColumnVisibility}
        />
    );
};

export default ActivityLogTable;
