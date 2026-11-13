"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FilePlus2, Headset, Link2 } from "lucide-react";
import { MyDialog } from "@/components/my-dialog";
import { SupportBadge, SupportDetail, SupportDetailPanel, SupportHeading, SupportIcon, supportPageClass } from "@/components/platform-support/support-ui";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { format, isValid, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import { InboxAssigneeSelect } from "@/components/platform-support/admin/inbox-assignees";
import {
    parsePlatformThread,
    platformAgentControls,
    platformAssignBody,
    platformQueryKey,
    platformReadBody,
    platformStatusBody,
    type PlatformCapability,
    type PlatformThread,
} from "@/components/platform-support/admin/inbox-model";
import { SupportComposer } from "@/components/platform-support/support-composer";
import { MessageList, SupportRetry } from "@/components/platform-support/support-thread";
import { useSupportPresence } from "@/components/platform-support/support-launcher";
import {
    acknowledgeMessage,
    emptyHistory,
    mergeMessagePage,
    parseMessageWindow,
    parseSupportMessage,
    readSequenceForVisible,
    supportAccessDenied,
    supportConflict,
    supportErrorKey,
    supportErrorParts,
    supportManageStatuses,
    supportPollInterval,
    supportQueryRetry,
    supportThreadId,
    type SupportHistory,
} from "@/components/platform-support/support-model";
import Card from "@/components/card";
import MyButton from "@/components/my-button";
import { usePermissions, useProfile } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";

function threadTime(value: string | null): string {
    if (!value) return "";
    const date = parseISO(value);
    return isValid(date) ? format(date, "dd MMM yyyy, HH:mm") : value;
}

function newerThread(left: PlatformThread | null, right: PlatformThread | null): PlatformThread | null {
    if (!left) return right;
    if (!right) return left;
    return left.version >= right.version ? left : right;
}

export default function InboxThread({ threadId }: { threadId: string }) {
    const { t } = useTranslation();
    const router = useRouter();
    const id = supportThreadId(threadId);
    const { profile } = useProfile();
    const { hasPermission } = usePermissions();
    const identity = profile?.id ?? "";
    const { documentVisible, online } = useSupportPresence();
    const queryClient = useQueryClient();
    const [blocked, setBlocked] = useState(false);
    const [history, setHistory] = useState<SupportHistory>(emptyHistory);
    const [sourceHistory, setSourceHistory] = useState<SupportHistory>(emptyHistory);
    const [notice, setNotice] = useState<string | null>(null);
    const [unseen, setUnseen] = useState(false);
    const [visibleIds, setVisibleIds] = useState<ReadonlySet<string>>(new Set());
    const [before, setBefore] = useState<number | null>(null);
    const [statusChoice, setStatusChoice] = useState("open");
    const [assignFocus, setAssignFocus] = useState(false);
    const [assignChoice, setAssignChoice] = useState("");
    const listRef = useRef<HTMLDivElement>(null);
    const atBottomRef = useRef(true);
    const appliedRef = useRef(0);
    const olderAppliedRef = useRef(0);
    const sourceAppliedRef = useRef(0);
    const markedRef = useRef(0);
    const prependRef = useRef<{ height: number; top: number } | null>(null);
    const countRef = useRef(0);
    const capability: PlatformCapability = {
        reply: hasPermission("platform-support-admin.reply"),
        upload: hasPermission("platform-support-admin.upload"),
        status: hasPermission("platform-support-admin.status"),
        assign: hasPermission("platform-support-admin.assign"),
        assignees: hasPermission("platform-support-admin.assignees"),
        convert: hasPermission("platform-support-admin.convert"),
    };
    const canMarkRead = hasPermission("platform-support-admin.read");
    const threadKey = platformQueryKey({ identity, resource: "thread", thread: id });
    const messageKey = platformQueryKey({ identity, resource: "messages", thread: id });
    const enabled = Boolean(id) && Boolean(identity) && !blocked;

    const threadQuery = useApiQuery<ApiResponse<unknown>>({
        queryKey: threadKey,
        url: `platform-support-admin/threads/${id ?? "invalid"}`,
        pagination: false,
        enabled,
        refetchOnWindowFocus: true,
        retry: supportQueryRetry,
        refetchInterval: (query) => supportPollInterval({
            surface: "thread",
            documentVisible,
            online,
            signedIn: Boolean(identity),
            accessible: enabled && !supportAccessDenied(query.state.error),
            failureCount: query.state.fetchFailureCount,
        }),
    });
    const polling = history.bootstrapped;
    const messageQuery = useApiQuery<ApiResponse<unknown>>({
        queryKey: messageKey,
        url: `platform-support-admin/threads/${id ?? "invalid"}/messages`,
        params: polling ? { after_sequence: history.cursor, limit: 100 } : { limit: 50 },
        pagination: false,
        enabled,
        refetchOnWindowFocus: true,
        retry: supportQueryRetry,
        refetchInterval: (query) => supportPollInterval({
            surface: "thread",
            documentVisible,
            online,
            signedIn: Boolean(identity),
            accessible: enabled && !supportAccessDenied(query.state.error),
            failureCount: query.state.fetchFailureCount,
        }),
    });
    const olderQuery = useApiQuery<ApiResponse<unknown>>({
        queryKey: [...messageKey, "older"],
        url: `platform-support-admin/threads/${id ?? "invalid"}/messages`,
        params: { before_sequence: before ?? 1, limit: 50 },
        pagination: false,
        enabled: enabled && before !== null,
        refetchInterval: false,
        refetchOnWindowFocus: false,
        retry: supportQueryRetry,
    });

    const fetched = parsePlatformThread(threadQuery.data?.data);
    const [override, setOverride] = useState<PlatformThread | null>(null);
    const thread = blocked ? null : newerThread(fetched, override);
    const controls = thread ? platformAgentControls(thread, capability) : null;
    const sourceId = thread?.source_chat_uuid && thread.abilities.can_read_source
        ? supportThreadId(thread.source_chat_uuid)
        : null;
    const sourceQuery = useApiQuery<ApiResponse<unknown>>({
        queryKey: platformQueryKey({ identity, resource: "source", thread: sourceId }),
        url: `platform-support-admin/threads/${sourceId ?? "invalid"}/messages`,
        params: { limit: 50 },
        pagination: false,
        enabled: Boolean(sourceId) && enabled,
        refetchInterval: false,
        refetchOnWindowFocus: true,
        retry: supportQueryRetry,
    });

    const block = () => {
        setBlocked(true);
        setHistory(emptyHistory());
        setSourceHistory(emptyHistory());
        setOverride(null);
        void queryClient.removeQueries({ queryKey: threadKey });
        void queryClient.removeQueries({ queryKey: messageKey });
    };

    useEffect(() => {
        if (supportAccessDenied(sourceQuery.error)) setSourceHistory(emptyHistory());
        if (supportAccessDenied(threadQuery.error) || supportAccessDenied(messageQuery.error)) block();
        // Denial flags are the triggers. block() closes over the current query keys.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messageQuery.error, sourceQuery.error, threadQuery.error]);

    useEffect(() => {
        if (!messageQuery.isSuccess || messageQuery.dataUpdatedAt === appliedRef.current) return;
        const window = parseMessageWindow(messageQuery.data?.data);
        if (!window) return;
        appliedRef.current = messageQuery.dataUpdatedAt;
        setHistory((current) => mergeMessagePage(current, window, current.bootstrapped ? "newer" : "initial"));
    }, [messageQuery.data, messageQuery.dataUpdatedAt, messageQuery.isSuccess]);

    useEffect(() => {
        if (!olderQuery.isSuccess || before === null || olderQuery.dataUpdatedAt === olderAppliedRef.current) return;
        const window = parseMessageWindow(olderQuery.data?.data);
        if (!window) return;
        olderAppliedRef.current = olderQuery.dataUpdatedAt;
        setHistory((current) => mergeMessagePage(current, window, "older"));
        setBefore(null);
    }, [before, olderQuery.data, olderQuery.dataUpdatedAt, olderQuery.isSuccess]);

    useEffect(() => {
        if (!sourceQuery.isSuccess || sourceQuery.dataUpdatedAt === sourceAppliedRef.current) return;
        const window = parseMessageWindow(sourceQuery.data?.data);
        if (!window) return;
        sourceAppliedRef.current = sourceQuery.dataUpdatedAt;
        setSourceHistory(mergeMessagePage(emptyHistory(), window, "initial"));
    }, [sourceQuery.data, sourceQuery.dataUpdatedAt, sourceQuery.isSuccess]);

    useEffect(() => {
        const box = listRef.current;
        const snapshot = prependRef.current;
        if (snapshot && box) {
            box.scrollTop = box.scrollHeight - snapshot.height + snapshot.top;
            prependRef.current = null;
            countRef.current = history.messages.length;
            return;
        }
        if (history.messages.length === countRef.current) return;
        const grew = history.messages.length > countRef.current;
        countRef.current = history.messages.length;
        if (!grew || !box) return;
        if (atBottomRef.current) box.scrollTop = box.scrollHeight;
        else setUnseen(true);
    }, [history.messages]);

    useEffect(() => {
        const root = listRef.current;
        if (!root) return;
        const observer = new IntersectionObserver((entries) => {
            setVisibleIds((current) => {
                const next = new Set(current);
                for (const entry of entries) {
                    const messageId = (entry.target as HTMLElement).dataset.messageId;
                    if (!messageId) continue;
                    if (entry.isIntersecting) next.add(messageId);
                    else next.delete(messageId);
                }
                return next;
            });
        }, { root, threshold: 0.6 });
        root.querySelectorAll<HTMLElement>("[data-message-id]").forEach((node) => observer.observe(node));
        return () => observer.disconnect();
    }, [history.messages]);

    const read = useApiMutation<{ last_read_sequence: number }, { last_read_sequence: number }>({
        url: `/platform-support-admin/threads/${id ?? "invalid"}/read`,
        method: "PATCH",
        ignoreError: () => true,
        onError: (error) => {
            if (supportAccessDenied(error)) block();
        },
    });
    const readRef = useRef(read.mutate);
    readRef.current = read.mutate;

    useEffect(() => {
        if (!canMarkRead) return;
        const sequence = readSequenceForVisible(history.messages, visibleIds, markedRef.current);
        if (!sequence || !id || blocked) return;
        markedRef.current = sequence;
        readRef.current(platformReadBody(sequence) as { last_read_sequence: number });
    }, [blocked, canMarkRead, history.messages, id, visibleIds]);

    const refreshLists = () => {
        void queryClient.invalidateQueries({ queryKey: platformQueryKey({ identity, resource: "threads" }) });
        void queryClient.invalidateQueries({ queryKey: platformQueryKey({ identity, resource: "summary" }) });
    };

    const onLifecycleError = (error: unknown) => {
        if (supportAccessDenied(error)) {
            block();
            return;
        }
        if (supportConflict(error)) {
            setNotice("platform_support.errors.version_conflict");
            void threadQuery.refetch();
            return;
        }
        setNotice(supportErrorKey(supportErrorParts(error).code));
    };

    const changeStatus = useApiMutation<unknown, { expected_version: number; status: string }>({
        url: `/platform-support-admin/threads/${id ?? "invalid"}/status`,
        method: "PATCH",
        ignoreError: (error) => supportConflict(error) || supportAccessDenied(error),
        onSuccess: (data) => {
            setOverride(parsePlatformThread(data));
            refreshLists();
        },
        onError: onLifecycleError,
    });
    const assign = useApiMutation<unknown, { expected_version: number; assignee_uuid: string | null }>({
        url: `/platform-support-admin/threads/${id ?? "invalid"}/assignee`,
        method: "PATCH",
        ignoreError: (error) => supportConflict(error) || supportAccessDenied(error),
        onSuccess: (data) => {
            setOverride(parsePlatformThread(data));
            setAssignFocus(false);
            refreshLists();
        },
        onError: onLifecycleError,
    });

    if (!id) return <SupportRetry messageKey="platform_support.errors.not_found" onRetry={() => undefined} />;
    if (blocked) return <SupportRetry messageKey="platform_support.errors.forbidden" onRetry={() => setBlocked(false)} />;
    if (threadQuery.isError && !thread) {
        return <SupportRetry messageKey={supportAccessDenied(threadQuery.error) ? "platform_support.errors.forbidden" : "platform_support.inbox.stale"} onRetry={() => void threadQuery.refetch()} />;
    }
    if (threadQuery.isLoading && !thread) {
        return <p className="text-sm text-muted-foreground">{t("platform_support.inbox.pending")}</p>;
    }

    const assigneeValue = assignFocus ? assignChoice : (thread?.assigned_agent?.uuid ?? "");
    const adminThreadHref = (uuid: string | null) => uuid ? `/platform-support-admin/threads/${uuid}` : null;
    const linkedIssue = adminThreadHref(thread?.linked_issue_uuid ?? null);
    const linkedChat = adminThreadHref(thread?.source_chat_uuid ?? null);

    return (
        <div className={supportPageClass} data-testid="platform-inbox-thread">
            <SupportHeading
                back={{ href: "/platform-support-admin", label: t("platform_support.inbox.title") }}
                reference={thread?.reference}
                title={thread?.subject?.trim() || (thread?.kind === "chat" ? t("platform_support.chat.untitled") : t("platform_support.inbox.title"))}
                action={thread && <><SupportBadge type="status" value={thread.status} />{controls?.convert && thread && <MyDialog size="xl" title="platform_support.convert"
                    description="platform_support.redesign.convert_intro" showFooter={false}
                    trigger={<MyButton type="button" variant="outline" data-testid="platform-inbox-convert">
                        <FilePlus2 className="size-4" aria-hidden />{t("platform_support.convert")}
                    </MyButton>}>
                    <SupportComposer
                        mode="convert"
                        audience="platform"
                        api={`platform-support-admin/threads/${thread.uuid}/convert`}
                        threadId={thread.uuid}
                        version={thread.version}
                        onConflict={() => {
                            setNotice("platform_support.errors.version_conflict");
                            void threadQuery.refetch();
                        }}
                        onAcknowledged={(response) => {
                            const issue = parsePlatformThread(response);
                            refreshLists();
                            if (issue) router.push(`/platform-support-admin/threads/${issue.uuid}`);
                        }}
                    />
                </MyDialog>}</>}
            />
            <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(14rem,25%)]">
                <div className="min-w-0 space-y-4">
                    <Card className="flex min-w-0 flex-col overflow-hidden shadow-none">
                        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
                            <div className="flex items-center gap-3">
                                <SupportIcon icon={Headset} />
                                <div><h2 className="text-sm font-semibold">{t("platform_support.redesign.conversation")}</h2>
                                    <p className="text-xs text-muted-foreground">{t("platform_support.redesign.conversation_intro")}</p></div>
                            </div>
                            {thread?.kind === "issue" && threadQuery.isFetching && <p className="text-xs text-muted-foreground" role="status">{t("platform_support.inbox.refreshing")}</p>}
                            {threadQuery.isError && thread && <p className="text-xs text-muted-foreground" role="status">{t("platform_support.inbox.stale")}</p>}
                        </header>
                        <div className="flex flex-wrap gap-2 px-4 pt-2 empty:hidden sm:px-6">
                            {linkedIssue && <MyButton asChild variant="outline"><Link href={linkedIssue}><Link2 className="size-4" aria-hidden />{t("platform_support.linked_issue")}</Link></MyButton>}
                            {linkedChat && <MyButton asChild variant="outline"><Link href={linkedChat}><Link2 className="size-4" aria-hidden />{t("platform_support.linked_chat")}</Link></MyButton>}
                        </div>
                        {notice && <p role="status" className="mx-4 mt-3 rounded-md border border-border bg-muted p-3 text-sm">{t(notice)}</p>}
                        {sourceId && sourceHistory.messages.length > 0 && (
                            <details className="mx-4 mt-3 rounded-lg border border-border bg-muted/30 p-3 sm:mx-6">
                                <summary className="cursor-pointer text-sm font-medium">{t("platform_support.linked_history")}</summary>
                                <div className="mt-3 max-h-72 overflow-y-auto">
                                    <MessageList messages={sourceHistory.messages} audience="platform" />
                                </div>
                            </details>
                        )}
                        {history.hasOlder && (
                            <MyButton
                                type="button"
                                variant="ghost"
                                className="mx-4 mt-2 self-center"
                                onClick={() => {
                                    const box = listRef.current;
                                    if (box) prependRef.current = { height: box.scrollHeight, top: box.scrollTop };
                                    const oldest = history.messages[0]?.sequence;
                                    if (oldest) setBefore(oldest);
                                }}
                            >
                                {t("platform_support.load_older")}
                            </MyButton>
                        )}
                        {messageQuery.isLoading && !history.bootstrapped && <p className="p-4 text-sm text-muted-foreground">{t("platform_support.loading")}</p>}
                        {messageQuery.isError && !blocked && (
                            history.bootstrapped
                                ? <p role="status">{t("platform_support.inbox.stale")}</p>
                                : <SupportRetry messageKey="platform_support.inbox.stale" onRetry={() => void messageQuery.refetch()} />
                        )}
                        <div
                            ref={listRef}
                            className="flex min-h-48 max-h-[min(32rem,55dvh)] flex-col gap-3 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6"
                            onScroll={(event) => {
                                const box = event.currentTarget;
                                const atBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 48;
                                atBottomRef.current = atBottom;
                                if (atBottom) setUnseen(false);
                            }}
                        >
                            <MessageList messages={history.messages} ready={history.bootstrapped} audience="platform" />
                        </div>
                        {unseen && (
                            <MyButton
                                type="button"
                                variant="outline"
                                className="mx-4 mb-3 self-center"
                                onClick={() => {
                                    const box = listRef.current;
                                    if (!box) return;
                                    box.scrollTop = box.scrollHeight;
                                    setUnseen(false);
                                }}
                            >
                                {t("platform_support.new_messages")}
                            </MyButton>
                        )}
                    {controls?.send && thread && (
                        <div className="border-t border-border bg-muted/20 p-4 sm:px-6" data-testid="platform-inbox-reply">
                            <SupportComposer
                                mode="message"
                                embedded
                                sendOnEnter={thread.kind === "chat"}
                                audience="platform"
                                allowImages={controls.upload}
                                api={`platform-support-admin/threads/${thread.uuid}/messages`}
                                threadId={thread.uuid}
                                onConflict={() => void threadQuery.refetch()}
                                onReconciled={(window) => {
                                    if (!window) return;
                                    setHistory((current) => mergeMessagePage(current, window, "newer"));
                                }}
                                onAcknowledged={(response) => {
                                    const message = parseSupportMessage(response);
                                    if (message) setHistory((current) => acknowledgeMessage(current, message));
                                    void threadQuery.refetch();
                                    refreshLists();
                                }}
                            />
                        </div>
                    )}
                    </Card>
                </div>
                <SupportDetailPanel testId="platform-inbox-owner">
                    {thread?.company && <SupportDetail label={t("platform_support.inbox.company")}>
                        <span className="block font-medium">{thread.company.name}</span>
                        {thread.company.domain && <span className="block text-xs text-muted-foreground">{thread.company.domain}</span>}
                    </SupportDetail>}
                    <SupportDetail label={t("platform_support.requester")}>{thread?.requester.name ?? "—"}{thread?.requester_role ? ` · ${thread.requester_role}` : ""}</SupportDetail>
                    {thread?.reseller?.name && <SupportDetail label={t("platform_support.inbox.reseller")}>{thread.reseller.name}</SupportDetail>}
                    <SupportDetail label={t("platform_support.inbox.assignee")}>{thread?.assigned_agent?.name ?? t("platform_support.inbox.unassigned_agent")}</SupportDetail>
                    {thread?.priority && <SupportDetail label={t("platform_support.filters.priority")}><SupportBadge type="priority" value={thread.priority} /></SupportDetail>}
                    {thread?.category && <SupportDetail label={t("platform_support.filters.category")}>{t(`platform_support.categories.${thread.category}`, { defaultValue: thread.category })}</SupportDetail>}
                    {thread?.last_activity_at && <SupportDetail label={t("platform_support.last_activity")}>{threadTime(thread.last_activity_at)}</SupportDetail>}
                    {thread?.context?.path && <SupportDetail label={t("platform_support.redesign.page_context")}><span className="font-mono text-xs">{thread.context.path}</span></SupportDetail>}
                    {controls && !controls.readOnly && thread && (
                        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
                            {controls.transition && (
                                <>
                                    <label className="sr-only" htmlFor="platform-inbox-status">{t("platform_support.filters.status")}</label>
                                    <select
                                        id="platform-inbox-status"
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                                        value={statusChoice}
                                        onChange={(event) => setStatusChoice(event.target.value)}
                                    >
                                        {supportManageStatuses(thread.kind).map((status) => (
                                            <option key={status} value={status}>{t(`platform_support.statuses.${status}`)}</option>
                                        ))}
                                    </select>
                                    <MyButton
                                        type="button"
                                        variant="outline"
                                        onClick={() => changeStatus.mutate(platformStatusBody(thread.version, statusChoice) as { expected_version: number; status: string })}
                                    >
                                        {t("platform_support.update_status")}
                                    </MyButton>
                                </>
                            )}
                            {controls.assign && (
                                <div
                                    onFocus={() => {
                                        setAssignFocus(true);
                                        setAssignChoice(thread.assigned_agent?.uuid ?? "");
                                    }}
                                    onBlur={() => setAssignFocus(false)}
                                >
                                    <InboxAssigneeSelect
                                        id="platform-inbox-assignee"
                                        mode="assign"
                                        enabled
                                        value={assigneeValue}
                                        onChange={(value) => {
                                            setAssignChoice(value);
                                            assign.mutate(platformAssignBody(thread.version, value || null) as { expected_version: number; assignee_uuid: string | null });
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                    {controls?.readOnly && <p data-testid="platform-inbox-readonly" className="text-sm text-muted-foreground">{t("platform_support.read_only")}</p>}
                </SupportDetailPanel>
            </div>
        </div>
    );
}
