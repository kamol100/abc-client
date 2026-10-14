import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import DatePicker from "@/components/form/DatePicker";
import { useFilterForm } from "@/hooks/use-filter-form";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: "en" },
    }),
}));

const expenseDateField: FieldConfig = {
    type: "dateRange",
    name: "expense_date",
    placeholder: "expense.expense_date.label",
};

function ExpenseDateFilter({ onFilter }: { onFilter: (query: string) => void }) {
    const filterForm = useFilterForm({
        formSchema: [expenseDateField],
        setFilter: onFilter,
    });

    return (
        <FormProvider {...filterForm.form}>
            <DatePicker
                name="expense_date"
                mode="range"
                placeholder="expense.expense_date.label"
                onValueChange={filterForm.triggerSubmit}
            />
        </FormProvider>
    );
}

describe("DatePicker clear", () => {
    it("hides the clear button until a date is selected", () => {
        render(<ExpenseDateFilter onFilter={vi.fn()} />);

        expect(screen.queryByRole("button", { name: "common.clear" })).not.toBeInTheDocument();
    });

    it("clears a selected range and submits the filter without that date", async () => {
        const user = userEvent.setup();
        const onFilter = vi.fn();
        render(<ExpenseDateFilter onFilter={onFilter} />);

        await user.click(screen.getByRole("button", { name: "expense.expense_date.label" }));
        await user.click(screen.getByRole("button", { name: "Wednesday, October 21st, 2026" }));

        await waitFor(() => {
            expect(onFilter).toHaveBeenCalled();
        });
        expect(String(onFilter.mock.lastCall?.[0])).toContain("expense_date=2026-10-21");
        expect(String(onFilter.mock.lastCall?.[0])).not.toContain("2026-10-20");

        await user.click(screen.getByRole("button", { name: "common.clear" }));

        await waitFor(() => {
            expect(String(onFilter.mock.lastCall?.[0])).not.toContain("expense_date");
        });
        expect(screen.queryByRole("button", { name: "common.clear" })).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: "expense.expense_date.label" })).toBeInTheDocument();
    });

    it("shows the clear button after only the start date is selected", async () => {
        const user = userEvent.setup();
        render(<ExpenseDateFilter onFilter={vi.fn()} />);

        await user.click(screen.getByRole("button", { name: "expense.expense_date.label" }));
        await user.click(screen.getByRole("button", { name: "Wednesday, October 21st, 2026" }));

        expect(screen.getByRole("button", { name: "common.clear" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "10/21/2026" })).toBeInTheDocument();
    });
});
