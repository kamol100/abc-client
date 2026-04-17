import { useTranslation } from "react-i18next";
import { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import { PRIORITY_OPTIONS } from "@/components/tickets/ticket-type";

export const ClientTicketFormFieldSchema = (): FormFieldConfig[] => {
  const { t } = useTranslation();

  return [
    {
      type: "dropdown",
      name: "subject_id",
      label: {
        labelText: t("ticket.subject.label"),
        mandatory: true,
      },
      api: "/client-dropdown-subjects",
      placeholder: t("ticket.subject.placeholder"),
      valueKey: "subject",
      valueMapping: { idKey: "id", labelKey: "name" },
    },
    {
      type: "dropdown",
      name: "priority",
      label: { labelText: t("ticket.priority.label") },
      options: PRIORITY_OPTIONS.map((option) => ({
        value: option.value,
        label: t(option.label),
      })),
      isClearable: false,
      placeholder: t("ticket.priority.label"),
      valueKey: "priority",
      valueMapping: { idKey: "id", labelKey: "name" },
    },
    {
      type: "textarea",
      name: "message",
      label: {
        labelText: t("ticket.message.label"),
        mandatory: true,
      },
      placeholder: t("ticket.message.placeholder"),
      rows: 4,
    },
  ];
};

export default ClientTicketFormFieldSchema;
