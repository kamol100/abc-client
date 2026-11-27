import { NotificationSettings } from "@/components/settings/notification-settings";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

// null = every permission.
const permissions = vi.hoisted(() => ({ allowed: null as Set<string> | null }));

const settings = vi.hoisted(() => ({
    values: { notify_client_created: 0 } as Record<string, unknown>,
    updateSettings: vi.fn(),
    mutateAsync: vi.fn().mockResolvedValue({}),
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

vi.mock("@/context/app-provider", () => ({
    useSettings: () => ({
        settings: settings.values,
        updateSettings: settings.updateSettings,
    }),
    usePermissions: () => ({
        hasPermission: (permission: string) => permissions.allowed === null || permissions.allowed.has(permission),
    }),
}));

vi.mock("@/hooks/use-api-mutation", () => ({
    default: () => ({
        mutateAsync: settings.mutateAsync,
        isPending: false,
    }),
}));

describe("NotificationSettings", () => {
    beforeEach(() => {
        permissions.allowed = null;
    });

    // নোটিফিকেশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «saves a missing key as on and an explicit off key as on when toggled»।
    it("Notification settings: saves a missing key as on and an explicit off key as on when toggled", async () => {
        const user = userEvent.setup();
        render(<NotificationSettings />);

        const category = screen.getByTestId("notify-notify_category_client");
        const event = screen.getByTestId("notify-notify_client_created");
        expect(category).toHaveAttribute("data-state", "checked");
        expect(event).toHaveAttribute("data-state", "unchecked");

        await user.click(event);

        expect(settings.mutateAsync).toHaveBeenCalledWith({
            settings: { notify_client_created: 1 },
        });
        expect(settings.updateSettings).toHaveBeenCalledWith({ notify_client_created: 1 });
    });

    // নোটিফিকেশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows only the categories the user has permission for»।
    it("Notification settings: shows only the categories the user has permission for", () => {
        permissions.allowed = new Set([
            "company-settings.access",
            "company-settings.notifications",
            "company-settings.notifications.client",
            "company-settings.notifications.platform-support",
        ]);
        render(<NotificationSettings />);

        expect(screen.getByTestId("notify-notify_category_client")).toBeInTheDocument();
        expect(screen.getByTestId("notify-notify_category_platform_support")).toBeInTheDocument();
        expect(screen.queryByTestId("notify-notify_category_network")).not.toBeInTheDocument();
        expect(screen.queryByTestId("notify-notify_category_invoice")).not.toBeInTheDocument();
    });

    // নোটিফিকেশন যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows a no-permission notice without the page permission»।
    it("Notification settings: shows a no-permission notice without the page permission", () => {
        permissions.allowed = new Set(["company-settings.access", "company-settings.notifications.client"]);
        render(<NotificationSettings />);

        expect(screen.getByText("settings.common.no_permission")).toBeInTheDocument();
        expect(screen.queryByTestId("notify-notify_category_client")).not.toBeInTheDocument();
    });
});
