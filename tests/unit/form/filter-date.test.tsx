import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { useFilterForm } from "@/hooks/use-filter-form";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

const october14 = new Date(2026, 9, 14);
const october16 = new Date(2026, 9, 16);

const fields: FieldConfig[] = [
    { type: "date", name: "single_date", placeholder: "single" },
    { type: "dateRange", name: "expense_date", placeholder: "range" },
];

function localDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

function DateFilter({
    onFilter,
    singleDate,
    expenseDate,
}: {
    onFilter: (query: string) => void;
    singleDate?: Date;
    expenseDate?: { from: Date; to: Date };
}) {
    const filterForm = useFilterForm({ formSchema: fields, setFilter: onFilter });

    return (
        <FormProvider {...filterForm.form}>
            <button
                type="button"
                onClick={() => {
                    if (singleDate) filterForm.form.setValue("single_date", singleDate);
                    if (expenseDate) filterForm.form.setValue("expense_date", expenseDate);
                    filterForm.triggerSubmit();
                }}
            >
                apply
            </button>
        </FormProvider>
    );
}

describe("filter date query", () => {
    it("keeps a selected day when building the API date", async () => {
        const user = userEvent.setup();
        const onFilter = vi.fn();
        render(<DateFilter onFilter={onFilter} singleDate={october14} />);

        await user.click(screen.getByRole("button", { name: "apply" }));

        await waitFor(() => {
            expect(onFilter).toHaveBeenCalledWith(`single_date=${localDate(october14)}`);
        });
    });

    it("serializes a date range with both local calendar days", async () => {
        const user = userEvent.setup();
        const onFilter = vi.fn();
        render(
            <DateFilter
                onFilter={onFilter}
                expenseDate={{ from: october14, to: october16 }}
            />,
        );

        await user.click(screen.getByRole("button", { name: "apply" }));

        await waitFor(() => {
            expect(onFilter).toHaveBeenCalledWith(
                `expense_date=${localDate(october14)},${localDate(october16)}`,
            );
        });
    });

    it("keeps the same start and end date without shifting either day", async () => {
        const user = userEvent.setup();
        const onFilter = vi.fn();
        render(
            <DateFilter
                onFilter={onFilter}
                expenseDate={{ from: october14, to: october14 }}
            />,
        );

        await user.click(screen.getByRole("button", { name: "apply" }));

        await waitFor(() => {
            expect(onFilter).toHaveBeenCalledWith(
                `expense_date=${localDate(october14)},${localDate(october14)}`,
            );
        });
    });
});
