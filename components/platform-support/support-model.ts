import { ApiRequestError } from "@/lib/api/api-request-error";
import { SUPPORT_IMAGE_MAX_BYTES } from "@/lib/platform-support/attachment-transport";

export const SUPPORT_MAX_IMAGES = 5;
export const SUPPORT_AUDIENCE = "requester" as const;

export const SUPPORT_CATEGORIES = ["general", "account", "billing", "technical", "bug", "other"] as const;
export const SUPPORT_PRIORITIES = ["low", "normal", "high"] as const;
export const SUPPORT_ISSUE_STATUSES = ["open", "in_progress", "waiting_for_requester", "resolved", "closed"] as const;
export const SUPPORT_CHAT_STATUSES = ["open", "closed", "converted"] as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CONTEXT_PATH = /^\/[A-Za-z0-9/._~-]*$/;
const ARTICLE_ID = /^[a-z0-9]+(?:[.-][a-z0-9]+)*$/;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const IMAGE_EXTENSIONS: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
};

export type SupportScope = "own" | "reseller" | "company";
export type SupportKind = "issue" | "chat";
export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];
export type SupportPriority = (typeof SUPPORT_PRIORITIES)[number];

export interface SupportAbilities {
    can_reply: boolean;
    can_resolve: boolean;
    can_reopen: boolean;
    can_manage: boolean;
    can_assign: boolean;
    can_convert: boolean;
    can_upload: boolean;
    can_read_source: boolean;
}

export interface SupportParty {
    uuid: string | null;
    name: string | null;
}

export interface SupportThread {
    uuid: string;
    reference: string | null;
    kind: SupportKind;
    subject: string | null;
    category: string | null;
    priority: string | null;
    status: string;
    version: number;
    requester: SupportParty;
    reseller: SupportParty | null;
    last_activity_at: string | null;
    assigned_agent: SupportParty | null;
    unread_count: number;
    linked_issue_uuid: string | null;
    source_chat_uuid: string | null;
    abilities: SupportAbilities;
    context?: { path?: string | null; article_id?: string | null } | null;
}

export interface SupportAttachment {
    uuid: string;
    filename: string;
    mime: string;
    bytes: number;
    width: number;
    height: number;
}

/** Summary values are counts from the authorized API, never derived from a page of threads. */
export function parseSupportSummary(value: unknown) {
    if (!value || typeof value !== "object") return null;
    const row = value as Record<string, unknown>;
    const count = (key: string) => {
        const value = row[key];
        return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : undefined;
    };
    return {
        open_issues: count("open_issues"),
        open_chats: count("open_chats"),
        unread_threads: count("unread_threads"),
        unread_messages: count("unread_messages"),
        unassigned_threads: count("unassigned_threads"),
    };
}

export interface SupportMessage {
    uuid: string;
    sequence: number;
    author: { name: string | null; side: string; is_self: boolean };
    body: string | null;
    attachments: SupportAttachment[];
    created_at: string | null;
    client_request_id: string | null;
}

export interface MessageWindow {
    data: SupportMessage[];
    oldest_sequence: number | null;
    latest_sequence: number | null;
    has_more: boolean;
    next_after_sequence: number;
    has_older: boolean;
}

export interface SupportHistory {
    messages: SupportMessage[];
    cursor: number;
    hasOlder: boolean;
    bootstrapped: boolean;
}

export interface DraftImage {
    localId: string;
    name: string;
    bytes: number;
    mime: string;
    status: "pending" | "uploading" | "ready" | "failed";
    uploadUuid?: string;
    uploadToken?: string;
    errorKey?: string;
}

export interface DraftSubmit {
    clientRequestId: string;
    body: string;
    tokens: string[];
    ambiguous: boolean;
}

export interface SupportActions {
    send: boolean;
    upload: boolean;
    resolve: boolean;
    reopen: boolean;
    convert: boolean;
    manage: boolean;
    readOnly: boolean;
}

const EMPTY_ABILITIES: SupportAbilities = {
    can_reply: false,
    can_resolve: false,
    can_reopen: false,
    can_manage: false,
    can_assign: false,
    can_convert: false,
    can_upload: false,
    can_read_source: false,
};

export function emptyHistory(): SupportHistory {
    return { messages: [], cursor: 0, hasOlder: false, bootstrapped: false };
}

export function supportThreadId(value: string | null | undefined): string | null {
    return value && UUID.test(value) ? value : null;
}

/** UUID v4 for draft and request ids. Available on plain HTTP. */
export function supportRequestId(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function supportContextPath(pathname: string): string | null {
    const path = pathname.split("?")[0]?.split("#")[0] ?? "";
    if (!CONTEXT_PATH.test(path) || path.length > 200) return null;
    return path;
}

export function supportArticleId(value: string | null | undefined): string | null {
    if (!value) return null;
    const id = value.split("?")[0]?.split("#")[0] ?? "";
    return ARTICLE_ID.test(id) ? id : null;
}

export function supportSubmissionContext(input: {
    includePage: boolean;
    path: string | null;
    articleId?: string | null;
}): { path: string; article_id?: string } | null {
    if (!input.includePage) return null;
    const path = input.path ? supportContextPath(input.path) : null;
    if (!path) return null;
    const articleId = path.startsWith("/help/") ? supportArticleId(input.articleId) : null;
    return articleId ? { path, article_id: articleId } : { path };
}

export function supportScopes(input: {
    resellerAccess: boolean;
    companyAccess: boolean;
    isReseller: boolean;
}): SupportScope[] {
    const scopes: SupportScope[] = ["own"];
    if (input.resellerAccess) scopes.push("reseller");
    if (input.companyAccess && !input.isReseller) scopes.push("company");
    return scopes;
}

export function supportListUrl(scope: SupportScope): string {
    if (scope === "reseller") return "platform-support/reseller/threads";
    if (scope === "company") return "platform-support/company/threads";
    return "platform-support/threads";
}

export function supportQueryKey(input: {
    identity: string;
    scope: SupportScope;
    resource: "summary" | "threads" | "thread" | "messages" | "source";
    thread?: string | null;
}): readonly [string, string, string, SupportScope, string, string | null] {
    return ["platform-support", SUPPORT_AUDIENCE, input.identity, input.scope, input.resource, input.thread ?? null];
}

export function supportListParams(
    scope: SupportScope,
    kind: SupportKind,
    filter: Record<string, string>,
): Record<string, string> {
    const params: Record<string, string> = { kind, per_page: "40" };
    for (const key of ["status", "priority", "category", "reference", "subject"] as const) {
        const value = filter[key]?.trim();
        if (value) params[key] = value;
    }
    if (scope === "company" && filter.reseller && UUID.test(filter.reseller.trim())) {
        params.reseller = filter.reseller.trim();
    }
    return params;
}

export function supportOwnsThread(thread: Pick<SupportThread, "requester">, actorUuid: string | null | undefined): boolean {
    return Boolean(actorUuid) && thread.requester.uuid === actorUuid;
}

export function supportHistoryUrl(audience: "requester" | "platform", threadId: string): string | null {
    const id = supportThreadId(threadId);
    if (!id) return null;
    const root = audience === "platform" ? "platform-support-admin" : "platform-support";
    return `/${root}/threads/${id}/messages?limit=50`;
}

export function supportReplyUrl(threadUuid: string, owns: boolean): string {
    const id = supportThreadId(threadUuid);
    if (!id) return "";
    return owns
        ? `platform-support/threads/${id}/messages`
        : `platform-support/threads/${id}/team-messages`;
}

export function supportLifecycleRequest(input: {
    threadUuid: string;
    kind: SupportKind;
    owns: boolean;
    version: number;
    action: "resolve" | "reopen" | "status";
    status?: string;
}): { url: string; body: Record<string, unknown> } | null {
    const id = supportThreadId(input.threadUuid);
    if (!id) return null;
    const version = { expected_version: input.version };
    if (!input.owns) {
        const status = input.action === "resolve"
            ? (input.kind === "chat" ? "closed" : "resolved")
            : input.action === "reopen"
                ? "open"
                : input.status;
        if (!status) return null;
        return {
            url: `platform-support/threads/${id}/team-status`,
            body: { ...version, status },
        };
    }
    if (input.action !== "resolve" && input.action !== "reopen") return null;
    return {
        url: `platform-support/threads/${id}/${input.action}`,
        body: version,
    };
}

export function supportActions(thread: Pick<SupportThread, "kind" | "status" | "abilities">, owns: boolean): SupportActions {
    const { abilities, kind, status } = thread;
    const issueOpen = kind === "issue" && status !== "resolved" && status !== "closed";
    const chatOpen = kind === "chat" && status === "open";
    const writable = issueOpen || chatOpen;
    const send = abilities.can_reply && writable;
    const resolve = abilities.can_resolve && (issueOpen || chatOpen);
    const reopen = abilities.can_reopen && (
        (kind === "issue" && (status === "resolved" || status === "closed"))
        || (kind === "chat" && status === "closed")
    );
    const convert = abilities.can_convert && owns && chatOpen;
    const manage = abilities.can_manage && !owns && kind === "issue" && status !== "converted";
    return {
        send,
        upload: send && abilities.can_upload,
        resolve,
        reopen,
        convert,
        manage,
        readOnly: !send && !resolve && !reopen && !convert && !manage,
    };
}

export function supportManageStatuses(kind: SupportKind): readonly string[] {
    return kind === "chat" ? ["open", "closed"] : SUPPORT_ISSUE_STATUSES;
}

function party(value: unknown): SupportParty | null {
    if (!value || typeof value !== "object") return null;
    const row = value as { uuid?: unknown; name?: unknown };
    return {
        uuid: typeof row.uuid === "string" ? row.uuid : null,
        name: typeof row.name === "string" ? row.name : null,
    };
}

function abilities(value: unknown): SupportAbilities {
    const row = value && typeof value === "object" ? value as Record<string, unknown> : {};
    return {
        can_reply: row.can_reply === true,
        can_resolve: row.can_resolve === true,
        can_reopen: row.can_reopen === true,
        can_manage: row.can_manage === true,
        can_assign: row.can_assign === true,
        can_convert: row.can_convert === true,
        can_upload: row.can_upload === true,
        can_read_source: row.can_read_source === true,
    };
}

export function parseSupportThread(value: unknown): SupportThread | null {
    if (!value || typeof value !== "object") return null;
    const row = value as Record<string, unknown>;
    if (typeof row.uuid !== "string" || (row.kind !== "issue" && row.kind !== "chat")) return null;
    const requester = party(row.requester) ?? { uuid: null, name: null };
    return {
        uuid: row.uuid,
        reference: typeof row.reference === "string" ? row.reference : null,
        kind: row.kind,
        subject: typeof row.subject === "string" ? row.subject : null,
        category: typeof row.category === "string" ? row.category : null,
        priority: typeof row.priority === "string" ? row.priority : null,
        status: typeof row.status === "string" ? row.status : "open",
        version: typeof row.version === "number" ? row.version : 1,
        requester,
        reseller: party(row.reseller),
        last_activity_at: typeof row.last_activity_at === "string" ? row.last_activity_at : null,
        assigned_agent: party(row.assigned_agent),
        unread_count: typeof row.unread_count === "number" ? row.unread_count : 0,
        linked_issue_uuid: typeof row.linked_issue_uuid === "string" ? row.linked_issue_uuid : null,
        source_chat_uuid: typeof row.source_chat_uuid === "string" ? row.source_chat_uuid : null,
        abilities: abilities(row.abilities ?? EMPTY_ABILITIES),
        context: row.context && typeof row.context === "object"
            ? row.context as SupportThread["context"]
            : null,
    };
}

function parseAttachment(value: unknown): SupportAttachment | null {
    if (!value || typeof value !== "object") return null;
    const row = value as Record<string, unknown>;
    if (typeof row.uuid !== "string") return null;
    return {
        uuid: row.uuid,
        filename: typeof row.filename === "string" ? row.filename : "image",
        mime: typeof row.mime === "string" ? row.mime : "application/octet-stream",
        bytes: typeof row.bytes === "number" ? row.bytes : 0,
        width: typeof row.width === "number" ? row.width : 0,
        height: typeof row.height === "number" ? row.height : 0,
    };
}

export function parseSupportMessage(value: unknown): SupportMessage | null {
    if (!value || typeof value !== "object") return null;
    const row = value as Record<string, unknown>;
    if (typeof row.uuid !== "string" || typeof row.sequence !== "number") return null;
    const author = row.author && typeof row.author === "object" ? row.author as Record<string, unknown> : {};
    const attachments = Array.isArray(row.attachments)
        ? row.attachments.flatMap((item) => {
            const attachment = parseAttachment(item);
            return attachment ? [attachment] : [];
        })
        : [];
    return {
        uuid: row.uuid,
        sequence: row.sequence,
        author: {
            name: typeof author.name === "string" ? author.name : null,
            side: typeof author.side === "string" ? author.side : "requester",
            is_self: author.is_self === true,
        },
        body: typeof row.body === "string" ? row.body : null,
        attachments,
        created_at: typeof row.created_at === "string" ? row.created_at : null,
        client_request_id: typeof row.client_request_id === "string" ? row.client_request_id : null,
    };
}

export function parseMessageWindow(payload: unknown): MessageWindow | null {
    if (!payload || typeof payload !== "object") return null;
    const body = payload as Record<string, unknown>;
    if (!Array.isArray(body.data)) return null;
    return {
        data: body.data.flatMap((row) => {
            const message = parseSupportMessage(row);
            return message ? [message] : [];
        }),
        oldest_sequence: typeof body.oldest_sequence === "number" ? body.oldest_sequence : null,
        latest_sequence: typeof body.latest_sequence === "number" ? body.latest_sequence : null,
        has_more: body.has_more === true,
        next_after_sequence: typeof body.next_after_sequence === "number" ? body.next_after_sequence : 0,
        has_older: body.has_older === true,
    };
}

export function mergeMessagePage(
    history: SupportHistory,
    page: MessageWindow,
    direction: "initial" | "older" | "newer",
): SupportHistory {
    const byId = new Map<string, SupportMessage>();
    for (const message of history.messages) byId.set(message.uuid, message);
    for (const message of page.data) byId.set(message.uuid, message);
    const messages = [...byId.values()].sort((left, right) => left.sequence - right.sequence || left.uuid.localeCompare(right.uuid));
    const stalled = direction !== "older"
        && history.bootstrapped
        && page.next_after_sequence === history.cursor
        && page.data.length === 0;
    return {
        messages,
        cursor: direction === "older" || stalled ? history.cursor : page.next_after_sequence,
        hasOlder: direction === "newer" ? history.hasOlder : page.has_older,
        bootstrapped: true,
    };
}

export function acknowledgeMessage(history: SupportHistory, message: SupportMessage): SupportHistory {
    return mergeMessagePage(history, {
        data: [message],
        oldest_sequence: message.sequence,
        latest_sequence: message.sequence,
        has_more: false,
        next_after_sequence: history.cursor,
        has_older: history.hasOlder,
    }, history.bootstrapped ? "newer" : "initial");
}

export function drainMessagePages(pages: MessageWindow[]): SupportHistory {
    return pages.reduce<SupportHistory>((history, page, index) => (
        mergeMessagePage(history, page, index === 0 && !history.bootstrapped ? "initial" : "newer")
    ), emptyHistory());
}

export function readSequenceForVisible(
    messages: Pick<SupportMessage, "uuid" | "sequence">[],
    visible: ReadonlySet<string>,
    current: number,
): number | null {
    let latest = current;
    for (const message of messages) {
        if (visible.has(message.uuid) && message.sequence > latest) latest = message.sequence;
    }
    return latest > current ? latest : null;
}

const POLL_MS = { thread: 5000, list: 15000, summary: 30000, inbox: 10000 } as const;

export function supportPollInterval(input: {
    surface: keyof typeof POLL_MS;
    documentVisible: boolean;
    online: boolean;
    signedIn: boolean;
    accessible: boolean;
    failureCount: number;
    retryAfterMs?: number | null;
}): number | false {
    if (!input.documentVisible || !input.online || !input.signedIn || !input.accessible) return false;
    const base = POLL_MS[input.surface];
    const backedOff = Math.min(60_000, base * 2 ** Math.min(Math.max(input.failureCount, 0), 4));
    return Math.max(backedOff, input.retryAfterMs ?? 0);
}

export function supportQueryRetry(failureCount: number, error: Error): boolean {
    if (
        error.message === "subscription.feature_not_in_plan"
        || error.message === "subscription.expired_action"
        || supportAccessDenied(error)
    ) {
        return false;
    }
    const parts = supportErrorParts(error);
    if (parts.status === 429 || parts.code === "platform_support.rate_limited") return failureCount < 1;
    return failureCount < 2;
}

export function supportErrorParts(error: unknown): { status?: number; code?: string } {
    if (error instanceof ApiRequestError) return { status: error.status, code: error.code };
    if (!error || typeof error !== "object") return {};
    const body = error as { status?: unknown; code?: unknown; error?: { code?: unknown } };
    const nested = body.error && typeof body.error === "object" ? body.error.code : undefined;
    return {
        status: typeof body.status === "number" ? body.status : undefined,
        code: typeof nested === "string" ? nested : typeof body.code === "string" ? body.code : undefined,
    };
}

export function supportAccessDenied(error: unknown): boolean {
    const parts = supportErrorParts(error);
    return parts.status === 403
        || parts.status === 404
        || parts.code === "platform_support.forbidden"
        || parts.code === "platform_support.not_found";
}

export function supportConflict(error: unknown): boolean {
    const parts = supportErrorParts(error);
    return parts.status === 409
        || parts.code === "platform_support.version_conflict"
        || parts.code === "platform_support.idempotency_conflict"
        || parts.code === "platform_support.sequence_conflict";
}

export function supportErrorKey(code: string | null | undefined): string {
    if (!code) return "platform_support.errors.generic";
    const short = code.startsWith("platform_support.") ? code.slice("platform_support.".length) : code;
    return `platform_support.errors.${short}`;
}

export function submissionAmbiguous(error: unknown): boolean {
    const { status, code } = supportErrorParts(error);
    if (code === "platform_support.rate_limited" || status === 429) return false;
    if (supportAccessDenied(error) || supportConflict(error)) return false;
    return status === undefined || status >= 500;
}

export function imageMime(file: { name: string; type: string }): string | null {
    if (file.type === "image/jpg") return "image/jpeg";
    if (IMAGE_TYPES.has(file.type)) return file.type;
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    return IMAGE_EXTENSIONS[extension] ?? null;
}

export function classifyImageFile(file: { name: string; size: number; type: string }): string | null {
    if (!imageMime(file)) return "platform_support.errors.image_invalid";
    if (file.size <= 0) return "platform_support.errors.image_invalid";
    if (file.size > SUPPORT_IMAGE_MAX_BYTES) return "platform_support.errors.image_too_large";
    return null;
}

export function addDraftImages(
    current: readonly DraftImage[],
    incoming: readonly { localId: string; name: string; size: number; type: string }[],
): { images: DraftImage[]; errors: { name: string; errorKey: string }[] } {
    const images = [...current];
    const errors: { name: string; errorKey: string }[] = [];
    for (const file of incoming) {
        if (images.length >= SUPPORT_MAX_IMAGES) {
            errors.push({ name: file.name, errorKey: "platform_support.errors.too_many_attachments" });
            continue;
        }
        const errorKey = classifyImageFile(file);
        if (errorKey) {
            errors.push({ name: file.name, errorKey });
            continue;
        }
        images.push({
            localId: file.localId,
            name: file.name,
            bytes: file.size,
            mime: imageMime(file) ?? file.type,
            status: "pending",
        });
    }
    return { images, errors };
}

export function markUploadResult(
    images: readonly DraftImage[],
    localId: string,
    result: { ok: true; uploadUuid: string; uploadToken: string } | { ok: false; errorKey: string },
): DraftImage[] {
    return images.map((image) => {
        if (image.localId !== localId) return image;
        if (result.ok) {
            return { ...image, status: "ready", uploadUuid: result.uploadUuid, uploadToken: result.uploadToken, errorKey: undefined };
        }
        return { ...image, status: "failed", errorKey: result.errorKey, uploadToken: undefined };
    });
}

export function readyTokens(images: readonly DraftImage[]): string[] {
    return images.flatMap((image) => image.status === "ready" && image.uploadToken ? [image.uploadToken] : []);
}

export function imageProgress(status: DraftImage["status"]): 0 | 50 | 100 {
    if (status === "ready") return 100;
    if (status === "uploading") return 50;
    return 0;
}

export function readUploadPayload(body: unknown): { uploadUuid: string; uploadToken: string } | null {
    if (!body || typeof body !== "object") return null;
    const data = (body as { data?: { upload_uuid?: unknown; upload_token?: unknown } }).data;
    if (!data || typeof data.upload_uuid !== "string" || typeof data.upload_token !== "string") return null;
    return { uploadUuid: data.upload_uuid, uploadToken: data.upload_token };
}

export function releasePreviewUrls(urls: Iterable<string>, revoke: (url: string) => void): void {
    for (const url of urls) revoke(url);
}

export function sameDraftPayload(left: Pick<DraftSubmit, "body" | "tokens">, body: string, tokens: readonly string[]): boolean {
    return left.body === body && left.tokens.join("\n") === tokens.join("\n");
}

export function submitAttempt(
    previous: DraftSubmit | null,
    body: string,
    tokens: readonly string[],
    newId: string,
): { request: DraftSubmit; reusedId: boolean; reconcileFirst: boolean } {
    if (previous && sameDraftPayload(previous, body, tokens)) {
        return {
            request: previous,
            reusedId: true,
            reconcileFirst: false,
        };
    }
    return {
        request: { clientRequestId: newId, body, tokens: [...tokens], ambiguous: false },
        reusedId: false,
        reconcileFirst: Boolean(previous?.ambiguous),
    };
}

export function priorRequestDelivered(messages: readonly Pick<SupportMessage, "client_request_id">[], requestId: string): boolean {
    return messages.some((message) => message.client_request_id === requestId);
}

export function resumedChatNeedsMessage(
    result: { resumed?: boolean; message?: unknown },
    payload: { body?: unknown; attachment_tokens?: unknown },
): boolean {
    const body = typeof payload.body === "string" ? payload.body.trim() : "";
    const tokens = Array.isArray(payload.attachment_tokens) ? payload.attachment_tokens : [];
    return result.resumed === true && (result.message === null || result.message === undefined) && (body !== "" || tokens.length > 0);
}

const OWNED_FIELDS = ["company_id", "reseller_id", "requester_user_id", "author_user_id", "author_side"] as const;

export function issueCreatePayload(input: {
    subject: string;
    category: string;
    priority: string;
    body: string;
    tokens: readonly string[];
    clientRequestId: string;
    draftId: string;
    path: string | null;
    includePage: boolean;
    articleId?: string | null;
}): Record<string, unknown> {
    return withoutOwnership({
        kind: "issue",
        subject: input.subject.trim(),
        category: input.category,
        priority: input.priority || "normal",
        body: input.body.trim() || null,
        attachment_tokens: [...input.tokens],
        client_request_id: input.clientRequestId,
        draft_id: input.draftId,
        context: supportSubmissionContext(input),
    });
}

export function messagePayload(input: {
    body: string;
    tokens: readonly string[];
    clientRequestId: string;
}): Record<string, unknown> {
    return withoutOwnership({
        body: input.body.trim() || null,
        attachment_tokens: [...input.tokens],
        client_request_id: input.clientRequestId,
    });
}

export function chatStartPayload(
    clientRequestId: string,
    path: string | null,
    includePage = false,
    articleId: string | null = null,
): Record<string, unknown> {
    return withoutOwnership({
        kind: "chat",
        client_request_id: clientRequestId,
        context: supportSubmissionContext({ includePage, path, articleId }),
    });
}

export function convertPayload(input: {
    subject: string;
    category: string;
    priority: string;
    expectedVersion: number;
    clientRequestId: string;
}): Record<string, unknown> {
    return withoutOwnership({
        subject: input.subject.trim(),
        category: input.category,
        priority: input.priority,
        expected_version: input.expectedVersion,
        client_request_id: input.clientRequestId,
    });
}

function withoutOwnership(payload: Record<string, unknown>): Record<string, unknown> {
    const next = { ...payload };
    for (const field of OWNED_FIELDS) delete next[field];
    return next;
}

export function payloadOmitsOwnership(payload: Record<string, unknown>): boolean {
    return OWNED_FIELDS.every((field) => !(field in payload));
}

export function pendingAfterReload(): null {
    return null;
}
