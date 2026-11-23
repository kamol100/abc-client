import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

/** Staff with a remaining bKash amount: `{ id, name, amount }`. */
export const BKASH_STAFF_BALANCES_API = "/dropdown-bkash-staff-balances";

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
      populate: [
        { field: "sender_name", from: "name" },
        { field: "sender_balance", from: "balance" },
        { field: "sender_uuid", from: "uuid" },
      ],
    },
    {
      // Shown only when the sender is the bKash fund (see the form).
      type: "dropdown",
      name: "transaction_by",
      label: {
        labelText: "fund_transaction.transaction_by.label",
      },
      placeholder: "fund_transaction.transaction_by.placeholder",
      api: BKASH_STAFF_BALANCES_API,
      isClearable: true,
      populate: [{ field: "transaction_by_amount", from: "amount" }],
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
