"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
        <div className="flex flex-col gap-4">
            <Card className="space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-xs text-muted-foreground">{thread?.reference}</p>
                        <h1 className="text-xl font-semibold text-foreground">
                            {thread?.subject?.trim() || (thread?.kind === "chat" ? t("platform_support.chat.untitled") : t("platform_support.title"))}
                        </h1>
                    </div>
                    {thread && (
                        <p className="text-sm text-muted-foreground">
                            {t(`platform_support.statuses.${thread.status}`, { defaultValue: thread.status })}
                            {" · "}
                            {t(`platform_support.priorities.${thread.priority ?? "normal"}`, { defaultValue: thread.priority ?? "" })}
                        </p>
                    )}
                </div>
                <p className="text-sm text-foreground">
                    {t("platform_support.requester")}: {thread?.requester.name ?? ""}
                </p>
                {thread?.linked_issue_uuid && (
                    <Link className="text-sm text-foreground underline" href={`/platform-support/issues/${thread.linked_issue_uuid}`}>
                        {t("platform_support.linked_issue")}
                    </Link>
                )}
                {thread?.source_chat_uuid && (
                    <Link className="text-sm text-foreground underline" href={`/platform-support/chats/${thread.source_chat_uuid}`}>
                        {t("platform_support.linked_chat")}
                    </Link>
                )}
                {notice && <p role="status" className="text-sm text-foreground">{t(notice)}</p>}
                {actions && !actions.readOnly && (
                    <div className="flex flex-wrap gap-2">
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
            </Card>

            {sourceId && sourceHistory.messages.length > 0 && (
                <Card className="space-y-3 p-4">
                    <h2 className="text-sm font-semibold text-foreground">{t("platform_support.linked_history")}</h2>
                    <MessageList messages={sourceHistory.messages} />
                </Card>
            )}

            <Card className="flex min-h-80 flex-col p-4">
                {history.hasOlder && (
                    <MyButton
                        type="button"
                        variant="ghost"
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
                {messageQuery.isLoading && <p className="text-sm text-muted-foreground">{t("platform_support.loading")}</p>}
                {messageQuery.isError && !blocked && (
                    <SupportRetry messageKey="platform_support.load_failed" onRetry={() => void messageQuery.refetch()} />
                )}
                <div
                    ref={listRef}
                    className="flex max-h-[32rem] flex-1 flex-col gap-3 overflow-y-auto"
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
            </Card>

            {actions?.convert && thread && (
                <Card className="p-4">
                    <h2 className="mb-3 text-sm font-semibold text-foreground">{t("platform_support.convert")}</h2>
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
                </Card>
            )}

            {actions?.send && thread && (
                <Card className="p-4">
                    <SupportComposer
                        mode="message"
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
                </Card>
            )}
        </div>
    );
}

function MessageList({ messages, ready = true }: { messages: SupportHistory["messages"]; ready?: boolean }) {
    const { t } = useTranslation();
    if (!ready) return null;
    if (messages.length === 0) return <p className="text-sm text-muted-foreground">{t("platform_support.empty_messages")}</p>;
    return (
        <ol className="flex flex-col gap-3">
            {messages.map((message) => (
                <li
                    key={message.uuid}
                    data-message-id={message.uuid}
                    className={cn(
                        "max-w-xl rounded-md border border-border px-3 py-2",
                        message.author.side === "platform" ? "bg-muted" : "bg-background",
                        message.author.is_self && "self-end",
                    )}
                >
                    <p className="text-xs text-muted-foreground">
                        {message.author.is_self ? t("platform_support.author.you") : message.author.name}
                        {message.author.side === "platform" ? ` · ${t("platform_support.author.platform")}` : ""}
                        {message.created_at ? ` · ${supportTime(message.created_at)}` : ""}
                    </p>
                    <SupportText value={message.body} />
                    <SupportAttachmentGallery attachments={message.attachments} audience="requester" />
                </li>
            ))}
        </ol>
    );
}
