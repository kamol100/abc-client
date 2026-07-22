import { FieldConfig } from "../form-wrapper/form-builder-type";

export const TjBoxFormFieldSchema = (): FieldConfig[] => [
    {
        type: "geolocation",
        name: "tj_box_location",
        latitudeName: "latitude",
        longitudeName: "longitude",
        latitudeLabel: { labelText: "tj_box.latitude.label" },
        longitudeLabel: { labelText: "tj_box.longitude.label" },
        latitudePlaceholder: "tj_box.latitude.placeholder",
        longitudePlaceholder: "tj_box.longitude.placeholder",
        getLocationLabel: "tj_box.get_current_location",
        getLocationSuccess: "tj_box.get_location_success",
        getLocationError: "tj_box.get_location_error",
        className: "col-span-full",
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
