import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const ClientTicketFilterSchema = (): FieldConfig[] => [
  {
    type: "text",
    name: "ticket_id",
    placeholder: "ticket.ticket_id.label",
    watchForFilter: true,
  },
  {
    type: "dropdown",
    name: "priority",
    placeholder: "ticket.priority.label",
    options: [
      { value: "high", label: "ticket.priority.high" },
      { value: "medium", label: "ticket.priority.medium" },
      { value: "low", label: "ticket.priority.low" },
    ],
  },
  {
    type: "dropdown",
    name: "status",
    placeholder: "ticket.status.label",
    options: [
      { value: "open", label: "ticket.status.open" },
      { value: "in_progress", label: "ticket.status.in_progress" },
      { value: "resolved", label: "ticket.status.resolved" },
      { value: "closed", label: "ticket.status.closed" },
    ],
  },
];

export default ClientTicketFilterSchema;
