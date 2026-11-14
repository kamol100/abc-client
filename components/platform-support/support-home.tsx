"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Headset, MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { DataTable } from "@/components/data-table/data-table";
import { supportColumns } from "@/components/platform-support/support-column";
import { supportFilterSchema } from "@/components/platform-support/support-form-schema";
import { SupportComposer } from "@/components/platform-support/support-composer";
import { SupportRetry } from "@/components/platform-support/support-thread";
import { useSupportPresence } from "@/components/platform-support/support-launcher";
import { IncludePageControl, useSupportWidget } from "@/components/platform-support/support-widget";
import {
    chatStartPayload,
    parseSupportThread,
    supportRequestId,
    supportAccessDenied,
    supportListParams,
    supportListUrl,
    supportPollInterval,
    supportQueryKey,
    supportQueryRetry,
    supportScopes,
    type SupportKind,
    type SupportScope,
    type SupportThread,
} from "@/components/platform-support/support-model";
import { usePermissions, useProfile } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { type ApiResponse, type PaginatedApiResponse } from "@/hooks/use-api-query";
import { MyDialog } from "@/components/my-dialog";
import { SupportHeading, SupportKindTabs, SupportSummary, supportPageClass } from "@/components/platform-support/support-ui";
import { parseSupportSummary } from "@/components/platform-support/support-model";
import MyButton from "@/components/my-button";

function filterRecord(value: string | null): Record<string, string> {
    if (!value) return {};
    return Object.fromEntries(new URLSearchParams(value));
}

export default function SupportHome({
    initialKind = "issue",
    compose,
}: {
    initialKind?: string;
    compose?: string;
}) {
    const { t } = useTranslation();
    const router = useRouter();
    const widget = useSupportWidget();
    const { hasPermission } = usePermissions();
    const { profile } = useProfile();
    const { documentVisible, online } = useSupportPresence();
    const identity = profile?.id ?? "";
    const canCreate = hasPermission("platform-support.create");
    const isReseller = Boolean(profile?.reseller);
    const scopes = supportScopes({
        resellerAccess: hasPermission("platform-support.reseller.access"),
        companyAccess: hasPermission("platform-support.company.access"),
        isReseller,
    });
    const [scope, setScope] = useState<SupportScope>("own");
    const [kind, setKind] = useState<SupportKind>(initialKind === "chat" ? "chat" : "issue");
    const [filterValue, setFilter] = useState<string | null>(null);
    const [creating, setCreating] = useState(compose === "issue");
    const [blocked, setBlocked] = useState(false);
    const chatRequest = useRef<Record<string, unknown> | null>(null);
    const issueNavigated = useRef(false);
    const activeScope = scopes.includes(scope) ? scope : "own";
    const params = useMemo(
        () => supportListParams(activeScope, kind, filterRecord(filterValue)),
        [activeScope, filterValue, kind],
    );

    const list = useApiQuery<PaginatedApiResponse<unknown>>({
        queryKey: supportQueryKey({ identity, scope: activeScope, resource: "threads" }),
        url: supportListUrl(activeScope),
        params,
        placeholderData: undefined,
        enabled: Boolean(identity) && !blocked,
        refetchOnWindowFocus: true,
        retry: supportQueryRetry,
    });

    const { kind: _kind, per_page: _perPage, ...summaryFilters } = params;
    const summary = useApiQuery<ApiResponse<unknown>>({
        queryKey: supportQueryKey({ identity, scope: activeScope, resource: "summary" }),
        url: "platform-support/summary",
        params: { ...summaryFilters, scope: activeScope },
        pagination: false,
        enabled: Boolean(identity) && !blocked && hasPermission("platform-support.summary"),
        refetchOnWindowFocus: true,
        retry: supportQueryRetry,
        refetchInterval: (query) => supportPollInterval({
            surface: "summary",
            documentVisible,
            online,
            signedIn: Boolean(identity),
            accessible: !blocked && !supportAccessDenied(query.state.error),
            failureCount: query.state.fetchFailureCount,
        }),
    });

    const startChat = useApiMutation<{ thread?: unknown; resumed?: boolean }, Record<string, unknown>>({
        url: "/platform-support/threads",
        method: "POST",
        onSuccess: (data) => {
            const thread = parseSupportThread(data?.thread);
            if (!thread) return;
            if (data?.resumed) toast.info(t("platform_support.chat.resumed"));
            router.replace(`/platform-support/chats/${thread.uuid}`);
        },
    });

    useEffect(() => {
        if (compose !== "chat") { chatRequest.current = null; return; }
        if (chatRequest.current || !identity || !canCreate) return;
        const payload = chatStartPayload(supportRequestId(), widget.contextPath, widget.includePage, widget.articleId);
        chatRequest.current = payload;
        startChat.mutate(payload);
    }, [canCreate, compose, identity, startChat, widget.articleId, widget.contextPath, widget.includePage]);

    useEffect(() => {
        if (supportAccessDenied(list.error)) setBlocked(true);
    }, [list.error]);

    useEffect(() => {
        setKind(initialKind === "chat" ? "chat" : "issue");
        if (compose === "issue") setCreating(true);
    }, [initialKind, compose]);

    const denied = blocked || supportAccessDenied(list.error);
    const rows: SupportThread[] = denied ? [] : (list.data?.data?.data ?? []).flatMap((row) => {
        const thread = parseSupportThread(row);
        return thread ? [thread] : [];
    });

    return (
        <div className={supportPageClass}>
            <SupportHeading title={t("platform_support.title")} subtitle={t("platform_support.redesign.requests_intro")} icon={Headset}
                action={canCreate && !denied && <>
                    <MyButton url="/platform-support?kind=chat&compose=chat" variant="outline">
                        <MessageCircle className="size-4" aria-hidden />{t("platform_support.actions.chat")}
                    </MyButton>
                    <MyDialog open={creating} onOpenChange={(open) => {
                        setCreating(open);
                        if (open) issueNavigated.current = false;
                        if (!open && compose === "issue" && !issueNavigated.current) router.replace("/platform-support?kind=issue", { scroll: false });
                    }}
                        title="platform_support.actions.report_issue" description="platform_support.redesign.issue_intro"
                        size="xl" showFooter={false}
                        trigger={<MyButton type="button" variant="default" action="create" title="platform_support.actions.report_issue" />}>
                        <SupportComposer mode="issue" api="platform-support/threads" allowImages={hasPermission("platform-support.upload")}
                            onAcknowledged={(response) => {
                                const thread = parseSupportThread((response as { thread?: unknown } | undefined)?.thread);
                                if (thread) {
                                    issueNavigated.current = true;
                                    router.push(`/platform-support/issues/${thread.uuid}`);
                                }
                            }} />
                    </MyDialog>
                </>} />
            {!denied && <SupportSummary counts={summary.isError ? null : parseSupportSummary(summary.data?.data)} loading={summary.isLoading} />}
            {!denied && summary.isError && !supportAccessDenied(summary.error) && (
                <p role="status" className="text-xs text-muted-foreground">{t("platform_support.inbox.stale")}</p>
            )}
            <div className="flex flex-col gap-3">
                <SupportKindTabs kind={kind} onChange={(item) => { setKind(item); setFilter(null); router.replace(`/platform-support?kind=${item}`, { scroll: false }); }} />
                {scopes.length > 1 && <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("platform_support.scopes.label")}>
                    <span className="text-xs font-medium text-muted-foreground">{t("platform_support.scopes.label")}</span>
                    {scopes.map((item) => <MyButton key={item} type="button"
                        variant={item === activeScope ? "secondary" : "ghost"} aria-pressed={item === activeScope}
                        onClick={() => { setScope(item); setFilter(null); }}>
                        {t(`platform_support.scopes.${item}`)}
                    </MyButton>)}
                </div>}
            </div>
            {compose === "chat" && canCreate && <IncludePageControl />}
            {compose === "chat" && startChat.isError && (
                <SupportRetry messageKey="platform_support.load_failed" onRetry={() => {
                    if (chatRequest.current && canCreate) startChat.mutate(chatRequest.current);
                }} />
            )}
            {list.isError && !denied && (
                <SupportRetry messageKey="platform_support.load_failed" onRetry={() => void list.refetch()} />
            )}
            {denied && <SupportRetry messageKey="platform_support.errors.forbidden" onRetry={() => setBlocked(false)} />}
            {!denied && (!list.isError || rows.length > 0) && <div className="min-w-0 rounded-lg border border-border bg-card p-2 sm:p-3"><DataTable
                data={rows}
                columns={supportColumns}
                pagination={list.data?.data?.pagination}
                setCurrentPage={list.setCurrentPage}
                isLoading={list.isLoading}
                isFetching={list.isFetching}
                setFilter={setFilter}
                toolbarOptions={{ filter: supportFilterSchema(activeScope, kind) }}
                toolbarTitle={t(kind === "issue" ? "platform_support.issues" : "platform_support.chats")}
            /></div>}
        </div>
    );
}
