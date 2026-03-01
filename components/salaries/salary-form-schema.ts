import { useTranslation } from "react-i18next";
import { FormFieldConfig } from "../form-wrapper/form-builder-type";

export const SalaryFormFieldSchema = (): FormFieldConfig[] => {
  const { t } = useTranslation();

  return [
    {
      type: "dropdown",
      name: "salary_type",
      label: { labelText: t("salary_type"), mandatory: true },
      placeholder: t("salary_type"),
      options: [
        { value: "monthly", label: t("monthly") },
        { value: "advance", label: t("advance") },
      ],
    },
    {
      type: "dropdown",
      name: "fund_id",
      label: { labelText: t("fund"), mandatory: true },
      placeholder: t("fund"),
      api: "/dropdown-funds",
      valueKey: "fund",
      valueMapping: { idKey: "id", labelKey: "name" },
    },
    {
      type: "dropdown",
      name: "staff_id",
      label: { labelText: t("staff"), mandatory: true },
      placeholder: t("staff"),
      api: "/dropdown-staffs",
      valueKey: "staff",
      valueMapping: { idKey: "id", labelKey: "name" },
    },
    {
      type: "date",
      name: "date",
      label: { labelText: t("date") },
      placeholder: t("date"),
    },
    {
      type: "dropdown",
      name: "status",
      label: { labelText: t("status"), mandatory: true },
      placeholder: t("status"),
      options: [
        { value: "pending", label: t("pending") },
        { value: "paid", label: t("paid") },
        { value: "approved", label: t("approved") },
        { value: "cancelled", label: t("cancelled") },
        { value: "repay", label: t("repay") },
      ],
    },
    {
      type: "number",
      name: "amount",
      label: { labelText: t("amount"), mandatory: true },
      placeholder: t("enter_amount"),
    },
    {
      type: "fieldArray",
      name: "salary_items",
      label: { labelText: t("salary_and_allowance") },
      minItems: 1,
      grids: 2,
      addButtonLabel: t("add_item"),
      defaultItem: { items_label: "", items_value: 0 },
      itemFields: [
        {
          type: "text",
          name: "items_label",
          label: { labelText: t("label") },
          placeholder: t("label"),
        },
        {
          type: "number",
          name: "items_value",
          label: { labelText: t("value") },
          placeholder: "0",
        },
      ],
    },
    {
      type: "fieldArray",
      name: "salary_deductions",
      label: { labelText: t("salary_deductions") },
      minItems: 0,
      grids: 2,
      addButtonLabel: t("add_deduction"),
      defaultItem: { deductions_label: "", deductions_value: 0 },
      itemFields: [
        {
          type: "text",
          name: "deductions_label",
          label: { labelText: t("label") },
          placeholder: t("label"),
        },
        {
          type: "number",
          name: "deductions_value",
          label: { labelText: t("value") },
          placeholder: "0",
        },
      ],
    },
    {
      type: "textarea",
      name: "note",
      label: { labelText: t("note") },
      placeholder: t("optional_note"),
      rows: 2,
    },
  ];
};

export default SalaryFormFieldSchema;
