import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import { DemoRequestStatusOptions } from "@/components/demo-requests/demo-request-type";

const DemoRequestStatusFormFieldSchema = (): FieldConfig[] => {
    return [
        {
            type: "dropdown",
            name: "status",
            label: { labelText: "admin_demo_request.fields.status.label", mandatory: true },
            placeholder: "admin_demo_request.fields.status.placeholder",
            options: DemoRequestStatusOptions,
            isClearable: false,
        },
    ];
};

export default DemoRequestStatusFormFieldSchema;
