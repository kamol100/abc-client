import { useRecentNotifications, useUnreadCount } from "@/hooks/use-notifications";
import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const captured = vi.hoisted(() => ({
    calls: [] as Array<{
        queryKey?: unknown;
        url?: string;
        enabled?: boolean;
        refetchOnWindowFocus?: boolean;
        refetchIntervalInBackground?: boolean;
        refetchInterval?: () => number | false;
    }>,
}));

vi.mock("@/app/actions", () => ({
    useFetch: vi.fn(),
}));

vi.mock("@/hooks/use-api-query", () => ({
    default: (options: (typeof captured.calls)[number]) => {
        captured.calls.push(options);
        return { data: undefined, isLoading: false, isError: false };
    },
}));

describe("notification live queries", () => {
    beforeEach(() => {
        captured.calls = [];
    });

    it("refetches the unread count and recent list on focus and every 5 minutes", () => {
        renderHook(() => {
            useUnreadCount();
            useRecentNotifications(2);
        });

        expect(captured.calls).toHaveLength(2);
        for (const options of captured.calls) {
            expect(options.refetchOnWindowFocus).toBe(true);
            expect(options.refetchIntervalInBackground).toBe(false);
            expect(options.enabled).toBeUndefined();
            expect(options.refetchInterval?.()).toBe(5 * 60 * 1000);
        }

        expect(captured.calls.map((call) => call.url)).toEqual([
            "notifications/unread-count",
            "notifications/recent",
        ]);
        expect(captured.calls[1]?.queryKey).toEqual(["notifications", "recent", 2]);
    });

    it("pauses the refresh while the tab is hidden", () => {
        renderHook(() => useUnreadCount());
        const refresh = captured.calls[0]?.refetchInterval;

        Object.defineProperty(document, "visibilityState", {
            configurable: true,
            get: () => "hidden",
        });

        try {
            expect(refresh?.()).toBe(false);
        } finally {
            Reflect.deleteProperty(document, "visibilityState");
        }
    });
});
