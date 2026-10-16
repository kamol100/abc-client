import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
    ActivityLogSummaryCell,
    activityChangeSummary,
    getActivityLogColumns,
} from "@/components/activity-logs/activity-log-column";

vi.mock("@/components/activity-logs/activity-log-actions-cell", () => ({
    ActivityLogActionsCell: () => null,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) =>
            key === "activity_log.summary.show_more"
                ? "Show more"
                : key === "activity_log.summary.show_less"
                    ? "Show less"
                    : key,
    }),
}));

describe("activityChangeSummary", () => {
    it("puts each changed field on one line as old to new", () => {
        expect(activityChangeSummary({
            old: { name: "Kamol", status: "Inactive", updated_at: "1-Jan-26 10:00 am" },
            attributes: { name: "Kamol Hasan", status: "Active", updated_at: "2-Jan-26 11:00 am" },
        })).toBe("Name: Kamol → Kamol Hasan, Status: Inactive → Active");
    });

    it("lists created fields without an old value", () => {
        expect(activityChangeSummary({
            attributes: { phone: "01700000000" },
        })).toBe("Phone: 01700000000");
    });

    it("returns an empty summary when nothing changed", () => {
        expect(activityChangeSummary()).toBe("");
        expect(activityChangeSummary({
            old: { name: "Kamol" },
            attributes: { name: "Kamol" },
        })).toBe("");
    });
});

describe("ActivityLogSummaryCell", () => {
    it("shows a dash when there is no change", () => {
        render(<ActivityLogSummaryCell />);

        expect(screen.getByText("—")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Show more" })).not.toBeInTheDocument();
    });

    it("expands a long summary and collapses it again", async () => {
        const user = userEvent.setup();
        const summary = "Name: A very long original customer name that stays clipped until show more → A very long updated customer name that stays clipped";

        render(
            <ActivityLogSummaryCell
                changes={{
                    old: { name: "A very long original customer name that stays clipped until show more" },
                    attributes: { name: "A very long updated customer name that stays clipped" },
                }}
            />
        );

        const showMore = screen.getByRole("button", { name: "Show more" });
        expect(screen.getByText(`${summary.slice(0, 120)}…`)).toBeInTheDocument();
        expect(screen.queryByText(summary)).not.toBeInTheDocument();
        expect(showMore.parentElement).toHaveClass("min-w-full");
        expect(showMore.parentElement).not.toHaveClass("max-w-[200px]");

        await user.click(showMore);

        expect(screen.getByText(summary)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Show less" })).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: "Show less" }));

        expect(screen.getByText(`${summary.slice(0, 120)}…`)).toBeInTheDocument();
        expect(screen.queryByText(summary)).not.toBeInTheDocument();
    });
});

describe("activity log column widths", () => {
    it("keeps action by and date at least 150px", () => {
        const columns = getActivityLogColumns(() => undefined);
        const actionBy = columns.find(
            (column) => "accessorKey" in column && column.accessorKey === "description"
        );
        const date = columns.find(
            (column) => "accessorKey" in column && column.accessorKey === "updated_at"
        );

        expect(actionBy?.meta?.className).toContain("min-w-[150px]");
        expect(date?.meta?.className).toContain("min-w-[150px]");
    });
});
