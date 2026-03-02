import { useTranslation } from "react-i18next";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const ExpenseFilterSchema = (): FieldConfig[] => {
    const { t } = useTranslation();

    return [
        {
            type: "text",
            name: "voucher",
            placeholder: t("expense.voucher.label"),
            watchForFilter: true,
        },
        {
            type: "dateRange",
            name: "expense_date",
            placeholder: t("expense.expense_date.label"),
        },
        {
            type: "dropdown",
            name: "staff_id",
            placeholder: t("expense.staff.label"),
            api: "/dropdown-staffs",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "zone_id",
            placeholder: t("zone.name.label"),
            api: "/dropdown-zones",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "fund_id",
            placeholder: t("expense.fund.label"),
            api: "/dropdown-funds",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "expense_type_id",
            placeholder: t("expense.expense_type.label"),
            api: "/dropdown-expense-types",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "status",
            placeholder: t("common.status"),
            options: [
                { value: "approved", label: t("common.approved") },
                { value: "pending", label: t("common.pending") },
                { value: "declined", label: t("expense.declined") },
            ],
        },
    ];
};

export default ExpenseFilterSchema;
