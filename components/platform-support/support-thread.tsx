"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FilePlus2, Headset, Link2, UserRound } from "lucide-react";
import { MyDialog } from "@/components/my-dialog";
import { SupportBadge, SupportDetail, SupportDetailPanel, SupportHeading, SupportIcon, supportPageClass } from "@/components/platform-support/support-ui";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { format, isValid, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import { SupportAttachmentGallery, SupportComposer, SupportText } from "@/components/platform-support/support-composer";
import {
    acknowledgeMessage,
    emptyHistory,
    mergeMessagePage,
    parseMessageWindow,
    parseSupportMessage,
    parseSupportThread,
    readSequenceForVisible,
    supportAccessDenied,
    supportActions,
    supportConflict,
    supportErrorKey,
    supportErrorParts,
    supportLifecycleRequest,
    supportManageStatuses,
    supportOwnsThread,
    supportPollInterval,
    supportQueryKey,
    supportQueryRetry,
    supportReplyUrl,
    supportThreadId,
    type SupportHistory,
    type SupportScope,
    type SupportThread,
} from "@/components/platform-support/support-model";
import { useSupportPresence } from "@/components/platform-support/support-launcher";
import Card from "@/components/card";
import MyButton from "@/components/my-button";
import useApiMutation from "@/hooks/use-api-mutation";
import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";
import { useProfile } from "@/context/app-provider";
import { cn } from "@/lib/utils";

function supportTime(value: string | null): string {
    if (!value) return "";
    const date = parseISO(value);
    return isValid(date) ? format(date, "dd MMM yyyy, HH:mm") : value;
}

function newerThread(left: SupportThread | null, right: SupportThread | null): SupportThread | null {
    if (!left) return right;
    if (!right) return left;
    return left.version >= right.version ? left : right;
}

export function SupportRetry({ messageKey, onRetry }: { messageKey: string; onRetry: () => void }) {
    const { t } = useTranslation();
    return (
        <Card className="flex flex-col items-start gap-3 p-4">
            <p className="text-sm text-foreground">{t(messageKey)}</p>
            <MyButton type="button" variant="outline" onClick={onRetry}>{t("platform_support.retry")}</MyButton>
        </Card>
    );
}

export default function SupportThreadView({
    threadId,
    scope = "own",
}: {
    threadId: string;
    scope?: SupportScope;
}) {
    const { t } = useTranslation();
    const router = useRouter();
    const id = supportThreadId(threadId);
    const { profile } = useProfile();
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
    const listRef = useRef<HTMLDivElement>(null);
    const atBottomRef = useRef(true);
    const appliedRef = useRef(0);
    const olderAppliedRef = useRef(0);
    const sourceAppliedRef = useRef(0);
    const markedRef = useRef(0);
    const prependRef = useRef<{ height: number; top: number } | null>(null);
    const countRef = useRef(0);

    const threadKey = supportQueryKey({ identity, scope, resource: "thread", thread: id });
    const messageKey = supportQueryKey({ identity, scope, resource: "messages", thread: id });
    const enabled = Boolean(id) && Boolean(identity) && !blocked;

    const threadQuery = useApiQuery<ApiResponse<unknown>>({
        queryKey: threadKey,
        url: `platform-support/threads/${id ?? "invalid"}`,
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
        url: `platform-support/threads/${id ?? "invalid"}/messages`,
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
        url: `platform-support/threads/${id ?? "invalid"}/messages`,
        params: { before_sequence: before ?? 1, limit: 50 },
        pagination: false,
        enabled: enabled && before !== null,
        refetchInterval: false,
        refetchOnWindowFocus: false,
        retry: supportQueryRetry,
    });

    const fetched = parseSupportThread(threadQuery.data?.data);
    const [override, setOverride] = useState<SupportThread | null>(null);
    const thread = blocked ? null : newerThread(fetched, override);
    const owns = thread ? supportOwnsThread(thread, identity) : false;
    const actions = thread ? supportActions(thread, owns) : null;
    const sourceId = thread?.source_chat_uuid && thread.abilities.can_read_source ? supportThreadId(thread.source_chat_uuid) : null;

    const sourceQuery = useApiQuery<ApiResponse<unknown>>({
        queryKey: supportQueryKey({ identity, scope, resource: "source", thread: sourceId }),
        url: `platform-support/threads/${sourceId ?? "invalid"}/messages`,
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
        // The denial flags are the only triggers. block() closes over the current query keys.
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
        url: `/platform-support/threads/${id ?? "invalid"}/read`,
        method: "PATCH",
        ignoreError: () => true,
        onError: (error) => {
            if (supportAccessDenied(error)) block();
        },
    });
    const readRef = useRef(read.mutate);
    readRef.current = read.mutate;

    useEffect(() => {
        const sequence = readSequenceForVisible(history.messages, visibleIds, markedRef.current);
        if (!sequence || !id || blocked) return;
        markedRef.current = sequence;
        readRef.current({ last_read_sequence: sequence });
    }, [blocked, history.messages, id, visibleIds]);

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

    const resolve = useApiMutation<unknown, { expected_version: number }>({
        url: `/platform-support/threads/${id ?? "invalid"}/resolve`,
        method: "PATCH",
        ignoreError: (error) => supportConflict(error) || supportAccessDenied(error),
        onSuccess: (data) => setOverride(parseSupportThread(data)),
        onError: onLifecycleError,
    });
    const reopen = useApiMutation<unknown, { expected_version: number }>({
        url: `/platform-support/threads/${id ?? "invalid"}/reopen`,
        method: "PATCH",
        ignoreError: (error) => supportConflict(error) || supportAccessDenied(error),
        onSuccess: (data) => setOverride(parseSupportThread(data)),
        onError: onLifecycleError,
    });
    const teamStatus = useApiMutation<unknown, { expected_version: number; status: string }>({
        url: `/platform-support/threads/${id ?? "invalid"}/team-status`,
        method: "PATCH",
        ignoreError: (error) => supportConflict(error) || supportAccessDenied(error),
        onSuccess: (data) => setOverride(parseSupportThread(data)),
        onError: onLifecycleError,
    });

    const runLifecycle = (action: "resolve" | "reopen" | "status", status?: string) => {
        if (!thread) return;
        const request = supportLifecycleRequest({
            threadUuid: thread.uuid,
            kind: thread.kind,
            owns,
            version: thread.version,
            action,
            status,
        });
        if (!request) return;
        if (!owns) {
            teamStatus.mutate(request.body as { expected_version: number; status: string });
            return;
        }
        const body = request.body as { expected_version: number };
        if (action === "reopen") reopen.mutate(body);
        else resolve.mutate(body);
    };

    if (!id) return <SupportRetry messageKey="platform_support.errors.not_found" onRetry={() => undefined} />;
    if (blocked) return <SupportRetry messageKey="platform_support.errors.forbidden" onRetry={() => setBlocked(false)} />;
    if (threadQuery.isError && !thread) {
        return <SupportRetry messageKey="platform_support.load_failed" onRetry={() => void threadQuery.refetch()} />;
    }

    return (
        <div className={supportPageClass}>
            <SupportHeading
                back={{ href: "/platform-support", label: t("platform_support.title") }}
                reference={thread?.reference}
                title={thread?.kind === "chat" ? t("platform_support.chat.untitled") : t("platform_support.title")}
                action={thread && <><SupportBadge type="status" value={thread.status} />{actions?.convert && thread && <MyDialog size="xl" title="platform_support.convert"
                    description="platform_support.redesign.convert_intro" showFooter={false}
                    trigger={<MyButton type="button" variant="outline">
                        <FilePlus2 className="size-4" aria-hidden />{t("platform_support.convert")}
                    </MyButton>}>
                    <SupportComposer
                        mode="convert"
                        api={`platform-support/threads/${thread.uuid}/convert`}
                        threadId={thread.uuid}
                        version={thread.version}
                        onConflict={() => {
                            setNotice("platform_support.errors.version_conflict");
                            void threadQuery.refetch();
                        }}
                        onAcknowledged={(response) => {
                            const issue = parseSupportThread(response);
                            if (issue) router.push(`/platform-support/issues/${issue.uuid}`);
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
                            {threadQuery.isError && thread && <p className="text-xs text-muted-foreground" role="status">{t("platform_support.inbox.stale")}</p>}
                        </header>
                        <div className="flex flex-wrap gap-2 px-4 pt-2 empty:hidden sm:px-6">
                            {thread?.linked_issue_uuid && <MyButton asChild variant="outline"><Link href={`/platform-support/issues/${thread.linked_issue_uuid}`}><Link2 className="size-4" aria-hidden />{t("platform_support.linked_issue")}</Link></MyButton>}
                            {thread?.source_chat_uuid && <MyButton asChild variant="outline"><Link href={`/platform-support/chats/${thread.source_chat_uuid}`}><Link2 className="size-4" aria-hidden />{t("platform_support.linked_chat")}</Link></MyButton>}
                        </div>
                        {notice && <p role="status" className="mx-4 mt-3 rounded-md border border-border bg-muted p-3 text-sm">{t(notice)}</p>}
                        {sourceId && sourceHistory.messages.length > 0 && (
                            <details className="mx-4 mt-3 rounded-lg border border-border bg-muted/30 p-3 sm:mx-6">
                                <summary className="cursor-pointer text-sm font-medium">{t("platform_support.linked_history")}</summary>
                                <div className="mt-3 max-h-72 overflow-y-auto">
                                    <MessageList messages={sourceHistory.messages} />
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
                        {messageQuery.isLoading && <p className="p-4 text-sm text-muted-foreground">{t("platform_support.loading")}</p>}
                        {messageQuery.isError && !blocked && (
                            <SupportRetry messageKey="platform_support.load_failed" onRetry={() => void messageQuery.refetch()} />
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
                            <MessageList messages={history.messages} ready={history.bootstrapped} />
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
                    {actions?.send && thread && (
                        <div className="border-t border-border bg-muted/20 p-4 sm:px-6">
                            <SupportComposer
                                mode="message"
                                embedded
                                sendOnEnter={thread.kind === "chat"}
                                allowImages={actions.upload}
                                api={supportReplyUrl(thread.uuid, owns)}
                                threadId={thread.uuid}
                                onConflict={() => void threadQuery.refetch()}
                                onReconciled={(window) => {
                                    if (!window) return;
                                    setHistory((current) => mergeMessagePage(current, window, "newer"));
                                }}
                                onAcknowledged={(response) => {
                                    const message = parseSupportMessage(response);
                                    if (!message) return;
                                    setHistory((current) => acknowledgeMessage(current, message));
                                    void threadQuery.refetch();
                                    void queryClient.invalidateQueries({
                                        queryKey: supportQueryKey({ identity, scope, resource: "summary" }),
                                    });
                                    void queryClient.invalidateQueries({
                                        queryKey: supportQueryKey({ identity, scope, resource: "threads" }),
                                    });
                                }}
                            />
                        </div>
                    )}
                    </Card>
                </div>
                <SupportDetailPanel>

                    <SupportDetail label={t("platform_support.requester")}>{thread?.requester.name ?? "—"}</SupportDetail>
                    {thread?.reseller?.name && <SupportDetail label={t("platform_support.inbox.reseller")}>{thread.reseller.name}</SupportDetail>}
                    <SupportDetail label={t("platform_support.inbox.assignee")}>{thread?.assigned_agent?.name ?? t("platform_support.inbox.unassigned_agent")}</SupportDetail>
                    {thread?.priority && <SupportDetail label={t("platform_support.filters.priority")}><SupportBadge type="priority" value={thread.priority} /></SupportDetail>}
                    {thread?.category && <SupportDetail label={t("platform_support.filters.category")}>{t(`platform_support.categories.${thread.category}`, { defaultValue: thread.category })}</SupportDetail>}
                    {thread?.last_activity_at && <SupportDetail label={t("platform_support.last_activity")}>{supportTime(thread.last_activity_at)}</SupportDetail>}
                    {thread?.context?.path && <SupportDetail label={t("platform_support.redesign.page_context")}><span className="font-mono text-xs">{thread.context.path}</span></SupportDetail>}
                    {actions && !actions.readOnly && (
                        <div className="flex flex-wrap gap-2 border-t border-border pt-3">
                            {actions.resolve && (
                                <MyButton type="button" variant="outline" onClick={() => runLifecycle("resolve")}>
                                    {t(thread?.kind === "chat" ? "platform_support.close" : "platform_support.resolve")}
                                </MyButton>
                            )}
                            {actions.reopen && (
                                <MyButton type="button" variant="outline" onClick={() => runLifecycle("reopen")}>
                                    {t("platform_support.reopen")}
                                </MyButton>
                            )}
                            {actions.manage && thread && (
                                <>
                                    <label className="sr-only" htmlFor="support-status">{t("platform_support.filters.status")}</label>
                                    <select
                                        id="support-status"
                                        className="h-9 rounded-md border border-input bg-background px-3 text-sm text-foreground"
                                        value={statusChoice}
                                        onChange={(event) => setStatusChoice(event.target.value)}
                                    >
                                        {supportManageStatuses(thread.kind).map((status) => (
                                            <option key={status} value={status}>
                                                {t(`platform_support.statuses.${status}`)}
                                            </option>
                                        ))}
                                    </select>
                                    <MyButton type="button" variant="outline" onClick={() => runLifecycle("status", statusChoice)}>
                                        {t("platform_support.update_status")}
                                    </MyButton>
                                </>
                            )}
                        </div>
                    )}
                    {actions?.readOnly && <p className="text-sm text-muted-foreground">{t("platform_support.read_only")}</p>}
                </SupportDetailPanel>
            </div>
        </div>
    );
}

export function MessageList({
    messages,
    ready = true,
    audience = "requester",
}: {
    messages: SupportHistory["messages"];
    ready?: boolean;
    audience?: "requester" | "platform";
}) {
    const { t } = useTranslation();
    if (!ready) return null;
    if (messages.length === 0) return <p className="py-8 text-center text-sm text-muted-foreground">{t("platform_support.empty_messages")}</p>;
    return (
        <ol className="flex min-w-0 flex-col gap-5">
            {messages.map((message) => {
                const own = message.author.is_self;
                const agent = message.author.side === "platform";
                const label = own ? t("platform_support.author.you") : message.author.name || (agent ? t("platform_support.author.platform") : t("platform_support.requester"));
                const Icon = agent ? Headset : UserRound;
                return <li key={message.uuid} data-message-id={message.uuid}
                    className={cn("flex w-fit min-w-0 max-w-full items-start gap-2.5 sm:max-w-[88%]", own && "flex-row-reverse self-end")}>
                    <SupportIcon icon={Icon} className={cn("size-7 rounded-full [&>svg]:size-3.5", !agent && "bg-muted text-muted-foreground")} />
                    <div className="min-w-0">
                        <p className={cn("mb-1.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground", own && "justify-end")}>
                            <span className="break-words font-medium text-foreground">{label}</span>
                            {agent && <span>{t("platform_support.author.platform")}</span>}
                            {message.created_at && <time dateTime={message.created_at}>{supportTime(message.created_at)}</time>}
                        </p>
                        <div className={cn("min-w-0 space-y-2 rounded-xl border border-border bg-muted/45 px-3.5 py-2.5",
                            own ? "rounded-se-sm border-primary/15 bg-primary/[0.06]" : "rounded-ss-sm")}>
                            <SupportText value={message.body} />
                            <SupportAttachmentGallery attachments={message.attachments} audience={audience} />
                        </div>
                    </div>
                </li>;
            })}
        </ol>
    );
}
