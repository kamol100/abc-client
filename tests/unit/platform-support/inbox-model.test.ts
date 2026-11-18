import { readFileSync } from "node:fs";
import {
    inboxListState,
    inboxPayloadIsClean,
    mergeInboxPage,
    parseAssignees,
    parseInboxSummary,
    parsePlatformThread,
    platformAgentControls,
    platformAssignBody,
    platformListParams,
    platformQueryKey,
    platformReadBody,
    platformStatusBody,
    type PlatformThread,
} from "@/components/platform-support/admin/inbox-model";
import {
    acknowledgeMessage,
    emptyHistory,
    supportHistoryUrl,
    supportPollInterval,
    supportQueryKey,
    type SupportMessage,
} from "@/components/platform-support/support-model";
import { describe, expect, it } from "vitest";

const COMPANY = "22222222-2222-4222-8222-222222222222";
const REQUESTER = "33333333-3333-4333-8333-333333333333";
const AGENT = "44444444-4444-4444-8444-444444444444";

function abilities(overrides: Partial<PlatformThread["abilities"]> = {}): PlatformThread["abilities"] {
    return {
        can_reply: false,
        can_resolve: false,
        can_reopen: false,
        can_manage: false,
        can_assign: false,
        can_convert: false,
        can_upload: false,
        can_read_source: false,
        ...overrides,
    };
}

function row(overrides: Record<string, unknown> = {}): Record<string, unknown> {
    return {
        uuid: "11111111-1111-4111-8111-111111111111",
        reference: "PS-I-9",
        kind: "issue",
        category: "technical",
        priority: "high",
        status: "open",
        version: 3,
        requester: { uuid: REQUESTER, name: "Mina" },
        requester_role: "Admin",
        reseller: { uuid: "55555555-5555-4555-8555-555555555555", name: "North" },
        company: { uuid: COMPANY, name: "North Net", domain: "north.example" },
        last_activity_at: "2026-11-13T08:00:00Z",
        assigned_agent: null,
        unread_count: 2,
        linked_issue_uuid: null,
        source_chat_uuid: null,
        abilities: abilities({ can_reply: true, can_upload: true, can_manage: true, can_assign: true }),
        ...overrides,
    };
}

function capability(overrides: Partial<Parameters<typeof platformAgentControls>[1]> = {}) {
    return {
        reply: false,
        upload: false,
        status: false,
        assign: false,
        assignees: false,
        convert: false,
        ...overrides,
    };
}

describe("platform inbox identity", () => {
    it("keeps company, domain, reseller and requester on the row", () => {
        const thread = parsePlatformThread(row());
        expect(thread?.company).toEqual({ uuid: COMPANY, name: "North Net", domain: "north.example" });
        expect(thread?.reseller).toEqual({ uuid: "55555555-5555-4555-8555-555555555555", name: "North" });
        expect(thread?.requester).toEqual({ uuid: REQUESTER, name: "Mina" });
        expect(thread?.requester_role).toBe("Admin");
        expect(thread?.unread_count).toBe(2);
    });

    it("drops a company or requester value that is not a uuid", () => {
        const params = platformListParams("issue", {
            company: "1",
            reseller: "north",
            requester: REQUESTER,
            sort: "name",
            company_id: "1",
        }, { unread: true, unassigned: true });

        expect(params).toEqual({
            kind: "issue",
            per_page: "40",
            requester: REQUESTER,
            assignee: "unassigned",
            unread_only: "1",
        });
        expect(params).not.toHaveProperty("company_id");
        expect(params).not.toHaveProperty("sort");
    });
});

describe("platform inbox controls", () => {
    it("hides every action from a read-only agent", () => {
        const controls = platformAgentControls(parsePlatformThread(row())!, capability());
        expect(controls).toMatchObject({ send: false, upload: false, transition: false, assign: false, convert: false, readOnly: true });
    });

    it("gives a reply agent send and upload, and no assignee list", () => {
        const thread = parsePlatformThread(row({ kind: "chat", abilities: abilities({ can_reply: true, can_upload: true, can_assign: true, can_convert: true }) }))!;
        const replyOnly = platformAgentControls(thread, capability({ reply: true, upload: true, assign: true }));
        expect(replyOnly.send).toBe(true);
        expect(replyOnly.upload).toBe(true);
        expect(replyOnly.assign).toBe(false);
        expect(replyOnly.convert).toBe(false);

        const noUpload = platformAgentControls(thread, capability({ reply: true }));
        expect(noUpload.send).toBe(true);
        expect(noUpload.upload).toBe(false);
    });

    it("shows manager actions only when the record ability and the named permission both allow them", () => {
        const thread = parsePlatformThread(row({
            kind: "chat",
            abilities: abilities({
                can_reply: true,
                can_upload: true,
                can_manage: true,
                can_assign: true,
                can_convert: true,
            }),
        }))!;
        const manager = platformAgentControls(thread, capability({
            reply: true,
            upload: true,
            status: true,
            assign: true,
            assignees: true,
            convert: true,
        }));
        expect(manager).toMatchObject({ send: true, upload: true, transition: true, assign: true, convert: true, readOnly: false });

        const deniedByRecord = platformAgentControls(
            parsePlatformThread(row({ abilities: abilities() }))!,
            capability({ reply: true, upload: true, status: true, assign: true, assignees: true, convert: true }),
        );
        expect(deniedByRecord.readOnly).toBe(true);
    });

    it("sends assignment and status with the expected version and no ownership fields", () => {
        const assign = platformAssignBody(4, null);
        const status = platformStatusBody(4, "waiting_for_requester");
        const read = platformReadBody(8);
        expect(assign).toEqual({ assignee_uuid: null, expected_version: 4 });
        expect(status).toEqual({ status: "waiting_for_requester", expected_version: 4 });
        expect(read).toEqual({ last_read_sequence: 8 });
        expect(inboxPayloadIsClean(assign)).toBe(true);
        expect(inboxPayloadIsClean({ ...assign, company_id: 1 })).toBe(false);
        expect(inboxPayloadIsClean({ ...read, reader_user_id: 9 })).toBe(false);
    });
});

describe("platform inbox cache", () => {
    it("keeps each agent's inbox cache separate from requester cache", () => {
        const first = platformQueryKey({ identity: "agent-a", resource: "threads" });
        const second = platformQueryKey({ identity: "agent-b", resource: "threads" });
        expect(first).not.toEqual(second);
        expect(first[1]).toBe("platform");
        expect(supportQueryKey({ identity: "agent-a", scope: "own", resource: "threads" })).not.toEqual(first);
    });

    it("polls the inbox every 10 seconds and stops when the tab is hidden", () => {
        const visible = {
            surface: "inbox" as const,
            documentVisible: true,
            online: true,
            signedIn: true,
            accessible: true,
            failureCount: 0,
        };
        expect(supportPollInterval(visible)).toBe(10_000);
        expect(supportPollInterval({ ...visible, documentVisible: false })).toBe(false);
        expect(supportPollInterval({ ...visible, online: false })).toBe(false);
        expect(supportPollInterval({ ...visible, failureCount: 2 })).toBe(40_000);
    });

    it("keeps the current row order while an agent is acting and still shows a new request", () => {
        const previous = [{ uuid: "b" }, { uuid: "a" }];
        const incoming = [{ uuid: "c" }, { uuid: "a" }, { uuid: "b" }];
        expect(mergeInboxPage(previous, incoming, true).map((item) => item.uuid)).toEqual(["c", "b", "a"]);
        expect(mergeInboxPage(previous, incoming, false).map((item) => item.uuid)).toEqual(["c", "a", "b"]);
    });

    it("treats a failed empty inbox as stale and a denial as no rows", () => {
        expect(inboxListState({ denied: false, failed: true, rows: [] })).toEqual({ rows: [], stale: true, showTable: false });
        expect(inboxListState({ denied: false, failed: true, rows: [{ uuid: "a" }] }).showTable).toBe(true);
        expect(inboxListState({ denied: true, failed: true, rows: [{ uuid: "a" }] })).toEqual({ rows: [], stale: false, showTable: false });
    });

    it("does not duplicate an acknowledged reply when the poll returns it again", () => {
        const message: SupportMessage = {
            uuid: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
            sequence: 4,
            author: { name: "Platform Agent", side: "platform", is_self: true },
            body: "We can see this.",
            attachments: [],
            created_at: null,
            client_request_id: "req-1",
        };
        const acknowledged = acknowledgeMessage(emptyHistory(), message);
        const polled = acknowledgeMessage(acknowledged, message);
        expect(polled.messages).toHaveLength(1);
        expect(polled.cursor).toBe(0);
        expect(supportHistoryUrl("platform", message.uuid)).toBe(`/platform-support-admin/threads/${message.uuid}/messages?limit=50`);
        expect(supportHistoryUrl("requester", message.uuid)).toBe(`/platform-support/threads/${message.uuid}/messages?limit=50`);
        expect(supportHistoryUrl("platform", "not-a-uuid")).toBeNull();
    });

    it("reads assignee names only from the admin assignee payload", () => {
        expect(parseAssignees({
            data: [
                { uuid: AGENT, name: "Rafi" },
                { uuid: "not-a-uuid", name: "Skipped" },
            ],
        })).toEqual([{ uuid: AGENT, name: "Rafi" }]);
        expect(parseInboxSummary({
            unread_messages: 2,
            unread_threads: 1,
            open_issues: 3,
            open_chats: 1,
            unassigned_threads: 1,
        })?.unread_messages).toBe(2);
        expect(parseInboxSummary(null)).toBeNull();
    });
});

describe("platform inbox translations", () => {
    it("keeps the inbox menu keys aligned", () => {
        const english = JSON.parse(readFileSync("public/lang/en.json", "utf8")) as { menu: { platform_support_inbox: unknown } };
        const bangla = JSON.parse(readFileSync("public/lang/bn.json", "utf8")) as { menu: { platform_support_inbox: unknown } };
        expect(english.menu.platform_support_inbox).toBeTruthy();
        expect(Object.keys(english.menu.platform_support_inbox as object)).toEqual(Object.keys(bangla.menu.platform_support_inbox as object));
    });
});
