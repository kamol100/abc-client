import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const FundTransactionFilterSchema = (
  includeFundFilter = true
): FieldConfig[] => {
  const filters: FieldConfig[] = [
    {
      type: "text",
      name: "created_at",
      placeholder: "fund_transaction.created_at.placeholder",
      watchForFilter: true,
    },
    {
      type: "dropdown",
      name: "transaction_type",
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
      isClearable: true,
      isSearchable: false,
    },
  ];

  if (includeFundFilter) {
    filters.splice(1, 0, {
      type: "dropdown",
      name: "fund_id",
      placeholder: "fund_transaction.fund.placeholder",
      api: "/dropdown-funds",
      isClearable: true,
    });
  }

  return filters;
};

export default FundTransactionFilterSchema;
