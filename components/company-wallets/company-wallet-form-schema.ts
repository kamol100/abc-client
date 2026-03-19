import type { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";

const CompanyWalletFormFieldSchema = (): FormFieldConfig[] => [
  {
    type: "dropdown",
    name: "recharge_method",
    label: {
      labelText: "company_wallet.recharge_method.label",
      mandatory: true,
    },
    placeholder: "company_wallet.recharge_method.placeholder",
    options: [
      {
        value: "cash",
        label: "company_wallet.recharge_method.options.cash",
      },
      {
        value: "bank",
        label: "company_wallet.recharge_method.options.bank",
      },
    ],
    isClearable: false,
    isSearchable: false,
  },
  {
    type: "number",
    name: "balance",
    label: {
      labelText: "company_wallet.balance.label",
      mandatory: true,
    },
    placeholder: "company_wallet.balance.placeholder",
  },
];

export default CompanyWalletFormFieldSchema;
