import { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";

const CompanyProfileFormFieldSchema = (): FormFieldConfig[] => [
  {
    type: "text",
    name: "name",
    label: {
      labelText: "company_profile.name.label",
      mandatory: true,
    },
    placeholder: "company_profile.name.placeholder",
  },
  {
    type: "text",
    name: "phone",
    label: {
      labelText: "company_profile.phone.label",
    },
    placeholder: "company_profile.phone.placeholder",
  },
  {
    type: "email",
    name: "email",
    label: {
      labelText: "company_profile.email.label",
    },
    placeholder: "company_profile.email.placeholder",
  },
  {
    type: "textarea",
    name: "address",
    label: {
      labelText: "company_profile.address.label",
    },
    placeholder: "company_profile.address.placeholder",
    rows: 3,
  },
];

export default CompanyProfileFormFieldSchema;
