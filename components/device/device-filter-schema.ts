import { useTranslation } from "react-i18next";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const DeviceFilterSchema = (): FieldConfig[] => {
  const { t } = useTranslation();

  return [
    {
      type: "text",
      name: "name",
      placeholder: t("device.filters.name"),
      permission: true,
      watchForFilter: true,
    },
    {
      type: "dropdown",
      name: "network_id",
      placeholder: t("device.filters.network"),
      permission: true,
      api: "/dropdown-networks",
    },
    {
      type: "dropdown",
      name: "device_type_id",
      placeholder: t("device.filters.device_type"),
      permission: true,
      api: "/dropdown-device-types",
    },
    {
      type: "dropdown",
      name: "status",
      placeholder: t("device.filters.status"),
      permission: true,
      options: [
        { value: "active", label: t("device.status.active") },
        { value: "inactive", label: t("device.status.inactive") },
      ],
    },
  ];
};

export default DeviceFilterSchema;
