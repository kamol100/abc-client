import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const TicketFilterSchema = (): FieldConfig[] => {
    return [
        {
            type: "text",
            name: "ticket_id",
            placeholder: "ticket.ticket_id.label",
            permission: true,
            watchForFilter: true,
        },
        {
            type: "dropdown",
            name: "client_id",
            placeholder: "ticket.client.placeholder",
            permission: true,
            api: "/dropdown-clients",
        },
        {
            type: "dropdown",
            name: "assigned_to",
            placeholder: "ticket.assigned_to.placeholder",
            permission: true,
            api: "/dropdown-staffs",
        },
        {
            type: "dropdown",
            name: "priority",
            placeholder: "ticket.priority.label",
            permission: true,
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
            permission: true,
            options: [
                { value: "open", label: "ticket.status.open" },
                { value: "in_progress", label: "ticket.status.in_progress" },
                { value: "resolved", label: "ticket.status.resolved" },
                { value: "closed", label: "ticket.status.closed" },
            ],
        },
    ];
};

export default TicketFilterSchema;
