import { FieldConfig } from "../form-wrapper/form-builder-type";

const VendorFormFieldSchema = (): FieldConfig[] => {
    return [
        {
            type: "text",
            name: "name",
            label: { labelText: "vendor.name.label", mandatory: true },
            placeholder: "vendor.name.placeholder",
        },
        {
            type: "text",
            name: "phone",
            label: { labelText: "vendor.phone.label", mandatory: true },
            placeholder: "vendor.phone.placeholder",
        },
        {
            type: "email",
            name: "email",
            label: { labelText: "vendor.email.label" },
            placeholder: "vendor.email.placeholder",
        },
        {
            type: "textarea",
            name: "address",
            label: { labelText: "vendor.address.label" },
            placeholder: "vendor.address.placeholder",
            rows: 3,
        },
    ];
};

export default VendorFormFieldSchema;
