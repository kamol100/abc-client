import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

const transferFundApi = (excludeFundId?: string | number | null) => {
  if (excludeFundId === undefined || excludeFundId === null || excludeFundId === "") {
    return "/dropdown-funds";
  }

  return `/dropdown-funds?filter=${encodeURIComponent(String(excludeFundId))}`;
};

const transactionTypeField = (): FieldConfig => ({
  type: "dropdown",
  name: "transaction_type",
  label: {
    labelText: "fund_transaction.transaction_type.label",
    mandatory: true,
  },
  placeholder: "fund_transaction.transaction_type.placeholder",
  defaultValue: "transfer",
  options: [
    {
      value: "deposit",
      label: "fund_transaction.transaction_type.options.deposit",
    },
    {
      value: "transfer",
      label: "fund_transaction.transaction_type.options.transfer",
    },
    {
      value: "withdraw",
      label: "fund_transaction.transaction_type.options.withdraw",
    },
  ],
  isClearable: false,
  isSearchable: false,
});

export const FundTransactionFormFieldSchema = (
  excludeFundId?: string | number | null,
  options?: { showTransactionType?: boolean }
): FieldConfig[] => {
  const showTransactionType = options?.showTransactionType !== false;

  return [
    ...(showTransactionType ? [transactionTypeField()] : []),
    {
      type: "dropdown",
      name: "transfer_by",
      label: {
        labelText: "fund_transaction.transfer_by.label",
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
};

export default FundTransactionFormFieldSchema;
