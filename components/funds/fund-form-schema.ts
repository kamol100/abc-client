import { useTranslation } from "react-i18next";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const FundFormFieldSchema = (): FieldConfig[] => {
  const { t } = useTranslation();

  return [
    {
      type: "dropdown",
      name: "staff_id",
      label: {
        labelText: t("fund.staff.label"),
      },
      placeholder: t("fund.staff.placeholder"),
      api: "/dropdown-staffs",
      valueKey: "staff",
      valueMapping: { idKey: "id", labelKey: "name" },
      isClearable: true,
    },
    {
      type: "text",
      name: "short_name",
      label: {
        labelText: t("fund.short_name.label"),
        mandatory: true,
      },
      placeholder: t("fund.short_name.placeholder"),
    },
    {
      type: "text",
      name: "name",
      label: {
        labelText: t("fund.name.label"),
        mandatory: true,
      },
      placeholder: t("fund.name.placeholder"),
    },
    {
      type: "text",
      name: "account_number",
      label: {
        labelText: t("fund.account_number.label"),
      },
      placeholder: t("fund.account_number.placeholder"),
    },
  ];
};

export default FundFormFieldSchema;
