import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ClientCount from "@/components/clients/client-count";

const activityQuery = vi.hoisted(() => ({
    data: undefined as { data: unknown } | undefined,
    isLoading: true,
    isFetching: true,
    isError: false,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

vi.mock("@/hooks/use-api-query", () => ({
    default: () => activityQuery,
}));

const activityRow = () => screen.getByTestId("client-activity");

const visibleNumbers = () =>
    [...activityRow().querySelectorAll(".absolute.inset-0")].map((node) => node.textContent);

describe("ClientCount layout", () => {
    beforeEach(() => {
        activityQuery.data = undefined;
        activityQuery.isLoading = true;
        activityQuery.isFetching = true;
        activityQuery.isError = false;
    });

    // ক্লায়েন্টের তথ্য ও নিয়ন্ত্রণ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps the mobile count row in place while the numbers load»।
    it("Client count layout: keeps the mobile count row in place while the numbers load", () => {
        const { rerender } = render(<ClientCount />);

        const loadingRow = activityRow();
        expect(loadingRow).toHaveClass("min-h-5");
        expect(loadingRow.querySelectorAll(".animate-pulse")).toHaveLength(4);
        expect(screen.getByText("client.title_plural")).toBeInTheDocument();
        expect(screen.getByText("client.activity.online")).toBeInTheDocument();
        expect(screen.getByText("client.activity.offline")).toBeInTheDocument();
        expect(screen.getByText("client.activity.disabled")).toBeInTheDocument();

        activityQuery.data = { data: { total: 10, online: 6, offline: 0, disabled: 1 } };
        activityQuery.isLoading = false;
        activityQuery.isFetching = false;
        rerender(<ClientCount />);

        expect(activityRow()).toBe(loadingRow);
        expect(activityRow().querySelectorAll(".animate-pulse")).toHaveLength(0);
        expect(visibleNumbers()).toEqual(["10", "6", "3", "1"]);

        activityQuery.isFetching = true;
        rerender(<ClientCount />);

        expect(activityRow().querySelectorAll(".animate-pulse")).toHaveLength(0);
        expect(visibleNumbers()).toEqual(["10", "6", "3", "1"]);
    });
});
