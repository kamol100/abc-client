import {
    NOTIFICATION_EVENTS,
    isNotificationSettingEnabled,
    notificationInterpolation,
    notificationMessageKeys,
    notificationTitleKey,
    resolveNotificationHref,
} from "@/components/notifications/notification-catalog";
import { formatRelativeTime } from "@/lib/helper/helper";
import bn from "@/public/lang/bn.json";
import en from "@/public/lang/en.json";
import { describe, expect, it } from "vitest";

function readPath(source: Record<string, unknown>, path: string): unknown {
    return path.split(".").reduce<unknown>((current, key) => {
        if (!current || typeof current !== "object") return undefined;
        return (current as Record<string, unknown>)[key];
    }, source);
}

function translateFrom(source: Record<string, unknown>, key: string): string {
    const value = readPath(source, key);
    return typeof value === "string" ? value : key;
}

function fill(template: string, values: Record<string, string | number>): string {
    return template.replace(/\{\{([a-z0-9_]+)\}\}/g, (match, name: string) => {
        const value = values[name];
        return value === undefined ? match : String(value);
    });
}

describe("notification catalog", () => {
    it("maps subjects to dashboard routes", () => {
        expect(resolveNotificationHref({ type: "client", uuid: "c-1" })).toBe("/clients/view/c-1");
        expect(resolveNotificationHref({ type: "ticket", uuid: "t-1" })).toBe("/tickets/view/t-1");
        expect(resolveNotificationHref({ type: "invoice", uuid: "i-1" })).toBe("/invoices/edit/i-1");
        expect(resolveNotificationHref({ type: "olt", uuid: "o-1" })).toBe("/olts/view/o-1");
        expect(resolveNotificationHref({ type: "onu", uuid: "u-1" })).toBe("/onus");
        expect(resolveNotificationHref({ type: "onu", uuid: null })).toBe("/onus");
        expect(resolveNotificationHref(null)).toBeNull();
        expect(resolveNotificationHref({ type: "unknown", uuid: "x" })).toBeNull();
    });

    it("treats a missing preference as enabled", () => {
        expect(isNotificationSettingEnabled(undefined)).toBe(true);
        expect(isNotificationSettingEnabled(null)).toBe(true);
        expect(isNotificationSettingEnabled(1)).toBe(true);
        expect(isNotificationSettingEnabled("1")).toBe(true);
        expect(isNotificationSettingEnabled(0)).toBe(false);
        expect(isNotificationSettingEnabled("0")).toBe(false);
        expect(isNotificationSettingEnabled(false)).toBe(false);
    });

    it("fills ticket status copy from the stored payload", () => {
        const values = notificationInterpolation(
            { ticket_number: 18, client_name: "Rahim", status: "open" },
            (key) => translateFrom(bn, key)
        );
        const message = readPath(bn, "notifications.events.ticket_status_changed.message");

        expect(values.ticket_no).toBe(18);
        expect(values.status).toBe("ওপেন");
        expect(fill(String(message), values)).toBe("টিকিট 18 এখন ওপেন");
    });

    it("translates onu status names used as from and to", () => {
        const values = notificationInterpolation(
            { onu_name: "ONU-1", from_status: "offline", status: "online" },
            (key) => translateFrom(bn, key)
        );

        expect(fill("{{onu_name}} {{from}} থেকে {{to}} হয়েছে", values)).toBe(
            "ONU-1 অফলাইন থেকে অনলাইন হয়েছে"
        );
    });

    it("has an English and Bangla title and message for every event", () => {
        for (const event of NOTIFICATION_EVENTS) {
            const title = notificationTitleKey(event.value);
            expect(readPath(en, title), title).toEqual(expect.any(String));
            expect(readPath(bn, title), title).toEqual(expect.any(String));
            for (const messageKey of notificationMessageKeys(event.value)) {
                expect(readPath(en, messageKey), messageKey).toEqual(expect.any(String));
                expect(readPath(bn, messageKey), messageKey).toEqual(expect.any(String));
            }
        }
    });
});

describe("formatRelativeTime", () => {
    it("uses the active language locale", () => {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const english = formatRelativeTime(twoHoursAgo, "en");
        const bangla = formatRelativeTime(twoHoursAgo, "bn");

        expect(english.toLowerCase()).toContain("ago");
        expect(bangla).not.toBe(english);
        expect(bangla.length).toBeGreaterThan(0);
        expect(formatRelativeTime("not-a-date", "en")).toBe("");
    });
});
