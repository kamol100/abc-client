"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
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
import useApiQuery, { type PaginatedApiResponse } from "@/hooks/use-api-query";
import { cn } from "@/lib/utils";
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
    const started = useRef(false);
    const activeScope = scopes.includes(scope) ? scope : "own";
    const params = useMemo(
        () => supportListParams(activeScope, kind, filterRecord(filterValue)),
        [activeScope, filterValue, kind],
    );

    const list = useApiQuery<PaginatedApiResponse<unknown>>({
        queryKey: supportQueryKey({ identity, scope: activeScope, resource: "threads" }),
        url: supportListUrl(activeScope),
        params,
        enabled: Boolean(identity) && !blocked,
        refetchOnWindowFocus: true,
        retry: supportQueryRetry,
        refetchInterval: (query) => supportPollInterval({
            surface: "list",
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
        if (compose !== "chat" || started.current || !identity) return;
        started.current = true;
        startChat.mutate(chatStartPayload(
            supportRequestId(),
            widget.contextPath,
            widget.includePage,
            widget.articleId,
        ));
    }, [compose, identity, startChat, widget.articleId, widget.contextPath, widget.includePage]);

    useEffect(() => {
        if (supportAccessDenied(list.error)) setBlocked(true);
    }, [list.error]);

    const rows: SupportThread[] = blocked ? [] : (list.data?.data?.data ?? []).flatMap((row) => {
        const thread = parseSupportThread(row);
        return thread ? [thread] : [];
    });

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-xl font-semibold text-foreground">{t("platform_support.title")}</h1>
                <MyButton type="button" variant="default" onClick={() => { setKind("issue"); setCreating(true); }}>
                    {t("platform_support.actions.report_issue")}
                </MyButton>
            </div>
            <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("platform_support.scopes.label")}>
                {scopes.map((item) => (
                    <MyButton
                        key={item}
                        type="button"
                        variant={item === activeScope ? "default" : "outline"}
                        aria-pressed={item === activeScope}
                        onClick={() => setScope(item)}
                    >
                        {t(`platform_support.scopes.${item}`)}
                    </MyButton>
                ))}
            </div>
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
                        onClick={() => { setKind(item); setFilter(null); setCreating(false); }}
                    >
                        {t(item === "issue" ? "platform_support.issues" : "platform_support.chats")}
                    </button>
                ))}
            </div>
            {compose === "chat" && <IncludePageControl />}
            {creating && kind === "issue" && (
                <SupportComposer
                    mode="issue"
                    api="platform-support/threads"
                    onAcknowledged={(response) => {
                        const thread = parseSupportThread((response as { thread?: unknown } | undefined)?.thread);
                        if (thread) router.push(`/platform-support/issues/${thread.uuid}`);
                    }}
                />
            )}
            {compose === "chat" && startChat.isError && (
                <SupportRetry messageKey="platform_support.load_failed" onRetry={() => {
                    started.current = false;
                    startChat.mutate(chatStartPayload(
                        supportRequestId(),
                        widget.contextPath,
                        widget.includePage,
                        widget.articleId,
                    ));
                }} />
            )}
            {list.isError && !blocked && (
                <SupportRetry messageKey="platform_support.load_failed" onRetry={() => void list.refetch()} />
            )}
            {blocked && <SupportRetry messageKey="platform_support.errors.forbidden" onRetry={() => setBlocked(false)} />}
            <DataTable
                data={rows}
                columns={supportColumns}
                pagination={list.data?.data?.pagination}
                setCurrentPage={list.setCurrentPage}
                isLoading={list.isLoading}
                isFetching={list.isFetching}
                setFilter={setFilter}
                toolbarOptions={{ filter: supportFilterSchema(activeScope, kind) }}
                toolbarTitle={t(kind === "issue" ? "platform_support.issues" : "platform_support.chats")}
            />
        </div>
    );
}
