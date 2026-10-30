import { NotificationBell } from "@/components/notifications/notification-bell";
import type { NotificationRow } from "@/components/notifications/notification-catalog";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const access = vi.hoisted(() => ({ allowed: true }));

const recent = vi.hoisted(() => ({
    count: 0,
    items: [] as NotificationRow[],
    isLoading: false,
    isError: false,
    markRead: vi.fn(),
    markAllRead: vi.fn(),
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

vi.mock("next/link", () => ({
    default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
        <a href={href} {...props}>{children}</a>
    ),
}));

vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({
        hasPermission: (name: string) => name === "notifications.access" && access.allowed,
    }),
}));

vi.mock("@/hooks/use-notifications", () => ({
    useUnreadCount: () => ({ count: recent.count }),
    useRecentNotifications: () => ({
        data: { success: true, data: recent.items },
        isLoading: recent.isLoading,
        isError: recent.isError,
    }),
    useNotificationActions: () => ({
        markRead: recent.markRead,
        markUnread: vi.fn(),
        markAllRead: recent.markAllRead,
        isMarking: false,
    }),
}));

const sample: NotificationRow = {
    id: "n-1",
    category: "client",
    event: "client_created",
    title_key: "notifications.events.client_created.title",
    message_key: "notifications.events.client_created.message",
    data: { client_name: "Rafi" },
    subject: { type: "client", uuid: "client-1" },
    read_at: null,
    created_at: new Date().toISOString(),
};

describe("NotificationBell", () => {
    beforeEach(() => {
        access.allowed = true;
        recent.count = 0;
        recent.items = [];
        recent.isLoading = false;
        recent.isError = false;
        recent.markRead.mockReset();
        recent.markAllRead.mockReset();
    });

    it("hides the bell without notifications.access", () => {
        access.allowed = false;
        render(<NotificationBell />);
        expect(screen.queryByTestId("notification-bell")).not.toBeInTheDocument();
    });

    it("shows 99+ when the unread count is over 99", () => {
        recent.count = 120;
        render(<NotificationBell />);
        expect(screen.getByTestId("notification-badge")).toHaveTextContent("99+");
    });

    it("shows the count, an empty dropdown, and mark-all", async () => {
        recent.count = 2;
        const user = userEvent.setup();
        render(<NotificationBell />);

        expect(screen.getByTestId("notification-badge")).toHaveTextContent("2");
        await user.click(screen.getByTestId("notification-bell"));

        expect(screen.getByTestId("notification-empty")).toBeInTheDocument();
        await user.click(screen.getByTestId("notification-mark-all"));
        expect(recent.markAllRead).toHaveBeenCalledOnce();
        expect(screen.getByTestId("notification-view-all")).toHaveAttribute("href", "/notifications");
    });

    it("renders loading and error states", async () => {
        recent.isLoading = true;
        const user = userEvent.setup();
        const { rerender } = render(<NotificationBell />);
        await user.click(screen.getByTestId("notification-bell"));
        expect(screen.getByTestId("notification-loading")).toBeInTheDocument();
        expect(screen.getAllByTestId("notification-skeleton-item")).toHaveLength(4);

        recent.isLoading = false;
        recent.isError = true;
        rerender(<NotificationBell />);
        expect(screen.getByTestId("notification-error")).toBeInTheDocument();
    });

    it("marks one notification as read from the dropdown", async () => {
        recent.count = 1;
        recent.items = [sample];
        const user = userEvent.setup();
        render(<NotificationBell />);
        await user.click(screen.getByTestId("notification-bell"));

        expect(screen.getByText("notifications.events.client_created.title")).toBeInTheDocument();
        await user.click(screen.getByTestId("notification-mark-read"));
        expect(recent.markRead).toHaveBeenCalledWith("n-1");
        expect(screen.getByRole("link", { name: /notifications.events.client_created.title/ })).toHaveAttribute(
            "href",
            "/clients/view/client-1"
        );
    });
});
