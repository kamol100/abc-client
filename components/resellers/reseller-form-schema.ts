import { AccordionSection } from "@/components/form-wrapper/form-builder-type";

type Props = {
    mode?: "create" | "edit";
};

const bloodGroupOptions = [
    { value: "A+", label: "A+" },
    { value: "A-", label: "A-" },
    { value: "B+", label: "B+" },
    { value: "B-", label: "B-" },
    { value: "AB+", label: "AB+" },
    { value: "AB-", label: "AB-" },
    { value: "O+", label: "O+" },
    { value: "O-", label: "O-" },
];

export const ResellerFormFieldSchema = ({ mode = "create" }: Props): AccordionSection[] => {
    return [
        {
            name: "reseller.sections.basic_information",
            form: [
                {
                    type: "text",
                    name: "name",
                    label: { labelText: "reseller.name.label", mandatory: true },
                    placeholder: "reseller.name.placeholder",
                },
                ...(mode === "create"
                    ? [
                        {
                            type: "text" as const,
                            name: "username",
                            label: { labelText: "reseller.username.label", mandatory: true },
                            placeholder: "reseller.username.placeholder",
                        },
                        {
                            type: "password" as const,
                            name: "password",
                            label: { labelText: "reseller.password.label", mandatory: true },
                            placeholder: "reseller.password.placeholder",
                        },
                    ]
                    : []),
                {
                    type: "text",
                    name: "phone",
                    label: { labelText: "reseller.phone.label", mandatory: true },
                    placeholder: "reseller.phone.placeholder",
                },
                {
                    type: "dropdown",
                    name: "network_id",
                    label: { labelText: "reseller.network.label", mandatory: true },
                    placeholder: "reseller.network.placeholder",
                    api: "/dropdown-networks",
                    valueKey: "network",
                    valueMapping: { idKey: "id", labelKey: "name" },
                },
                {
                    type: "dropdown",
                    name: "package_id",
                    label: { labelText: "reseller.package.label" },
                    placeholder: "reseller.package.placeholder",
                    api: "/dropdown-reseller-packages",
                    isMulti: true,
                    valueKey: "package",
                    valueMapping: { idKey: "id", labelKey: "name" },
                },
                {
                    type: "dropdown",
                    name: "zone_id",
                    label: { labelText: "reseller.zone.label" },
                    placeholder: "reseller.zone.placeholder",
                    api: "/dropdown-zones",
                    valueKey: "zone",
                    valueMapping: { idKey: "id", labelKey: "name" },
                },
                {
                    type: "text",
                    name: "company",
                    label: { labelText: "reseller.company.label" },
                    placeholder: "reseller.company.placeholder",
                },
                {
                    type: "text",
                    name: "company_phone",
                    label: { labelText: "reseller.company_phone.label" },
                    placeholder: "reseller.company_phone.placeholder",
                },
                {
                    type: "textarea",
                    name: "company_address",
                    label: { labelText: "reseller.company_address.label" },
                    placeholder: "reseller.company_address.placeholder",
                    rows: 2,
                },
                {
                    type: "text",
                    name: "prefix",
                    label: { labelText: "reseller.prefix.label" },
                    placeholder: "reseller.prefix.placeholder",
                },
                {
                    type: "dropdown",
                    name: "status",
                    label: { labelText: "common.status" },
                    placeholder: "reseller.status.placeholder",
                    options: [
                        { value: 1, label: "common.active" },
                        { value: 0, label: "common.inactive" },
                    ],
                },
            ],
        },
        {
            name: "reseller.sections.billing_information",
            form: [
                {
                    type: "number",
                    name: "over_due_amount",
                    label: { labelText: "reseller.over_due_amount.label" },
                    placeholder: "reseller.over_due_amount.placeholder",
                },
                {
                    type: "radio",
                    name: "billing_type",
                    label: { labelText: "reseller.billing_type.label" },
                    direction: "row",
                    defaultValue: "prepaid",
                    options: [
                        { label: "common.postpaid", value: "postpaid" },
                        { label: "common.prepaid", value: "prepaid" },
                    ],
                },
                {
                    type: "radio",
                    name: "auto_recharge",
                    label: { labelText: "reseller.auto_recharge.label" },
                    direction: "row",
                    defaultValue: "1",
                    options: [
                        { label: "common.yes", value: 1 },
                        { label: "common.no", value: 0 },
                    ],
                },
                {
                    type: "number",
                    name: "terminate_hour",
                    label: { labelText: "reseller.terminate_hour.label" },
                    placeholder: "reseller.terminate_hour.placeholder",
                },
                {
                    type: "number",
                    name: "terminate_minute",
                    label: { labelText: "reseller.terminate_minute.label" },
                    placeholder: "reseller.terminate_minute.placeholder",
                },
                {
                    type: "number",
                    name: "serial_start_from",
                    label: { labelText: "reseller.serial_start_from.label" },
                    placeholder: "reseller.serial_start_from.placeholder",
                },
            ],
        },
        {
            name: "reseller.sections.advance_information",
            form: [
                {
                    type: "text",
                    name: "father_name",
                    label: { labelText: "reseller.father_name.label" },
                    placeholder: "reseller.father_name.placeholder",
                },
                {
                    type: "text",
                    name: "mother_name",
                    label: { labelText: "reseller.mother_name.label" },
                    placeholder: "reseller.mother_name.placeholder",
                },
                {
                    type: "textarea",
                    name: "present_address",
                    label: { labelText: "reseller.present_address.label" },
                    placeholder: "reseller.present_address.placeholder",
                    rows: 2,
                },
                {
                    type: "textarea",
                    name: "permanent_address",
                    label: { labelText: "reseller.permanent_address.label" },
                    placeholder: "reseller.permanent_address.placeholder",
                    rows: 2,
                },
                {
                    type: "text",
                    name: "social_media_account",
                    label: { labelText: "reseller.social_media_account.label" },
                    placeholder: "reseller.social_media_account.placeholder",
                },
                {
                    type: "text",
                    name: "nid",
                    label: { labelText: "reseller.nid.label" },
                    placeholder: "reseller.nid.placeholder",
                },
                {
                    type: "text",
                    name: "email",
                    label: { labelText: "reseller.email.label" },
                    placeholder: "reseller.email.placeholder",
                },
                {
                    type: "radio",
                    name: "gender",
                    label: { labelText: "reseller.gender.label" },
                    direction: "row",
                    defaultValue: "male",
                    options: [
                        { label: "common.male", value: "male" },
                        { label: "common.female", value: "female" },
                    ],
                },
                {
                    type: "radio",
                    name: "marital_status",
                    label: { labelText: "reseller.marital_status.label" },
                    direction: "row",
                    defaultValue: "0",
                    options: [
                        { label: "common.married", value: 1 },
                        { label: "common.unmarried", value: 0 },
                    ],
                },
                {
                    type: "dropdown",
                    name: "blood_group",
                    label: { labelText: "reseller.blood_group.label" },
                    placeholder: "reseller.blood_group.placeholder",
                    options: bloodGroupOptions,
                },
                {
                    type: "date",
                    name: "date_of_birth",
                    label: { labelText: "reseller.date_of_birth.label" },
                    placeholder: "reseller.date_of_birth.placeholder",
                },
                {
                    type: "date",
                    name: "join_date",
                    label: { labelText: "reseller.join_date.label" },
                    placeholder: "reseller.join_date.placeholder",
                },
            ],
        },
    ];
};

export default ResellerFormFieldSchema;
