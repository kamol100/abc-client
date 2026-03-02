import { useTranslation } from "react-i18next";
import { FormFieldConfig } from "../form-wrapper/form-builder-type";

export const SalaryFormFieldSchema = (): FormFieldConfig[] => {
  const { t } = useTranslation();

  return [
    {
      type: "dropdown",
      name: "salary_type",
      label: { labelText: t("salary.salary_type.label"), mandatory: true },
      placeholder: t("salary.salary_type.label"),
      options: [
        { value: "monthly", label: t("common.monthly") },
        { value: "advance", label: t("common.advance") },
      ],
    },
    {
      type: "dropdown",
      name: "fund_id",
      label: { labelText: t("salary.fund.label"), mandatory: true },
      placeholder: t("salary.fund.placeholder"),
      api: "/dropdown-funds",
      valueKey: "fund",
      valueMapping: { idKey: "id", labelKey: "name" },
    },
    {
      type: "dropdown",
      name: "staff_id",
      label: { labelText: t("salary.staff.label"), mandatory: true },
      placeholder: t("salary.staff.placeholder"),
      api: "/dropdown-staffs",
      valueKey: "staff",
      valueMapping: { idKey: "id", labelKey: "name" },
    },
    {
      type: "date",
      name: "date",
      label: { labelText: t("common.date") },
      placeholder: t("salary.date.placeholder"),
    },
    {
      type: "dropdown",
      name: "status",
      label: { labelText: t("common.status"), mandatory: true },
      placeholder: t("salary.status.placeholder"),
      options: [
        { value: "pending", label: t("common.pending") },
        { value: "paid", label: t("common.paid") },
        { value: "approved", label: t("common.approved") },
        { value: "cancelled", label: t("common.cancelled") },
        { value: "repay", label: t("common.repay") },
      ],
    },
    {
      type: "number",
      name: "amount",
      label: { labelText: t("salary.amount.label"), mandatory: true },
      placeholder: t("salary.amount.placeholder"),
    },
    {
      type: "fieldArray",
      name: "salary_items",
      label: { labelText: t("common.salary_and_allowance") },
      minItems: 1,
      grids: 2,
      addButtonLabel: t("common.add_item"),
      defaultItem: { items_label: "", items_value: 0 },
      itemFields: [
        {
          type: "text",
          name: "items_label",
          label: { labelText: t("common.label") },
          placeholder: t("common.label"),
        },
        {
          type: "number",
          name: "items_value",
          label: { labelText: t("common.value") },
          placeholder: "0",
        },
      ],
    },
    {
      type: "fieldArray",
      name: "salary_deductions",
      label: { labelText: t("common.salary_deductions") },
      minItems: 0,
      grids: 2,
      addButtonLabel: t("common.add_deduction"),
      defaultItem: { deductions_label: "", deductions_value: 0 },
      itemFields: [
        {
          type: "text",
          name: "deductions_label",
          label: { labelText: t("common.label") },
          placeholder: t("common.label"),
        },
        {
          type: "number",
          name: "deductions_value",
          label: { labelText: t("common.value") },
          placeholder: "0",
        },
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

export default SalaryFormFieldSchema;
