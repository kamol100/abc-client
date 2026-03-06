import { FieldConfig } from "../form-wrapper/form-builder-type";

export const TjBoxFormFieldSchema = (): FieldConfig[] => [
    {
        type: "number",
        name: "latitude",
        label: { labelText: "tj_box.latitude.label" },
        placeholder: "tj_box.latitude.placeholder",
    },
    {
        type: "number",
        name: "longitude",
        label: { labelText: "tj_box.longitude.label" },
        placeholder: "tj_box.longitude.placeholder",
    },
    {
        type: "dropdown",
        name: "zone_id",
        label: { labelText: "tj_box.zone.label" },
        placeholder: "tj_box.zone.placeholder",
        api: "/dropdown-zones",
        valueKey: "zone",
        valueMapping: { idKey: "id", labelKey: "name" },
        isClearable: true,
    },
    {
        type: "dropdown",
        name: "device_id",
        label: { labelText: "tj_box.device.label" },
        placeholder: "tj_box.device.placeholder",
        api: "/dropdown-devices",
        valueKey: "device",
        valueMapping: { idKey: "id", labelKey: "name" },
        isClearable: true,
    },
    {
        type: "text",
        name: "name",
        label: { labelText: "tj_box.name.label" },
        placeholder: "tj_box.name.placeholder",
    },
    {
        type: "text",
        name: "address",
        label: { labelText: "tj_box.address.label" },
        placeholder: "tj_box.address.placeholder",
    },
    {
        type: "dropdown",
        name: "status",
        label: { labelText: "tj_box.status.label" },
        placeholder: "tj_box.status.placeholder",
        options: [
            { value: "active", label: "tj_box.status.active" },
            { value: "inactive", label: "tj_box.status.inactive" },
        ],
    },
];

export default TjBoxFormFieldSchema;
