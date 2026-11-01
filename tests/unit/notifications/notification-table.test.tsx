import { notificationListParams } from "@/components/notifications/notification-filter-schema";
import { NotificationTable } from "@/components/notifications/notification-table";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const query = vi.hoisted(() => ({
    last: null as { url?: string; params?: Record<string, string>; queryKey?: unknown[] } | null,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

vi.mock("@/components/data-table/data-table", () => ({
    DataTable: ({ toolbarTitle }: { toolbarTitle?: string }) => (
        <div data-testid="notification-history">{toolbarTitle}</div>
    ),
}));

vi.mock("@/hooks/use-api-query", () => ({
    default: (options: { url?: string; params?: Record<string, string>; queryKey?: unknown[] }) => {
        query.last = options;
        return {
            data: {
                success: true,
                data: {
                    data: [],
                    pagination: { total: 12, count: 0, per_page: 40, current_page: 2, total_pages: 1 },
                },
            },
            isLoading: false,
            isFetching: false,
            setCurrentPage: vi.fn(),
        };
    },
}));

vi.mock("@/hooks/use-notifications", () => ({
    NOTIFICATIONS_QUERY_KEY: "notifications",
    useNotificationActions: () => ({
        markRead: vi.fn(),
        markUnread: vi.fn(),
        markAllRead: vi.fn(),
        isMarking: false,
    }),
}));

describe("notification history", () => {
    it("turns filter strings into list params", () => {
        expect(notificationListParams(null)).toBeUndefined();
        expect(notificationListParams("status=unread&category=invoice")).toEqual({
            status: "unread",
            category: "invoice",
        });
    });

    it("requests the notifications list with backend pagination", () => {
        render(<NotificationTable />);
        expect(screen.getByTestId("notification-history")).toBeInTheDocument();
        expect(query.last?.url).toBe("notifications");
        expect(query.last?.queryKey).toEqual(["notifications", "list"]);
        expect(screen.getByText("notifications.title (12)")).toBeInTheDocument();
    });
});
