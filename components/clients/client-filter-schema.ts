import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const ClientFilterSchema = (): FieldConfig[] => {
    return [
        {
            type: "text",
            name: "pppoe_username",
            placeholder: "client.pppoe_username.placeholder",
            permission: true,
            watchForFilter: true,
        },
        {
            type: "text",
            name: "name",
            placeholder: "client.name.placeholder",
            permission: true,
            watchForFilter: true,
        },
        {
            type: "text",
            name: "phone",
            placeholder: "client.phone.placeholder",
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
