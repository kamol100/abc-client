import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const ClientFilterSchema = (): FieldConfig[] => {
    return [
        {
            type: "text",
            name: "any",
            placeholder: "client.any_search.placeholder",
            permission: true,
            watchForFilter: true,
        },
        {
            type: "dropdown",
            name: "network_id",
            placeholder: "client.network.placeholder",
            permission: true,
            api: "/dropdown-networks",
        },
        {
            type: "dropdown",
            name: "zone_id",
            placeholder: "client.zone.placeholder",
            permission: true,
            api: "/dropdown-zones",
        },
        {
            type: "dropdown",
            name: "billing_type",
            placeholder: "client.billing_type.placeholder",
            permission: true,
            options: [
                { value: "auto", label: "common.auto" },
                { value: "manual", label: "common.manual" },
                { value: "no_invoice_this_month", label: "common.no_invoice_this_month" },
            ],
        },
        {
            type: "dropdown",
            name: "status",
            placeholder: "client.status.placeholder",
            permission: true,
            options: [
                { value: 1, label: "common.active" },
                { value: 0, label: "common.inactive" },
            ],
        },
    ];
};

export default ClientFilterSchema;
