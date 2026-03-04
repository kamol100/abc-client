import { FieldConfig } from "../form-wrapper/form-builder-type";

export const ZoneFormFieldSchema = (): FieldConfig[] => {
    return [
        {
            type: "text",
            name: "name",
            label: {
                labelText: "zone.name.label",
                mandatory: true,
            },
            placeholder: "zone.name.placeholder",
        },
        {
            type: "number",
            name: "lat",
            label: {
                labelText: "zone.latitude.label",
            },
            placeholder: "zone.latitude.placeholder",
        },
        {
            type: "number",
            name: "lon",
            label: {
                labelText: "zone.longitude.label",
            },
            placeholder: "zone.longitude.placeholder",
        },
    ];
};

export default ZoneFormFieldSchema;
