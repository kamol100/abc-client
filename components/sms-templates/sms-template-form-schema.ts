import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import {
  SMS_TEMPLATE_TYPES,
  SMS_TEMPLATE_TYPE_LABEL_KEYS,
} from "@/components/sms-templates/sms-template-type";

export const SmsTemplateFormFieldSchema = (): FieldConfig[] => {
  return [
    {
      type: "text",
      name: "name",
      label: {
        labelText: "sms_template.name.label",
        mandatory: true,
      },
      placeholder: "sms_template.name.placeholder",
    },
    {
      type: "dropdown",
      name: "template_type",
      label: {
        labelText: "sms_template.template_type.label",
        mandatory: true,
      },
      placeholder: "sms_template.template_type.placeholder",
      options: SMS_TEMPLATE_TYPES.map((type) => ({
        value: type,
        label: SMS_TEMPLATE_TYPE_LABEL_KEYS[type],
      })),
      isClearable: false,
      isSearchable: false,
    },
    {
      type: "textarea",
      name: "message",
      label: {
        labelText: "sms_template.message.label",
        mandatory: true,
      },
      placeholder: "sms_template.message.placeholder",
      rows: 10,
    },
  ];
};

export default SmsTemplateFormFieldSchema;
