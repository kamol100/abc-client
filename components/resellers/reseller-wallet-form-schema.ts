import type { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";

const ResellerWalletFormFieldSchema = (): FormFieldConfig[] => [
  {
    type: "number",
    name: "balance",
    label: {
      labelText: "reseller.wallet_recharge.balance.label",
      mandatory: true,
    },
    placeholder: "reseller.wallet_recharge.balance.placeholder",
  },
  {
    type: "textarea",
    name: "note",
    label: {
      labelText: "wallet.note.label",
    },
    placeholder: "wallet.note.placeholder",
    rows: 2,
  },
];

export default ResellerWalletFormFieldSchema;
