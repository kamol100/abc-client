import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import DatePicker from "@/components/form/DatePicker";
import type { DatePickerValue } from "@/components/form/DatePicker";
import { useFilterForm } from "@/hooks/use-filter-form";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

const dueDateField: FieldConfig = {
    type: "dateRange",
    name: "due_date",
    placeholder: "invoice.filter.due_date",
};

const october21 = /October 21st, 2026/;
const october22 = /October 22nd, 2026/;
const october23 = /October 23rd, 2026/;
const october24 = /October 24th, 2026/;

function rangeCalendar() {
    const calendar = screen.getByRole("button", { name: october21 }).closest("[data-slot='range-calendar']");
    if (!(calendar instanceof HTMLElement)) {
        throw new Error("Range calendar container was not found");
    }
    return calendar;
}

async function pickDay(user: ReturnType<typeof userEvent.setup>, name: RegExp) {
    await user.click(screen.getByRole("button", { name }));
}

function DueDateFilter({ onFilter }: { onFilter: (query: string) => void }) {
    const filterForm = useFilterForm({
        formSchema: [dueDateField],
        setFilter: onFilter,
    });

    return (
        <FormProvider {...filterForm.form}>
            <DatePicker
                name="due_date"
                mode="range"
                placeholder="invoice.filter.due_date"
                onValueChange={filterForm.triggerSubmit}
            />
        </FormProvider>
    );
}

function StickyRangeField() {
    const form = useForm({
        defaultValues: { due_date: undefined as { from?: Date; to?: Date } | undefined },
    });

    return (
        <FormProvider {...form}>
            <DatePicker
                name="due_date"
                mode="range"
                placeholder="due_date"
                closeOnSelectDate={false}
            />
        </FormProvider>
    );
}

function SingleDateField({ onValueChange }: { onValueChange: (value: DatePickerValue) => void }) {
    const form = useForm({ defaultValues: { payment_date: undefined as Date | undefined } });

    return (
        <FormProvider {...form}>
            <DatePicker
                name="payment_date"
                mode="single"
                placeholder="payment_date"
                onValueChange={onValueChange}
            />
        </FormProvider>
    );
}

describe("DatePicker range selection", () => {
    it("keeps a single selected day open until Apply", async () => {
        const user = userEvent.setup({ skipHover: true });
        const onFilter = vi.fn();
        render(<DueDateFilter onFilter={onFilter} />);

        await user.click(screen.getByRole("button", { name: "invoice.filter.due_date" }));
        expect(screen.getByRole("button", { name: "common.apply" })).toBeDisabled();

        await pickDay(user, october21);

        expect(screen.getByRole("button", { name: october21 })).toHaveAttribute("data-selected-single", "true");
        expect(screen.getByRole("button", { name: "common.apply" })).toBeEnabled();
        expect(onFilter).not.toHaveBeenCalled();

        await user.click(screen.getByRole("button", { name: "common.apply" }));

        await waitFor(() => {
            expect(onFilter).toHaveBeenCalledWith("due_date=2026-10-21,2026-10-21");
        });
        expect(screen.queryByRole("button", { name: october21 })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "10/21/2026" })).toBeInTheDocument();
    });

    it("applies a completed range without waiting for Apply", async () => {
        const user = userEvent.setup({ skipHover: true });
        const onFilter = vi.fn();
        render(<DueDateFilter onFilter={onFilter} />);

        await user.click(screen.getByRole("button", { name: "invoice.filter.due_date" }));
        await pickDay(user, october21);
        await user.hover(screen.getByRole("button", { name: october23 }));
        await pickDay(user, october23);

        await waitFor(() => {
            expect(onFilter).toHaveBeenCalledWith("due_date=2026-10-21,2026-10-23");
        });
        expect(screen.queryByRole("button", { name: october23 })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "10/21/2026 - 10/23/2026" })).toBeInTheDocument();
    });

    it("highlights the start, middle, and end of a selected range", async () => {
        const user = userEvent.setup({ skipHover: true });
        render(<DueDateFilter onFilter={vi.fn()} />);

        await user.click(screen.getByRole("button", { name: "invoice.filter.due_date" }));
        await pickDay(user, october21);
        await user.hover(screen.getByRole("button", { name: october23 }));

        expect(screen.getByRole("button", { name: october22 }).closest("td")).toHaveClass("range-preview-middle");
        expect(screen.getByRole("button", { name: october23 }).closest("td")).toHaveClass("range-preview-edge");

        await pickDay(user, october23);
        await user.click(screen.getByRole("button", { name: "10/21/2026 - 10/23/2026" }));

        const start = screen.getByRole("button", { name: october21 });
        const middle = screen.getByRole("button", { name: october22 });
        const end = screen.getByRole("button", { name: october23 });

        expect(start).toHaveAttribute("data-range-start", "true");
        expect(start.className).toContain("data-[range-start=true]:bg-primary");
        expect(middle).toHaveAttribute("data-range-middle", "true");
        expect(middle.className).toContain("data-[range-middle=true]:bg-accent");
        expect(middle.closest("td")).toHaveClass("bg-accent");
        expect(end).toHaveAttribute("data-range-end", "true");
        expect(end.className).toContain("data-[range-end=true]:bg-primary");
    });

    it("clears the hover preview when the pointer leaves the calendar", async () => {
        const user = userEvent.setup({ skipHover: true });
        render(<DueDateFilter onFilter={vi.fn()} />);

        await user.click(screen.getByRole("button", { name: "invoice.filter.due_date" }));
        await pickDay(user, october21);
        await user.hover(screen.getByRole("button", { name: october23 }));

        expect(screen.getByRole("button", { name: october22 }).closest("td")).toHaveClass("range-preview-middle");

        fireEvent.mouseLeave(rangeCalendar(), { relatedTarget: document.body });

        expect(screen.getByRole("button", { name: october22 }).closest("td")).not.toHaveClass("range-preview-middle");
        expect(screen.getByRole("button", { name: october23 }).closest("td")).not.toHaveClass("range-preview-edge");
        expect(screen.getByRole("button", { name: october21 })).toHaveAttribute("data-selected-single", "true");
    });

    it("clears the hover preview on Apply and commits only the selected day", async () => {
        const user = userEvent.setup({ skipHover: true });
        const onFilter = vi.fn();
        render(<DueDateFilter onFilter={onFilter} />);

        await user.click(screen.getByRole("button", { name: "invoice.filter.due_date" }));
        await pickDay(user, october21);
        await user.hover(screen.getByRole("button", { name: october23 }));

        await user.hover(screen.getByRole("button", { name: "common.apply" }));

        expect(screen.getByRole("button", { name: october22 }).closest("td")).not.toHaveClass("range-preview-middle");
        expect(screen.getByRole("button", { name: october21 })).toHaveAttribute("data-selected-single", "true");

        await user.click(screen.getByRole("button", { name: "common.apply" }));

        await waitFor(() => {
            expect(onFilter).toHaveBeenCalledWith("due_date=2026-10-21,2026-10-21");
        });
    });

    it("keeps the hover preview while moving between calendar days", async () => {
        const user = userEvent.setup({ skipHover: true });
        render(<DueDateFilter onFilter={vi.fn()} />);

        await user.click(screen.getByRole("button", { name: "invoice.filter.due_date" }));
        await pickDay(user, october21);
        await user.hover(screen.getByRole("button", { name: october23 }));
        await user.hover(screen.getByRole("button", { name: october24 }));

        expect(screen.getByRole("button", { name: october22 }).closest("td")).toHaveClass("range-preview-middle");
        expect(screen.getByRole("button", { name: october23 }).closest("td")).toHaveClass("range-preview-middle");
        expect(screen.getByRole("button", { name: october24 }).closest("td")).toHaveClass("range-preview-edge");
    });

    it("keeps a completed range highlighted after the pointer leaves", async () => {
        const user = userEvent.setup({ skipHover: true });
        render(<StickyRangeField />);

        await user.click(screen.getByRole("button", { name: "due_date" }));
        await pickDay(user, october21);
        await pickDay(user, october23);

        fireEvent.mouseLeave(rangeCalendar(), { relatedTarget: document.body });
        await user.hover(screen.getByRole("button", { name: "common.apply" }));

        expect(screen.getByRole("button", { name: october21 })).toHaveAttribute("data-range-start", "true");
        expect(screen.getByRole("button", { name: october22 })).toHaveAttribute("data-range-middle", "true");
        expect(screen.getByRole("button", { name: october23 })).toHaveAttribute("data-range-end", "true");
        expect(screen.getByRole("button", { name: october22 }).closest("td")).not.toHaveClass("range-preview-middle");
    });

    it("does not show Apply or delay a single-date selection", async () => {
        const user = userEvent.setup({ skipHover: true });
        const onValueChange = vi.fn();
        render(<SingleDateField onValueChange={onValueChange} />);

        await user.click(screen.getByRole("button", { name: "payment_date" }));
        expect(screen.queryByRole("button", { name: "common.apply" })).not.toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: october21 }));

        expect(onValueChange).toHaveBeenCalledTimes(1);
        expect(onValueChange.mock.calls[0]?.[0]).toBeInstanceOf(Date);
        expect(screen.queryByRole("button", { name: october21 })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "10/21/2026" })).toBeInTheDocument();
    });
});
