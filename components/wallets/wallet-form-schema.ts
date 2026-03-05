import { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";

export const WalletFormSchema = (): FormFieldConfig[] => [
  {
    type: "number",
    name: "balance",
    label: { labelText: "wallet.amount.label", mandatory: true },
    placeholder: "wallet.amount.placeholder",
  },
];

export const ClientWalletFormSchema = (): FormFieldConfig[] => [
  {
    type: "dropdown",
    name: "client_id",
    label: { labelText: "wallet.client.label", mandatory: true },
    placeholder: "wallet.client.placeholder",
    api: "/dropdown-clients",
    isClearable: false,
    isSearchable: true,
  },
  {
    type: "number",
    name: "balance",
    label: { labelText: "wallet.amount.label", mandatory: true },
    placeholder: "wallet.amount.placeholder",
  },
  {
    type: "textarea",
    name: "note",
    label: { labelText: "wallet.note.label" },
    placeholder: "wallet.note.placeholder",
    rows: 2,
  },
];
