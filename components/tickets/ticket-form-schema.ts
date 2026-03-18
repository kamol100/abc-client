import { useTranslation } from "react-i18next";
import { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from "./ticket-type";

export const TicketCreateFormFieldSchema = (): FormFieldConfig[] => {
    const { t } = useTranslation();

    return [
        {
            type: "dropdown",
            name: "client_id",
            label: {
                labelText: t("ticket.client.label"),
                mandatory: true,
            },
            api: "/dropdown-clients",
            placeholder: t("ticket.client.placeholder"),
            valueKey: "client",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "subject_id",
            label: {
                labelText: t("ticket.subject.label"),
                mandatory: true,
            },
            api: "/dropdown-subjects",
            placeholder: t("ticket.subject.placeholder"),
            valueKey: "subject",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "tag_id",
            label: {
                labelText: t("ticket.tags.label"),
            },
            api: "/dropdown-tags",
            isMulti: true,
            placeholder: t("ticket.tags.placeholder"),
            valueKey: "tag",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "assigned_to",
            label: {
                labelText: t("ticket.assigned_to.label"),
            },
            api: "/dropdown-staffs",
            placeholder: t("ticket.assigned_to.placeholder"),
            valueKey: "staff",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "priority",
            label: {
                labelText: t("ticket.priority.label"),
            },
            options: PRIORITY_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.label),
            })),
            isClearable: false,
            placeholder: t("ticket.priority.label"),
            valueKey: "priority",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "status",
            label: {
                labelText: t("ticket.status.label"),
            },
            options: STATUS_OPTIONS.map((option) => ({
                value: option.value,
                label: t(option.label),
            })),
            isClearable: false,
            placeholder: t("ticket.status.label"),
            valueKey: "status",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "textarea",
            name: "message",
            label: {
                labelText: t("ticket.message.label"),
                mandatory: true,
            },
            placeholder: t("ticket.message.placeholder"),
            rows: 4,
        },
    ];
};

export default TicketCreateFormFieldSchema;
