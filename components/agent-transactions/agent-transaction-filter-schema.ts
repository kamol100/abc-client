import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const AgentTransactionFilterSchema = (
  includeAgentFilter = true
): FieldConfig[] => {
  const filters: FieldConfig[] = [
    {
      type: "text",
      name: "created_at",
      placeholder: "agent_transaction.created_at.placeholder",
      watchForFilter: true,
    },
    {
      type: "dropdown",
      name: "transaction_type",
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
      isClearable: true,
      isSearchable: false,
    },
  ];

  if (includeAgentFilter) {
    filters.splice(1, 0, {
      type: "dropdown",
      name: "agent_id",
      placeholder: "agent_transaction.agent.placeholder",
      api: "/dropdown-agents",
      isClearable: true,
    });
  }

  return filters;
};

export default AgentTransactionFilterSchema;
