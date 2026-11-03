"use client";

import { DataTable } from "@/components/data-table/data-table";
import { MyButton } from "@/components/my-button";
import { getNotificationColumns } from "@/components/notifications/notification-column";
import type { NotificationRow } from "@/components/notifications/notification-catalog";
import {
    NotificationFilterSchema,
    notificationListParams,
} from "@/components/notifications/notification-filter-schema";
import useApiQuery, { type PaginatedApiResponse } from "@/hooks/use-api-query";
import { NOTIFICATIONS_QUERY_KEY, useNotificationActions } from "@/hooks/use-notifications";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

export function NotificationTable() {
    const { t } = useTranslation();
    const [filterValue, setFilter] = useState<string | null>(null);
    const params = useMemo(() => notificationListParams(filterValue), [filterValue]);
    const { markRead, markUnread, markAllRead } = useNotificationActions();

    const { data, isLoading, isFetching, setCurrentPage } = useApiQuery<PaginatedApiResponse<NotificationRow>>({
        queryKey: [NOTIFICATIONS_QUERY_KEY, "list"],
        url: "notifications",
        params,
    });

    const rows = data?.data?.data ?? [];
    const pagination = data?.data?.pagination;

    const columns = useMemo(
        () => getNotificationColumns(() => pagination, { onMarkRead: markRead, onMarkUnread: markUnread }),
        [pagination, markRead, markUnread]
    );

    useEffect(() => {
        if (!filterValue?.includes("#")) {
            setCurrentPage(1);
        }
    }, [filterValue, setCurrentPage]);

    const toolbarOptions = useMemo(
        () => ({
            filter: NotificationFilterSchema(),
            watchFields: ["status", "category"],
        }),
        []
    );

    return (
        <div className="flex flex-col gap-3">
            <div className="flex justify-end">
                <MyButton
                    icon={false}
                    title="notifications.mark_all_read"
                    onClick={() => markAllRead()}
                    data-testid="notification-mark-all"
                />
            </div>
            <DataTable
                data={rows}
                setFilter={setFilter}
                columns={columns}
                toggleColumns={true}
                pagination={pagination}
                setCurrentPage={setCurrentPage}
                isLoading={isLoading || isFetching}
                isFetching={isFetching}
                toolbarTitle={
                    pagination?.total
                        ? `${t("notifications.title")} (${pagination.total})`
                        : t("notifications.title")
                }
                toolbarOptions={toolbarOptions}
                queryKey={NOTIFICATIONS_QUERY_KEY}
                form={undefined}
            />
        </div>
    );
}

export default NotificationTable;
