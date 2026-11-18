import {
    SUPPORT_CHAT_STATUSES,
    SUPPORT_ISSUE_STATUSES,
    parseSupportThread,
    payloadOmitsOwnership,
    supportThreadId,
    type SupportKind,
    type SupportThread,
} from "@/components/platform-support/support-model";

export interface PlatformCompany {
    uuid: string | null;
    name: string | null;
    domain: string | null;
}

export interface PlatformThread extends SupportThread {
    company: PlatformCompany | null;
    requester_role: string | null;
}

export interface PlatformCapability {
    reply: boolean;
    upload: boolean;
    status: boolean;
    assign: boolean;
    assignees: boolean;
    convert: boolean;
}

export interface PlatformControls {
    send: boolean;
    upload: boolean;
    transition: boolean;
    assign: boolean;
    convert: boolean;
    readOnly: boolean;
}

export interface InboxSummaryCounts {
    unread_messages: number;
    unread_threads: number;
    open_issues: number;
    open_chats: number;
    unassigned_threads: number;
}

export interface InboxListState<T> {
    rows: T[];
    stale: boolean;
    showTable: boolean;
}

const OWNED_FIELDS = ["company_id", "reseller_id", "requester_user_id", "author_user_id", "author_side", "reader_user_id"] as const;

export function platformQueryKey(input: {
    identity: string;
    resource: "summary" | "threads" | "thread" | "messages" | "source" | "assignees";
    thread?: string | null;
}): readonly [string, "platform", string, string, string | null] {
    return ["platform-support", "platform", input.identity, input.resource, input.thread ?? null];
}

export function platformListParams(
    kind: SupportKind,
    filter: Record<string, string>,
    quick: { unread: boolean; unassigned: boolean },
): Record<string, string> {
    const params: Record<string, string> = { kind, per_page: "40" };
    const statuses = kind === "chat" ? SUPPORT_CHAT_STATUSES : SUPPORT_ISSUE_STATUSES;
    for (const key of ["priority", "category", "reference"] as const) {
        const value = filter[key]?.trim();
        if (value) params[key] = value;
    }
    const status = filter.status?.trim();
    if (status && (statuses as readonly string[]).includes(status)) params.status = status;
    for (const key of ["company", "reseller", "requester"] as const) {
        const value = supportThreadId(filter[key]?.trim());
        if (value) params[key] = value;
    }
    if (quick.unassigned) {
        params.assignee = "unassigned";
    } else if (filter.assignee?.trim() === "unassigned") {
        params.assignee = "unassigned";
    } else {
        const assignee = supportThreadId(filter.assignee?.trim());
        if (assignee) params.assignee = assignee;
    }
    if (quick.unread || filter.unread_only === "1") params.unread_only = "1";
    return params;
}

export function parsePlatformThread(value: unknown): PlatformThread | null {
    const thread = parseSupportThread(value);
    if (!thread || !value || typeof value !== "object") return null;
    const row = value as Record<string, unknown>;
    return {
        ...thread,
        company: companyIdentity(row.company),
        requester_role: typeof row.requester_role === "string" ? row.requester_role : null,
    };
}

export function parseAssignees(value: unknown): { uuid: string; name: string }[] {
    const rows = value && typeof value === "object" && Array.isArray((value as { data?: unknown }).data)
        ? (value as { data: unknown[] }).data
        : [];
    return rows.flatMap((row) => {
        if (!row || typeof row !== "object") return [];
        const item = row as { uuid?: unknown; name?: unknown };
        const uuid = supportThreadId(typeof item.uuid === "string" ? item.uuid : null);
        if (!uuid) return [];
        return [{ uuid, name: typeof item.name === "string" && item.name !== "" ? item.name : uuid }];
    });
}

export function parseInboxSummary(value: unknown): InboxSummaryCounts | null {
    if (!value || typeof value !== "object") return null;
    const row = value as Record<string, unknown>;
    if (typeof row.unread_messages !== "number" || typeof row.unread_threads !== "number") return null;
    return {
        unread_messages: row.unread_messages,
        unread_threads: row.unread_threads,
        open_issues: typeof row.open_issues === "number" ? row.open_issues : 0,
        open_chats: typeof row.open_chats === "number" ? row.open_chats : 0,
        unassigned_threads: typeof row.unassigned_threads === "number" ? row.unassigned_threads : 0,
    };
}

export function platformAgentControls(
    thread: Pick<SupportThread, "kind" | "status" | "abilities">,
    capability: PlatformCapability,
): PlatformControls {
    const send = capability.reply && thread.abilities.can_reply;
    const upload = send && capability.upload && thread.abilities.can_upload;
    const transition = capability.status && (
        thread.abilities.can_manage || thread.abilities.can_resolve || thread.abilities.can_reopen
    );
    const assign = capability.assign && capability.assignees && thread.abilities.can_assign;
    const convert = capability.convert
        && thread.abilities.can_convert
        && thread.kind === "chat"
        && thread.status === "open";
    return {
        send,
        upload,
        transition,
        assign,
        convert,
        readOnly: !send && !upload && !transition && !assign && !convert,
    };
}

export function platformAssignBody(version: number, assigneeUuid: string | null): Record<string, unknown> {
    return withoutOwnership({ assignee_uuid: assigneeUuid, expected_version: version });
}

export function platformStatusBody(version: number, status: string): Record<string, unknown> {
    return withoutOwnership({ status, expected_version: version });
}

export function platformReadBody(sequence: number): Record<string, unknown> {
    return withoutOwnership({ last_read_sequence: sequence });
}

export function mergeInboxPage<T extends { uuid: string }>(
    previous: readonly T[],
    incoming: readonly T[],
    preserveOrder: boolean,
): T[] {
    if (!preserveOrder || previous.length === 0) return [...incoming];
    const incomingById = new Map(incoming.map((row) => [row.uuid, row]));
    const kept = previous.flatMap((row) => {
        const next = incomingById.get(row.uuid);
        return next ? [next] : [];
    });
    const seen = new Set(kept.map((row) => row.uuid));
    return [...incoming.filter((row) => !seen.has(row.uuid)), ...kept];
}

export function inboxListState<T>(input: { denied: boolean; failed: boolean; rows: readonly T[] }): InboxListState<T> {
    if (input.denied) return { rows: [], stale: false, showTable: false };
    if (input.failed && input.rows.length === 0) return { rows: [], stale: true, showTable: false };
    return { rows: [...input.rows], stale: input.failed, showTable: true };
}

export function inboxPayloadIsClean(payload: Record<string, unknown>): boolean {
    return payloadOmitsOwnership(payload) && OWNED_FIELDS.every((field) => !(field in payload));
}

function companyIdentity(value: unknown): PlatformCompany | null {
    if (!value || typeof value !== "object") return null;
    const row = value as Record<string, unknown>;
    return {
        uuid: typeof row.uuid === "string" ? row.uuid : null,
        name: typeof row.name === "string" ? row.name : null,
        domain: typeof row.domain === "string" ? row.domain : null,
    };
}

function withoutOwnership(payload: Record<string, unknown>): Record<string, unknown> {
    const next = { ...payload };
    for (const field of OWNED_FIELDS) delete next[field];
    return next;
}
