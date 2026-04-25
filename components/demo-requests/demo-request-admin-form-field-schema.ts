import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import { DemoRequestStatusOptions } from "@/components/demo-requests/demo-request-type";

const DemoRequestAdminFormFieldSchema = (): FieldConfig[] => {
    return [
        {
            type: "dropdown",
            name: "status",
            label: { labelText: "admin_demo_request.fields.status.label", mandatory: true },
            placeholder: "admin_demo_request.fields.status.placeholder",
            options: DemoRequestStatusOptions,
            isClearable: false,
        },
        {
            type: "text",
            name: "website",
            label: { labelText: "admin_demo_request.fields.website.label" },
            placeholder: "https://example.isptik.com",
        },
        {
            type: "text",
            name: "phone",
            label: { labelText: "admin_demo_request.fields.phone.label" },
            placeholder: "common.phone",
        },
        {
            type: "text",
            name: "isp_name",
            label: { labelText: "admin_demo_request.fields.isp_name.label" },
            placeholder: "demo_request.fields.isp_name.placeholder",
        },
    ];
};

export default DemoRequestAdminFormFieldSchema;
