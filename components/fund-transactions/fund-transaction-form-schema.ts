import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const FundTransactionFormFieldSchema = (): FieldConfig[] => {

  return [
    {
      type: "dropdown",
      name: "transaction_type",
      label: {
        labelText: "fund_transaction.transaction_type.label",
        mandatory: true,
      },
      placeholder: "fund_transaction.transaction_type.placeholder",
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
        {
          value: "expense",
          label: "fund_transaction.transaction_type.options.expense",
        },
        {
          value: "salary",
          label: "fund_transaction.transaction_type.options.salary",
        },
      ],
      isClearable: false,
      isSearchable: false,
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
      type: "dropdown",
      name: "transfer_by",
      label: {
        labelText: "fund_transaction.transfer_by.label",
      },
      placeholder: "fund_transaction.transfer_by.placeholder",
      api: "/dropdown-funds",
      isClearable: true,
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
