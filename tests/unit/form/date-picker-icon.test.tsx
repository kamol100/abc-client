import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import DatePicker from "@/components/form/DatePicker";
import type { DatePickerValue } from "@/components/form/DatePicker";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

const october21 = new Date(2026, 9, 21);
const october22 = new Date(2026, 9, 22);

function DateField({
    value,
    mode = "range",
    hide_calendar_icon_on_date_range,
}: {
    value?: DatePickerValue | string;
    mode?: "single" | "range";
    hide_calendar_icon_on_date_range?: boolean;
}) {
    const form = useForm({ defaultValues: { expense_date: value } });

    return (
        <FormProvider {...form}>
            <DatePicker
                name="expense_date"
                mode={mode}
                placeholder="expense.expense_date.label"
                hide_calendar_icon_on_date_range={hide_calendar_icon_on_date_range}
            />
        </FormProvider>
    );
}

const calendarIcon = () => document.querySelector(".lucide-calendar");

describe("DatePicker calendar icon", () => {
    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps the icon for a single selected date»।
    it("Date picker icon: keeps the icon for a single selected date", () => {
        const { container } = render(<DateField value={october21} mode="single" />);

        expect(calendarIcon()).toBeInTheDocument();
        expect(container.querySelector(".truncate")).toHaveClass("truncate");
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps the icon when only the range start date is selected»।
    it("Date picker icon: keeps the icon when only the range start date is selected", () => {
        render(<DateField value={{ from: october21 }} />);

        expect(calendarIcon()).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "10/21/2026" })).toBeInTheDocument();
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «hides the icon by default when a date range is selected»।
    it("Date picker icon: hides the icon by default when a date range is selected", () => {
        render(<DateField value={{ from: october21, to: october22 }} />);

        expect(calendarIcon()).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "10/21/2026 - 10/22/2026" })).toHaveClass("overflow-hidden");
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows a date-only API string on the same calendar day»।
    it("Date picker icon: shows a date-only API string on the same calendar day", () => {
        render(<DateField value="2026-10-14" mode="single" />);

        expect(screen.getByRole("button", { name: "10/14/2026" })).toBeInTheDocument();
    });

    // ফর্মের ইনপুট ও অবস্থা যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps the icon for a date range when hide_calendar_icon_on_date_range is false»।
    it("Date picker icon: keeps the icon for a date range when hide_calendar_icon_on_date_range is false", () => {
        render(
            <DateField
                value={{ from: october21, to: october22 }}
                hide_calendar_icon_on_date_range={false}
            />,
        );

        expect(calendarIcon()).toBeInTheDocument();
    });
});
