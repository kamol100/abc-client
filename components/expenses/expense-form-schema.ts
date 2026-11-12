import { useTranslation } from "react-i18next";
import { type ExpenseFundAccess } from "@/components/expenses/expense-fund-access";
import { EXPENSE_STATUS_OPTIONS } from "@/components/expenses/expense-type";
import { DropdownFieldConfig, FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import { usePermissions } from "@/context/app-provider";

const fundField = (
    mode: "create" | "edit",
    fundAccess: ExpenseFundAccess,
    label: string,
    placeholder: string,
): DropdownFieldConfig => {
    const lockedOption =
        fundAccess.assignedFundId == null
            ? []
            : [{
                value: fundAccess.assignedFundId,
                label: fundAccess.assignedFundName || String(fundAccess.assignedFundId),
            }];

    return {
        type: "dropdown",
        name: "fund_id",
        label: { labelText: label },
        placeholder,
        valueKey: "fund",
        valueMapping: { idKey: "id", labelKey: "name" },
        isDisabled: fundAccess.lockFund,
        isClearable: !fundAccess.lockFund,
        ...(fundAccess.lockFund
            ? { options: lockedOption }
            : { api: "/dropdown-funds" }),
        ...(mode === "create" && fundAccess.assignedFundId != null
            ? { defaultValue: fundAccess.assignedFundId }
            : {}),
    };
};

export const ExpenseFormFieldSchema = ({
    mode,
    fundAccess,
}: {
    mode: "create" | "edit";
    fundAccess: ExpenseFundAccess;
}): FormFieldConfig[] => {
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
        fundField(
            mode,
            fundAccess,
            t("expense.fund.label"),
            t("expense.fund.placeholder"),
        ),
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
            options: EXPENSE_STATUS_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.label),
            })),
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
