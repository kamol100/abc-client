import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const ExpenseFilterSchema = (): FieldConfig[] => {
    return [
        {
            type: "text",
            name: "voucher",
            placeholder: "expense.voucher.label",
            watchForFilter: true,
        },
        {
            type: "dateRange",
            name: "expense_date",
            placeholder: "expense.expense_date.label",
        },
        {
            type: "dropdown",
            name: "staff_id",
            placeholder: "expense.staff.label",
            api: "/dropdown-staffs",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "zone_id",
            placeholder: "zone.name.label",
            api: "/dropdown-zones",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "fund_id",
            placeholder: "expense.fund.placeholder",
            api: "/dropdown-funds",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "expense_type_id",
            placeholder: "expense.expense_type.placeholder",
            api: "/dropdown-expense-types",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "status",
            placeholder: "common.status",
            options: [
                { value: "approved", label: "common.approved" },
                { value: "pending", label: "common.pending" },
                { value: "declined", label: "expense.declined" },
            ],
        },
    ];
};

export default ExpenseFilterSchema;
