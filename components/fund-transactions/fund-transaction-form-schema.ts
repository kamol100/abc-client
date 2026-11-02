import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

const transferFundApi = (excludeFundId?: string | number | null) => {
  if (excludeFundId === undefined || excludeFundId === null || excludeFundId === "") {
    return "/dropdown-funds";
  }

  return `/dropdown-funds?filter=${encodeURIComponent(String(excludeFundId))}`;
};

export const FundTransactionFormFieldSchema = (
  excludeFundId?: string | number | null,
): FieldConfig[] => [
    {
      type: "dropdown",
      name: "transfer_by",
      label: {
        labelText: "fund_transaction.transfer_by.label",
        mandatory: true,
      },
      placeholder: "fund_transaction.transfer_by.placeholder",
      api: transferFundApi(excludeFundId),
      isClearable: true,
    },
    {
      type: "number",
      name: "amount",
      label: {
        labelText: "fund_transaction.amount.label",
        mandatory: true,
      },
      placeholder: "fund_transaction.amount.placeholder",
    },
    {
      type: "textarea",
      name: "note",
      label: {
        labelText: "fund_transaction.note.label",
      },
      placeholder: "fund_transaction.note.placeholder",
      rows: 3,
    },
  ];

export default FundTransactionFormFieldSchema;
