import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const ResellerFilterSchema = (): FieldConfig[] => {
    return [
        {
            type: "text",
            name: "any",
            placeholder: "reseller.any_search.placeholder",
            permission: true,
            watchForFilter: true,
        },
        {
            type: "dropdown",
            name: "network_id",
            placeholder: "reseller.network.placeholder",
            api: "/dropdown-networks",
        },
        {
            type: "dropdown",
            name: "zone_id",
            placeholder: "reseller.zone.placeholder",
            api: "/dropdown-zones",
        },
        {
            type: "dropdown",
            name: "status",
            placeholder: "reseller.status.placeholder",
            options: [
                { value: 1, label: "common.active" },
                { value: 0, label: "common.inactive" },
            ],
        },
    ];
};

export default ResellerFilterSchema;
