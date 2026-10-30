"use client";

import { useFetch } from "@/app/actions";
import type { NotificationRow } from "@/components/notifications/notification-catalog";
import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";
import { parseApiError } from "@/lib/helper/helper";
import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export const NOTIFICATIONS_QUERY_KEY = "notifications";

const UNREAD_POLL_MS = 60_000;

function unreadPollInterval(): number | false {
    if (typeof document !== "undefined" && document.visibilityState === "hidden") return false;
    return UNREAD_POLL_MS;
}

async function patchNotification(url: string): Promise<unknown> {
    const result = await useFetch({ url, method: "PATCH" });
    if (!result?.success) {
        throw new Error(parseApiError(result) || "Request failed");
    }
    return result.data;
}

/** Future Echo listener hook: call this when a broadcast arrives. */
export function invalidateNotifications(queryClient: QueryClient) {
    return queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
}

export function useUnreadCount() {
    const query = useApiQuery<ApiResponse<{ count: number }>>({
        queryKey: [NOTIFICATIONS_QUERY_KEY, "unread-count"],
        url: "notifications/unread-count",
        pagination: false,
        refetchInterval: unreadPollInterval,
        refetchIntervalInBackground: false,
        refetchOnWindowFocus: true,
    });

    return {
        ...query,
        count: query.data?.data?.count ?? 0,
    };
}

export function useRecentNotifications(open: boolean, unreadCount: number) {
    return useApiQuery<ApiResponse<NotificationRow[]>>({
        queryKey: [NOTIFICATIONS_QUERY_KEY, "recent", unreadCount],
        url: "notifications/recent",
        pagination: false,
        enabled: open,
    });
}

export function useNotificationActions() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: patchNotification,
        onSuccess: () => {
            void invalidateNotifications(queryClient);
        },
        onError: () => {
            toast.error(t("notifications.error"));
        },
    });

    return {
        markRead: (id: string) => mutation.mutate(`/notifications/${id}/read`),
        markUnread: (id: string) => mutation.mutate(`/notifications/${id}/unread`),
        markAllRead: () => mutation.mutate("/notifications/read-all"),
        isMarking: mutation.isPending,
    };
}
