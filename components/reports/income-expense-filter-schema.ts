import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const IncomeExpenseFilterSchema = (): FieldConfig[] => {
    return [
        {
            type: "dateRange",
            name: "create_date",
            placeholder: "income_expense.create_date.label",
        },
    ];
};

export default IncomeExpenseFilterSchema;
