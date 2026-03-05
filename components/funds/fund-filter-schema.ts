import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const FundFilterSchema = (): FieldConfig[] => {
  return [
    {
      type: "text",
      name: "name",
      placeholder: "fund.name.placeholder",
      watchForFilter: true,
    },
    {
      type: "text",
      name: "account_number",
      placeholder: "fund.account_number.placeholder",
      watchForFilter: true,
    },
    {
      type: "dropdown",
      name: "staff_id",
      placeholder: "fund.staff.placeholder",
      api: "/dropdown-staffs",
      isClearable: true,
    },
  ];
};

export default FundFilterSchema;
