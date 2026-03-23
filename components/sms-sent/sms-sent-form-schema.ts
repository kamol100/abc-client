import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const SmsSentFormFieldSchema = (): FieldConfig[] => {
  return [
    {
      type: "text",
      name: "phone",
      label: {
        labelText: "sms_sent.phone_number.label",
        mandatory: true,
      },
      placeholder: "sms_sent.phone_number.placeholder",
    },
    {
      type: "dropdown",
      name: "sms_template_id",
      label: {
        labelText: "sms_sent.sms_template.label",
      },
      placeholder: "sms_sent.sms_template.placeholder",
      api: "/dropdown-sms-templates",
      isClearable: true,
    },
    {
      type: "textarea",
      name: "sms_body",
      label: {
        labelText: "sms_sent.sms_body.label",
        mandatory: true,
      },
      placeholder: "sms_sent.sms_body.placeholder",
      rows: 4,
    },
  ];
};

export default SmsSentFormFieldSchema;
