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
