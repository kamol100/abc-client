import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const AgentTransactionFormFieldSchema = (): FieldConfig[] => {
  return [
    {
      type: "dropdown",
      name: "transaction_type",
      label: {
        labelText: "agent_transaction.transaction_type.label",
        mandatory: true,
      },
      placeholder: "agent_transaction.transaction_type.placeholder",
      options: [
        {
          value: "commission",
          label: "agent_transaction.transaction_type.options.commission",
        },
        {
          value: "withdrawal",
          label: "agent_transaction.transaction_type.options.withdrawal",
        },
      ],
      isClearable: false,
      isSearchable: false,
    },
    {
      type: "number",
      name: "amount",
      label: {
        labelText: "agent_transaction.amount.label",
        mandatory: true,
      },
      placeholder: "agent_transaction.amount.placeholder",
    },
    {
      type: "textarea",
      name: "description",
      label: {
        labelText: "agent_transaction.description.label",
      },
      placeholder: "agent_transaction.description.placeholder",
      rows: 3,
    },
  ];
};

export default AgentTransactionFormFieldSchema;
