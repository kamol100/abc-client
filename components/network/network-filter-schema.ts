import { useTranslation } from "react-i18next";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const NetworkFilterSchema = (): FieldConfig[] => {
  const { t } = useTranslation();

  return [
    {
      type: "text",
      name: "name",
      placeholder: t("network.filters.name"),
      permission: true,
      watchForFilter: true,
    },
    {
      type: "text",
      name: "ip_address",
      placeholder: t("network.filters.ip_address"),
      permission: true,
      watchForFilter: true,
    },
    {
      type: "dropdown",
      name: "status",
      placeholder: t("network.filters.status"),
      permission: true,
      options: [
        { value: 1, label: t("common.active") },
        { value: 0, label: t("common.inactive") },
      ],
    },
  ];
};

export default NetworkFilterSchema;
