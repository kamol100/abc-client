import { useTranslation } from "react-i18next";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const TicketFilterSchema = (): FieldConfig[] => {
    const { t } = useTranslation();

    return [
        {
            type: "text",
            name: "ticket_id",
            placeholder: t("ticket.ticket_id.label"),
            permission: true,
            watchForFilter: true,
        },
        {
            type: "dropdown",
            name: "client_id",
            placeholder: t("ticket.client.placeholder"),
            permission: true,
            api: "/dropdown-clients",
        },
        {
            type: "dropdown",
            name: "assigned_to",
            placeholder: t("ticket.assigned_to.placeholder"),
            permission: true,
            api: "/dropdown-staffs",
        },
        {
            type: "dropdown",
            name: "priority",
            placeholder: t("ticket.priority.label"),
            permission: true,
            options: [
                { value: "high", label: t("ticket.priority.high") },
                { value: "medium", label: t("ticket.priority.medium") },
                { value: "low", label: t("ticket.priority.low") },
            ],
        },
        {
            type: "dropdown",
            name: "status",
            placeholder: t("ticket.status.label"),
            permission: true,
            options: [
                { value: "open", label: t("ticket.status.open") },
                { value: "in_progress", label: t("ticket.status.in_progress") },
                { value: "resolved", label: t("ticket.status.resolved") },
                { value: "closed", label: t("ticket.status.closed") },
            ],
        },
    ];
};

export default TicketFilterSchema;
