import { NotificationSettings } from "@/components/settings/notification-settings";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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
}));

vi.mock("@/hooks/use-api-mutation", () => ({
    default: () => ({
        mutateAsync: settings.mutateAsync,
        isPending: false,
    }),
}));

describe("NotificationSettings", () => {
    it("saves a missing key as on and an explicit off key as on when toggled", async () => {
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
});
