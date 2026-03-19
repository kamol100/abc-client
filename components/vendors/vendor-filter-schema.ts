
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const VendorFilterSchema = (): FieldConfig[] => {
    return [
        {
            type: "text",
            name: "name",
            placeholder: "common.name",
            permission: true,
            watchForFilter: true,
        },
        {
            type: "text",
            name: "phone",
            placeholder: "common.phone",
            permission: true,
            watchForFilter: true,
        },
        {
            type: "text",
            name: "email",
            placeholder: "common.email",
            permission: true,
            watchForFilter: true,
        },
    ];
};

export default VendorFilterSchema;
