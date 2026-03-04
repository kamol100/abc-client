import { useTranslation } from "react-i18next";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const DeviceTypeFormFieldSchema = (): FieldConfig[] => {
  const { t } = useTranslation();

  return [
    {
      type: "text",
      name: "name",
      label: {
        labelText: t("device_type.name.label"),
        mandatory: true,
      },
      placeholder: t("device_type.name.placeholder"),
    },
    {
      type: "textarea",
      name: "note",
      label: { labelText: t("device_type.note.label") },
      placeholder: t("device_type.note.placeholder"),
      rows: 3,
      className: "sm:col-span-2",
    },
  ];
};

export default DeviceTypeFormFieldSchema;
