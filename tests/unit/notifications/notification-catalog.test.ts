import {
    NOTIFICATION_EVENTS,
    isNotificationSettingEnabled,
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
