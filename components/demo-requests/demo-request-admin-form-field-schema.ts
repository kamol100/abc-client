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
            name: "username",
            label: { labelText: "admin_demo_request.fields.username.label" },
            placeholder: "admin_demo_request.fields.username.placeholder",
        },
        {
            type: "text",
            name: "password",
            label: { labelText: "admin_demo_request.fields.password.label" },
            placeholder: "admin_demo_request.fields.password.placeholder",
        },
        {
            type: "text",
            name: "full_name",
            label: { labelText: "admin_demo_request.fields.full_name.label", mandatory: true },
            placeholder: "demo_request.fields.full_name.placeholder",
        },
        {
            type: "text",
            name: "isp_name",
            label: { labelText: "admin_demo_request.fields.isp_name.label", mandatory: true },
            placeholder: "demo_request.fields.isp_name.placeholder",
        },
        {
            type: "email",
            name: "email",
            label: { labelText: "admin_demo_request.fields.email.label" },
            placeholder: "demo_request.fields.email.placeholder",
        },
        {
            type: "text",
            name: "website",
            label: { labelText: "admin_demo_request.fields.website.label" },
            placeholder: "admin_demo_request.fields.website.placeholder",
        },
        {
            type: "text",
            name: "phone",
            label: { labelText: "admin_demo_request.fields.phone.label", mandatory: true },
            placeholder: "demo_request.fields.phone.placeholder",
        },
        {
            type: "text",
            name: "whatsapp",
            label: { labelText: "admin_demo_request.fields.whatsapp.label", mandatory: true },
            placeholder: "demo_request.fields.whatsapp.placeholder",
        },
        {
            type: "text",
            name: "user_count",
            label: { labelText: "admin_demo_request.fields.user_count.label" },
            placeholder: "demo_request.fields.user_count.placeholder",
        },
        {
            type: "textarea",
            name: "office_address",
            label: { labelText: "admin_demo_request.fields.office_address.label" },
            placeholder: "demo_request.fields.office_address.placeholder",
            rows: 3,
        },
        {
            type: "switch",
            name: "terms_accepted",
            label: { labelText: "admin_demo_request.fields.terms_accepted.label" },
        },
    ];
};

export default DemoRequestAdminFormFieldSchema;
