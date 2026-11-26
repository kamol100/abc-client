import { describe, expect, it } from "vitest";
import { telegramNotificationSections } from "@/components/telegram/telegram-form-schema";

function keys(platform: boolean, sectionId: "tenant" | "administration"): string[] {
    const section = telegramNotificationSections(platform).find((item) => item.id === sectionId);
    return section?.groups.flatMap((group) => group.options.map((option) => option.key)) ?? [];
}

describe("telegram notification sections", () => {
    // টেলিগ্রাম নোটিফিকেশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows tenant platform support create and update to every company»।
    it("Telegram notification sections: shows tenant platform support create and update to every company", () => {
        const sections = telegramNotificationSections(false);

        expect(sections.map((section) => section.id)).toEqual(["tenant"]);
        expect(keys(false, "tenant")).toEqual(expect.arrayContaining([
            "telegram_platform_support_create",
            "telegram_platform_support_update",
        ]));
        expect(keys(false, "tenant").some((key) => key.includes("admin"))).toBe(false);
    });

    // টেলিগ্রাম নোটিফিকেশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «adds administration create and update only for the platform company»।
    it("Telegram notification sections: adds administration create and update only for the platform company", () => {
        const sections = telegramNotificationSections(true);

        expect(sections.map((section) => section.id)).toEqual(["tenant", "administration"]);
        expect(keys(true, "administration")).toEqual([
            "telegram_platform_support_admin_create",
            "telegram_platform_support_admin_update",
        ]);
        expect(keys(true, "tenant")).not.toEqual(expect.arrayContaining([
            "telegram_platform_support_admin_create",
        ]));
    });
});
