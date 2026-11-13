import { readFileSync } from "node:fs";
import { ApiRequestError } from "@/lib/api/api-request-error";
import {
    acknowledgeMessage,
    addDraftImages,
    chatStartPayload,
    drainMessagePages,
    emptyHistory,
    issueCreatePayload,
    markUploadResult,
    mergeMessagePage,
    payloadOmitsOwnership,
    pendingAfterReload,
    priorRequestDelivered,
    readSequenceForVisible,
    readyTokens,
    releasePreviewUrls,
    resumedChatNeedsMessage,
    submitAttempt,
    supportActions,
    supportLifecycleRequest,
    supportListParams,
    supportPollInterval,
    supportQueryKey,
    supportReplyUrl,
    supportScopes,
    type DraftImage,
    type MessageWindow,
    type SupportMessage,
    type SupportThread,
} from "@/components/platform-support/support-model";
import { describe, expect, it } from "vitest";

function message(sequence: number, uuid = `m-${sequence}`): SupportMessage {
    return {
        uuid,
        sequence,
        author: { name: "Ari", side: "requester", is_self: true },
        body: `row ${sequence}`,
        attachments: [],
        created_at: null,
        client_request_id: `req-${sequence}`,
    };
}

function page(sequences: number[], extra: Partial<MessageWindow> = {}): MessageWindow {
    const rows = sequences.map((sequence) => message(sequence));
    return {
        data: rows,
        oldest_sequence: rows[0]?.sequence ?? null,
        latest_sequence: rows.at(-1)?.sequence ?? null,
        has_more: false,
        next_after_sequence: rows.at(-1)?.sequence ?? 0,
        has_older: false,
        ...extra,
    };
}

function thread(overrides: Partial<SupportThread> = {}): SupportThread {
    return {
        uuid: "11111111-1111-4111-8111-111111111111",
        reference: "PS-I-1",
        kind: "issue",
        subject: "Router",
        category: "technical",
        priority: "normal",
        status: "open",
        version: 2,
        requester: { uuid: "actor", name: "Ari" },
        reseller: null,
        last_activity_at: null,
        assigned_agent: null,
        unread_count: 0,
        linked_issue_uuid: null,
        source_chat_uuid: null,
        abilities: {
            can_reply: true,
            can_resolve: true,
            can_reopen: false,
            can_manage: false,
            can_assign: false,
            can_convert: false,
            can_upload: true,
            can_read_source: true,
        },
        ...overrides,
    };
}

describe("platform support scope", () => {
    it("offers own, reseller, and company scopes only when the server grants them", () => {
        expect(supportScopes({ resellerAccess: false, companyAccess: false, isReseller: false })).toEqual(["own"]);
        expect(supportScopes({ resellerAccess: true, companyAccess: true, isReseller: true })).toEqual(["own", "reseller"]);
        expect(supportScopes({ resellerAccess: false, companyAccess: true, isReseller: false })).toEqual(["own", "company"]);
    });

    it("keeps a company reseller filter off own and reseller lists", () => {
        const reseller = "22222222-2222-4222-8222-222222222222";
        expect(supportListParams("own", "issue", { reseller, status: "open" }).reseller).toBeUndefined();
        expect(supportListParams("company", "chat", { reseller }).reseller).toBe(reseller);
        expect(supportListParams("company", "chat", { reseller: "12" }).reseller).toBeUndefined();
    });

    it("sends a colleague reply to the team route and keeps ownership fields out of payloads", () => {
        expect(supportReplyUrl(thread().uuid, true)).toContain("/messages");
        expect(supportReplyUrl(thread().uuid, false)).toContain("/team-messages");
        const created = issueCreatePayload({
            subject: "Router",
            category: "technical",
            priority: "normal",
            body: "Help",
            tokens: [],
            clientRequestId: "33333333-3333-4333-8333-333333333333",
            draftId: "44444444-4444-4444-8444-444444444444",
            path: "/clients?token=secret",
        });
        expect(payloadOmitsOwnership(created)).toBe(true);
        expect(created.context).toEqual({ path: "/clients" });
        expect(issueCreatePayload({
            subject: "Router",
            category: "technical",
            priority: "normal",
            body: "Help",
            tokens: [],
            clientRequestId: "33333333-3333-4333-8333-333333333333",
            draftId: "44444444-4444-4444-8444-444444444444",
            path: "https://evil.example/clients",
        }).context).toBeNull();
        expect(payloadOmitsOwnership(chatStartPayload("33333333-3333-4333-8333-333333333333", "/clients"))).toBe(true);
    });

    it("hides send and manage controls for a read-only colleague", () => {
        const colleague = thread({
            requester: { uuid: "other", name: "Sam" },
            abilities: {
                can_reply: false,
                can_resolve: false,
                can_reopen: false,
                can_manage: false,
                can_assign: false,
                can_convert: false,
                can_upload: false,
                can_read_source: true,
            },
        });
        expect(supportActions(colleague, false).readOnly).toBe(true);
        expect(supportActions(colleague, false).send).toBe(false);
    });

    it("uses team status for a colleague and the owner routes for the requester", () => {
        const id = thread().uuid;
        expect(supportLifecycleRequest({ threadUuid: id, kind: "issue", owns: true, version: 3, action: "resolve" })?.url).toContain("/resolve");
        expect(supportLifecycleRequest({ threadUuid: id, kind: "chat", owns: false, version: 3, action: "resolve" })).toEqual({
            url: `platform-support/threads/${id}/team-status`,
            body: { expected_version: 3, status: "closed" },
        });
    });
});

describe("platform support history", () => {
    it("drains a backlog in order without duplicating or skipping ahead", () => {
        const first = page(Array.from({ length: 100 }, (_, index) => index + 1), { has_more: true, has_older: false });
        const second = page([101, 102, 103, 104, 105], { has_more: false });
        const history = drainMessagePages([first, second]);

        expect(history.messages.map((row) => row.sequence)).toEqual(Array.from({ length: 105 }, (_, index) => index + 1));
        expect(history.cursor).toBe(105);
        expect(new Set(history.messages.map((row) => row.uuid)).size).toBe(105);
    });

    it("keeps the forward cursor while older history is prepended", () => {
        const current = mergeMessagePage(emptyHistory(), page([51, 52], { has_older: true, next_after_sequence: 52 }), "initial");
        const older = mergeMessagePage(current, page([49, 50], { has_older: false, next_after_sequence: 50 }), "older");

        expect(older.messages.map((row) => row.sequence)).toEqual([49, 50, 51, 52]);
        expect(older.cursor).toBe(52);
    });

    it("does not replace history with an empty poll or a duplicate acknowledgement", () => {
        const current = mergeMessagePage(emptyHistory(), page([1, 2], { next_after_sequence: 2 }), "initial");
        const polled = mergeMessagePage(current, page([], { next_after_sequence: 2 }), "newer");
        const saved = acknowledgeMessage(polled, message(2, "m-2"));

        expect(polled.cursor).toBe(2);
        expect(saved.messages).toHaveLength(2);
        expect(saved.cursor).toBe(2);
        expect(pendingAfterReload()).toBeNull();
    });

    it("marks only the latest visible message", () => {
        const rows = [message(1), message(2), message(3)];
        expect(readSequenceForVisible(rows, new Set(["m-1", "m-2"]), 0)).toBe(2);
        expect(readSequenceForVisible(rows, new Set(["m-3"]), 2)).toBe(3);
        expect(readSequenceForVisible(rows, new Set(), 3)).toBeNull();
    });
});

describe("platform support polling", () => {
    it("stops when the tab, network, session, or record is unavailable and backs off", () => {
        const base = { surface: "thread" as const, documentVisible: true, online: true, signedIn: true, accessible: true, failureCount: 0 };
        expect(supportPollInterval(base)).toBe(5000);
        expect(supportPollInterval({ ...base, surface: "list" })).toBe(15000);
        expect(supportPollInterval({ ...base, surface: "summary" })).toBe(30000);
        expect(supportPollInterval({ ...base, documentVisible: false })).toBe(false);
        expect(supportPollInterval({ ...base, online: false })).toBe(false);
        expect(supportPollInterval({ ...base, signedIn: false })).toBe(false);
        expect(supportPollInterval({ ...base, accessible: false })).toBe(false);
        expect(supportPollInterval({ ...base, failureCount: 2 })).toBe(20000);
        expect(supportPollInterval({ ...base, retryAfterMs: 9000 })).toBe(9000);
    });

    it("partitions cache keys by the server identity, audience, scope, and thread", () => {
        expect(supportQueryKey({ identity: "user-1", scope: "company", resource: "messages", thread: "thread-1" })).toEqual([
            "platform-support",
            "requester",
            "user-1",
            "company",
            "messages",
            "thread-1",
        ]);
    });
});

describe("platform support composer state", () => {
    const file = (name: string, size: number, type: string, localId: string) => ({ name, size, type, localId });

    it("keeps the other files when one is rejected or one upload fails", () => {
        const first = addDraftImages([], [
            file("a.png", 100, "image/png", "a"),
            file("big.png", 6 * 1024 * 1024, "image/png", "big"),
            file("note.txt", 20, "text/plain", "text"),
        ]);
        expect(first.images.map((image) => image.localId)).toEqual(["a"]);
        expect(first.errors.map((error) => error.errorKey)).toEqual([
            "platform_support.errors.image_too_large",
            "platform_support.errors.image_invalid",
        ]);

        const many = addDraftImages([], Array.from({ length: 6 }, (_, index) => file(`${index}.png`, 10, "image/png", String(index))));
        expect(many.images).toHaveLength(5);
        expect(many.errors).toHaveLength(1);

        const uploaded = markUploadResult(
            [draft("a", "ready"), draft("b", "uploading")],
            "b",
            { ok: false, errorKey: "platform_support.errors.image_invalid" },
        );
        expect(readyTokens(uploaded)).toEqual(["token-a"]);
        expect(uploaded.find((image) => image.localId === "b")?.status).toBe("failed");
    });

    it("reuses a retry id and starts a new id after an edited ambiguous attempt", () => {
        const failed = submitAttempt(null, "Hello", ["token-a"], "id-1").request;
        const ambiguous = { ...failed, ambiguous: true };
        const retry = submitAttempt(ambiguous, "Hello", ["token-a"], "id-2");
        const edited = submitAttempt(ambiguous, "Hello again", ["token-a"], "id-3");

        expect(retry.reusedId).toBe(true);
        expect(retry.request.clientRequestId).toBe(failed.clientRequestId);
        expect(retry.reconcileFirst).toBe(false);
        expect(edited.reusedId).toBe(false);
        expect(edited.request.clientRequestId).toBe("id-3");
        expect(edited.reconcileFirst).toBe(true);
        expect(priorRequestDelivered([message(1)], "req-1")).toBe(true);
    });

    it("does not treat a resumed chat as a sent first message", () => {
        expect(resumedChatNeedsMessage({ resumed: true, message: null }, { body: "Hello", attachment_tokens: [] })).toBe(true);
        expect(resumedChatNeedsMessage({ resumed: true, message: null }, { body: "  " })).toBe(false);
    });

    it("revokes every local preview url", () => {
        const revoked: string[] = [];
        releasePreviewUrls(["blob:1", "blob:2"], (url) => revoked.push(url));
        expect(revoked).toEqual(["blob:1", "blob:2"]);
    });

    it("hides private history when access is denied", () => {
        const denied = new ApiRequestError("Insufficient permission.", 403, "platform_support.forbidden");
        expect(supportActions(thread({ abilities: { ...thread().abilities, can_reply: false, can_resolve: false } }), true).send).toBe(false);
        expect(denied.status).toBe(403);
    });
});

describe("platform support translations", () => {
    it("keeps the English and Bangla support keys aligned", () => {
        const english = JSON.parse(readFileSync("public/lang/en.json", "utf8")) as { platform_support: unknown; menu: { platform_support: unknown; platform_support_inbox: unknown } };
        const bangla = JSON.parse(readFileSync("public/lang/bn.json", "utf8")) as { platform_support: unknown; menu: { platform_support: unknown; platform_support_inbox: unknown } };
        expect(leafKeys(english.platform_support)).toEqual(leafKeys(bangla.platform_support));
        expect(leafKeys(english.menu.platform_support)).toEqual(leafKeys(bangla.menu.platform_support));
        expect(leafKeys(english.menu.platform_support_inbox)).toEqual(leafKeys(bangla.menu.platform_support_inbox));
    });
});

function draft(localId: string, status: DraftImage["status"]): DraftImage {
    return {
        localId,
        name: `${localId}.png`,
        bytes: 10,
        mime: "image/png",
        status,
        uploadToken: status === "ready" ? `token-${localId}` : undefined,
    };
}

function leafKeys(value: unknown, prefix = ""): string[] {
    if (!value || typeof value !== "object" || Array.isArray(value)) return [prefix];
    return Object.entries(value).flatMap(([key, child]) => leafKeys(child, prefix ? `${prefix}.${key}` : key));
}
