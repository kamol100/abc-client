import { FormFieldConfig } from "../form-wrapper/form-builder-type";

export const SalaryFormFieldSchema = (): FormFieldConfig[] => {
  return [
    {
      type: "dropdown",
      name: "salary_type",
      label: { labelText: "salary.salary_type.label", mandatory: true },
      placeholder: "salary.salary_type.label",
      options: [
        { value: "monthly", label: "common.monthly" },
        { value: "advance", label: "common.advance" },
      ],
    },
    {
      type: "dropdown",
      name: "fund_id",
      label: { labelText: "salary.fund.label", mandatory: true },
      placeholder: "salary.fund.placeholder",
      api: "/dropdown-funds",
      valueKey: "fund",
      valueMapping: { idKey: "id", labelKey: "name" },
    },
    {
      type: "dropdown",
      name: "staff_id",
      label: { labelText: "salary.staff.label", mandatory: true },
      placeholder: "salary.staff.placeholder",
      api: "/dropdown-staffs",
      valueKey: "staff",
      valueMapping: { idKey: "id", labelKey: "name" },
    },
    {
      type: "date",
      name: "date",
      label: { labelText: "common.date" },
      placeholder: "salary.date.placeholder",
    },
    {
      type: "dropdown",
      name: "status",
      label: { labelText: "common.status", mandatory: true },
      placeholder: "salary.status.placeholder",
      options: [
        { value: "pending", label: "common.pending" },
        { value: "paid", label: "common.paid" },
        { value: "approved", label: "common.approved" },
        { value: "cancelled", label: "common.cancelled" },
        { value: "repay", label: "common.repay" },
      ],
    },
    {
      type: "number",
      name: "amount",
      label: { labelText: "salary.amount.label", mandatory: true },
      placeholder: "salary.amount.placeholder",
    },
    {
      type: "fieldArray",
      name: "salary_items",
      label: { labelText: "common.salary_and_allowance" },
      minItems: 1,
      grids: 2,
      addButtonLabel: "common.add_item",
      defaultItem: { items_label: "", items_value: 0 },
      itemFields: [
        {
          type: "text",
          name: "items_label",
          label: { labelText: "common.label" },
          placeholder: "common.label",
        },
        {
          type: "number",
          name: "items_value",
          label: { labelText: "common.value" },
          placeholder: "0",
        },
      ],
    },
    {
      type: "fieldArray",
      name: "salary_deductions",
      label: { labelText: "common.salary_deductions" },
      minItems: 0,
      grids: 2,
      addButtonLabel: "common.add_deduction",
      defaultItem: { deductions_label: "", deductions_value: 0 },
      itemFields: [
        {
          type: "text",
          name: "deductions_label",
          label: { labelText: "common.label" },
          placeholder: "common.label",
        },
        {
          type: "number",
          name: "deductions_value",
          label: { labelText: "common.value" },
          placeholder: "0",
        },
      ],
    },
    {
      type: "textarea",
      name: "note",
      label: { labelText: "common.note" },
      placeholder: "common.optional_note",
      rows: 2,
    },
  ];
};

export default SalaryFormFieldSchema;
