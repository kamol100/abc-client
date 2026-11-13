"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { DataTable } from "@/components/data-table/data-table";
import { InboxAssigneeSelect } from "@/components/platform-support/admin/inbox-assignees";
import { inboxColumns } from "@/components/platform-support/admin/inbox-column";
import { inboxFilterSchema } from "@/components/platform-support/admin/inbox-filter";
import {
    inboxListState,
    mergeInboxPage,
    parseInboxSummary,
    parsePlatformThread,
    platformListParams,
    platformQueryKey,
    type PlatformThread,
} from "@/components/platform-support/admin/inbox-model";
import { SupportRetry } from "@/components/platform-support/support-thread";
import { useSupportPresence } from "@/components/platform-support/support-launcher";
import {
    supportAccessDenied,
    supportPollInterval,
    supportQueryRetry,
    type SupportKind,
} from "@/components/platform-support/support-model";
import { usePermissions, useProfile } from "@/context/app-provider";
import useApiQuery, { type ApiResponse, type PaginatedApiResponse } from "@/hooks/use-api-query";
import { cn } from "@/lib/utils";
import MyButton from "@/components/my-button";

function filterRecord(value: string | null): Record<string, string> {
    if (!value) return {};
    return Object.fromEntries(new URLSearchParams(value));
}

export default function InboxHome({ initialKind = "issue" }: { initialKind?: string }) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const { hasPermission } = usePermissions();
    const { profile } = useProfile();
    const { documentVisible, online } = useSupportPresence();
    const identity = profile?.id ?? "";
    const [kind, setKind] = useState<SupportKind>(initialKind === "chat" ? "chat" : "issue");
    const [filterValue, setFilter] = useState<string | null>(null);
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [assignee, setAssignee] = useState("");
    const [acting, setActing] = useState(false);
    const [blocked, setBlocked] = useState(false);
    const orderRef = useRef<PlatformThread[]>([]);
    const canChooseAssignee = hasPermission("platform-support-admin.assign")
        && hasPermission("platform-support-admin.assignees");
    const signedIn = Boolean(identity);
    const params = useMemo(
        () => platformListParams(
            kind,
            { ...filterRecord(filterValue), assignee },
            { unread: unreadOnly, unassigned: assignee === "unassigned" },
        ),
        [assignee, filterValue, kind, unreadOnly],
    );
    const paramsKey = JSON.stringify(params);
    const previousKey = useRef(paramsKey);
    if (previousKey.current !== paramsKey) {
        previousKey.current = paramsKey;
        orderRef.current = [];
    }

    const listEnabled = signedIn && !blocked;
    const list = useApiQuery<PaginatedApiResponse<unknown>>({
        queryKey: platformQueryKey({ identity, resource: "threads" }),
        url: "platform-support-admin/threads",
        params,
        enabled: listEnabled,
        refetchOnWindowFocus: true,
        retry: supportQueryRetry,
        refetchInterval: (query) => supportPollInterval({
            surface: "inbox",
            documentVisible,
            online,
            signedIn,
            accessible: listEnabled && !supportAccessDenied(query.state.error),
            failureCount: query.state.fetchFailureCount,
        }),
    });
    const summary = useApiQuery<ApiResponse<unknown>>({
        queryKey: platformQueryKey({ identity, resource: "summary" }),
        url: "platform-support-admin/summary",
        params,
        pagination: false,
        enabled: listEnabled,
        refetchOnWindowFocus: true,
        retry: supportQueryRetry,
        refetchInterval: (query) => supportPollInterval({
            surface: "inbox",
            documentVisible,
            online,
            signedIn,
            accessible: listEnabled && !supportAccessDenied(query.state.error),
            failureCount: query.state.fetchFailureCount,
        }),
    });

    const denied = blocked || supportAccessDenied(list.error);

    useEffect(() => {
        if (!supportAccessDenied(list.error)) return;
        setBlocked(true);
        void queryClient.removeQueries({ queryKey: platformQueryKey({ identity, resource: "threads" }) });
        void queryClient.removeQueries({ queryKey: platformQueryKey({ identity, resource: "summary" }) });
    }, [identity, list.error, queryClient]);
    const parsed = (list.data?.data?.data ?? []).flatMap((row) => {
        const thread = parsePlatformThread(row);
        return thread ? [thread] : [];
    });
    const view = inboxListState({
        denied,
        failed: Boolean(list.isError) && !denied,
        rows: denied ? [] : parsed,
    });
    const displayed = mergeInboxPage(orderRef.current, view.rows, acting);
    orderRef.current = displayed;
    const counts = denied ? null : parseInboxSummary(summary.data?.data);
    const summaryFailed = Boolean(summary.isError) && !supportAccessDenied(summary.error);
    const refreshed = list.dataUpdatedAt
        ? format(list.dataUpdatedAt, "HH:mm:ss")
        : "";

    return (
        <div className="flex flex-col gap-4" data-testid="platform-inbox">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <h1 className="text-xl font-semibold text-foreground">{t("platform_support.inbox.title")}</h1>
                <div data-testid="platform-inbox-summary" aria-live="polite" className="text-sm text-muted-foreground">
                    {counts ? (
                        <p>
                            {t("platform_support.inbox.unread_messages", { count: counts.unread_messages })}
                            {" · "}
                            {t("platform_support.inbox.unread_threads", { count: counts.unread_threads })}
                            {" · "}
                            {t("platform_support.inbox.unassigned_count", { count: counts.unassigned_threads })}
                        </p>
                    ) : null}
                    {summaryFailed ? <p role="status">{t("platform_support.inbox.stale")}</p> : null}
                    {summary.isLoading && !counts ? <p>{t("platform_support.inbox.pending")}</p> : null}
                </div>
            </div>
            <p className="text-xs text-muted-foreground" role="status">
                {list.isFetching ? t("platform_support.inbox.refreshing") : refreshed ? t("platform_support.inbox.refreshed", { time: refreshed }) : t("platform_support.inbox.pending")}
                {" "}
                {t("platform_support.inbox.periodic")}
            </p>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("platform_support.kinds.label")}>
                {(["issue", "chat"] as const).map((item) => (
                    <button
                        key={item}
                        type="button"
                        role="tab"
                        aria-selected={kind === item}
                        className={cn(
                            "rounded-md px-3 py-1.5 text-sm",
                            kind === item ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                        )}
                        onClick={() => {
                            setKind(item);
                            setFilter(null);
                        }}
                    >
                        {t(item === "issue" ? "platform_support.issues" : "platform_support.chats")}
                    </button>
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <MyButton
                    type="button"
                    variant={unreadOnly ? "default" : "outline"}
                    aria-pressed={unreadOnly}
                    onClick={() => setUnreadOnly((current) => !current)}
                >
                    {t("platform_support.inbox.quick.unread")}
                </MyButton>
                <MyButton
                    type="button"
                    variant={assignee === "unassigned" ? "default" : "outline"}
                    aria-pressed={assignee === "unassigned"}
                    onClick={() => setAssignee((current) => current === "unassigned" ? "" : "unassigned")}
                >
                    {t("platform_support.inbox.quick.unassigned")}
                </MyButton>
                <InboxAssigneeSelect
                    id="platform-inbox-assignee-filter"
                    mode="filter"
                    enabled={canChooseAssignee}
                    value={assignee}
                    onChange={setAssignee}
                />
            </div>
            {view.stale && !view.showTable && (
                <SupportRetry messageKey="platform_support.inbox.stale" onRetry={() => void list.refetch()} />
            )}
            {view.stale && view.showTable && <p role="status" data-testid="platform-inbox-stale">{t("platform_support.inbox.stale")}</p>}
            {denied && (
                <SupportRetry messageKey="platform_support.errors.forbidden" onRetry={() => setBlocked(false)} />
            )}
            {signedIn && view.showTable && (
                <div
                    onFocus={() => setActing(true)}
                    onBlur={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget)) setActing(false);
                    }}
                >
                    <DataTable
                        data={displayed}
                        columns={inboxColumns}
                        pagination={list.data?.data?.pagination}
                        setCurrentPage={list.setCurrentPage}
                        isLoading={list.isLoading && displayed.length === 0}
                        isFetching={list.isFetching}
                        setFilter={setFilter}
                        toolbarOptions={{ filter: inboxFilterSchema(kind) }}
                        toolbarTitle={t(kind === "issue" ? "platform_support.issues" : "platform_support.chats")}
                    />
                </div>
            )}
        </div>
    );
}
