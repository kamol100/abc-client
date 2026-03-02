import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";
import { FormFieldConfig } from "../form-wrapper/form-builder-type";

export const ExpenseFormFieldSchema = (): FormFieldConfig[] => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();

    return [
        {
            type: "number",
            name: "amount",
            label: { labelText: t("expense.amount.label"), mandatory: true },
            placeholder: t("expense.amount.placeholder"),
        },
        {
            type: "dropdown",
            name: "staff_id",
            label: { labelText: t("expense.staff.label"), mandatory: true },
            placeholder: t("expense.staff.placeholder"),
            api: "/dropdown-staffs",
            valueKey: "staff",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "fund_id",
            label: { labelText: t("expense.fund.label") },
            placeholder: t("expense.fund.placeholder"),
            api: "/dropdown-funds",
            valueKey: "fund",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "expense_type_id",
            label: { labelText: t("expense.expense_type.label"), mandatory: true },
            placeholder: t("expense.expense_type.placeholder"),
            api: "/dropdown-expense-types",
            valueKey: "expenseType",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "zone_id",
            label: { labelText: t("expense.zone.label") },
            placeholder: t("expense.zone.placeholder"),
            api: "/dropdown-zones",
            valueKey: "zone",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "text",
            name: "voucher",
            label: { labelText: t("expense.voucher.label") },
            placeholder: t("expense.voucher.placeholder"),
        },
        {
            type: "date",
            name: "expense_date",
            label: { labelText: t("expense.expense_date.label") },
            placeholder: t("expense.expense_date.placeholder"),
        },
        {
            type: "dropdown",
            name: "status",
            label: { labelText: t("common.status") },
            placeholder: t("expense.status.placeholder"),
            permission: hasPermission("expenses.approval"),
            options: [
                { value: "pending", label: t("common.pending") },
                { value: "approved", label: t("common.approved") },
                { value: "declined", label: t("expense.declined") },
            ],
        },
        {
            type: "textarea",
            name: "note",
            label: { labelText: t("common.note") },
            placeholder: t("common.optional_note"),
            rows: 2,
        },
    ];
};

export default ExpenseFormFieldSchema;
