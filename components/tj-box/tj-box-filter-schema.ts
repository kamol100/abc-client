import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const TjBoxFilterSchema = (): FieldConfig[] => [
    {
        type: "text",
        name: "name",
        placeholder: "tj_box.filter.name",
        watchForFilter: true,
    },
    {
        type: "text",
        name: "address",
        placeholder: "tj_box.filter.address",
        watchForFilter: true,
    },
    {
        type: "dropdown",
        name: "device_id",
        placeholder: "tj_box.filter.device",
        api: "/dropdown-devices",
    },
    {
        type: "dropdown",
        name: "zone_id",
        placeholder: "tj_box.filter.zone",
        api: "/dropdown-zones",
    },
    {
        type: "dropdown",
        name: "status",
        placeholder: "tj_box.filter.status",
        options: [
            { value: "active", label: "tj_box.status.active" },
            { value: "inactive", label: "tj_box.status.inactive" },
        ],
    },
];

export default TjBoxFilterSchema;
