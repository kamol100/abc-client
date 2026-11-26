import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FormFilter from "@/components/form-wrapper/form-filter";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

// The calendar opens on the current month. Hold the date in October 2026 so the
// days these tests click are always on screen. Only Date is faked; timers stay real.
beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 15, 12, 0, 0));
});

afterEach(() => {
    vi.useRealTimers();
});

const createDateField: FieldConfig = {
    type: "dateRange",
    name: "create_date",
    placeholder: "invoice.filter.create_date",
    closeOnSelectDate: false,
};

const october21 = /October 21st, 2026/;
const october23 = /October 23rd, 2026/;

describe("filter date range closeOnSelectDate", () => {
    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps the calendar open after a completed range»।
    it("Filter date range close: keeps the calendar open after a completed range", async () => {
        const user = userEvent.setup({ skipHover: true });
        render(
            <FormFilter
                formSchema={[createDateField]}
                forceOpen
                hideTrigger
            />,
        );

        await user.click(screen.getByRole("button", { name: "invoice.filter.create_date" }));
        await user.click(screen.getByRole("button", { name: october21 }));
        await user.click(screen.getByRole("button", { name: october23 }));

        expect(screen.getByRole("button", { name: october23 })).toBeInTheDocument();
    });
});
