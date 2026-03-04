import { useTranslation } from "react-i18next";
import { AccordionSection } from "../form-wrapper/form-builder-type";

type Props = {
  mode?: "create" | "edit";
};

const paymentTermOptions = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

const invoiceDayOptions = Array.from({ length: 31 }, (_, i) => {
  const day = i + 1;
  const label = day < 10 ? `0${day}` : String(day);
  return { value: label, label };
});

export const ClientFormFieldSchema = ({ mode = "create" }: Props): AccordionSection[] => {
  const { t } = useTranslation();
  const paymentDeadlineOptions = Array.from({ length: 32 }, (_, i) => {
    const label = i === 0 ? t("client.payment_deadline.none") : i < 10 ? `0${i}` : String(i);
    return { value: String(i), label };
  });

  return [
    {
      name: t("common.basic_information"),
      form: [
        {
          type: "text",
          name: "name",
          label: { labelText: t("client.name.label"), mandatory: true },
          placeholder: t("client.name.placeholder"),
        },
        {
          type: "text",
          name: "pppoe_username",
          label: { labelText: t("client.pppoe_username.label"), mandatory: true },
          placeholder: t("client.pppoe_username.placeholder"),
        },
        {
          type: "password",
          name: "pppoe_password",
          label: { labelText: t("client.pppoe_password.label"), mandatory: true },
          placeholder: t("client.pppoe_password.placeholder"),
        },
        {
          type: "text",
          name: "phone",
          label: { labelText: t("client.phone.label") },
          placeholder: t("client.phone.placeholder"),
        },
        {
          type: "text",
          name: "ip_address",
          label: { labelText: t("client.ip_address.label") },
          placeholder: t("client.ip_address.placeholder"),
        },
        {
          type: "text",
          name: "discount",
          label: { labelText: t("client.discount.label") },
          placeholder: t("client.discount.placeholder"),
        },
        {
          type: "radio",
          name: "welcome_notification",
          label: { labelText: t("client.welcome_notification.label") },
          direction: "row",
          defaultValue: "1",
          options: [
            { label: t("common.yes"), value: "1" },
            { label: t("common.no"), value: "0" },
          ],
        },
        {
          type: "dropdown",
          name: "payment_deadline",
          label: { labelText: t("client.payment_deadline.label") },
          placeholder: t("client.payment_deadline.placeholder"),
          options: paymentDeadlineOptions,
        },
        {
          type: "dropdown",
          name: "payment_term",
          label: { labelText: t("client.payment_term.label") },
          placeholder: t("client.payment_term.placeholder"),
          options: paymentTermOptions,
        },
        {
          type: "radio",
          name: "billing_term",
          label: { labelText: t("client.billing_term.label") },
          direction: "row",
          defaultValue: "prepaid",
          options: [
            { label: t("common.prepaid"), value: "prepaid" },
            { label: t("common.postpaid"), value: "postpaid" },
          ],
        },
        {
          type: "radio",
          name: "billing_type",
          label: { labelText: t("client.billing_type.label") },
          direction: "row",
          defaultValue: "auto",
          options: [
            { label: t("common.auto"), value: "auto" },
            { label: t("common.manual"), value: "manual" },
            { label: t("common.no_salary"), value: "no_bill" },
          ],
        },
        {
          type: "dropdown",
          name: "zone_id",
          label: { labelText: t("client.zone.label") },
          placeholder: t("client.zone.placeholder"),
          api: "/dropdown-zones",
        },
        {
          type: "dropdown",
          name: "sub_zone_id",
          label: { labelText: t("client.sub_zone.label") },
          placeholder: t("client.sub_zone.placeholder"),
          api: "/dropdown-sub-zones",
        },
        {
          type: "dropdown",
          name: "network_id",
          label: { labelText: t("client.network.label"), mandatory: true },
          placeholder: t("client.network.placeholder"),
          api: "/dropdown-networks",
        },
        {
          type: "dropdown",
          name: "package_id",
          label: { labelText: t("client.package.label"), mandatory: true },
          placeholder: t("client.package.placeholder"),
          api: "/dropdown-network-packages",
        },
        {
          type: "dropdown",
          name: "device_id",
          label: { labelText: t("client.device.label") },
          placeholder: t("client.device.placeholder"),
          api: "/dropdown-devices",
        },
        {
          type: "dropdown",
          name: "status",
          label: { labelText: t("client.status.label") },
          placeholder: t("client.status.placeholder"),
          permission: mode === "create",
          options: [
            { value: 1, label: t("common.active") },
            { value: 0, label: t("common.inactive") },
          ],
        },
        {
          type: "textarea",
          name: "current_address",
          label: { labelText: t("client.current_address.label") },
          placeholder: t("client.current_address.placeholder"),
          rows: 2,
        },
        {
          type: "textarea",
          name: "note",
          label: { labelText: t("client.note.label") },
          placeholder: t("client.note.placeholder"),
          rows: 2,
        },
      ],
    },
    {
      name: t("common.connectivity_information"),
      form: [
        {
          type: "dropdown",
          name: "cable_type",
          label: { labelText: t("client.cable_type.label") },
          placeholder: t("client.cable_type.placeholder"),
          options: [
            { value: "UTP", label: t("client.cable_type.options.utp") },
            { value: "FIBER", label: t("client.cable_type.options.fiber") },
          ],
        },
        {
          type: "number",
          name: "cable_length",
          label: { labelText: t("client.cable_length.label") },
          placeholder: t("client.cable_length.placeholder"),
        },
        {
          type: "dropdown",
          name: "connection_mode",
          label: { labelText: t("client.connection_mode.label") },
          placeholder: t("client.connection_mode.placeholder"),
          options: [
            { value: "1", label: t("common.active") },
            { value: "0", label: t("common.inactive") },
          ],
        },
        {
          type: "dropdown",
          name: "type",
          label: { labelText: t("client.type.label") },
          placeholder: t("client.type.placeholder"),
          options: [
            { value: "1", label: t("client.type.home") },
            { value: "2", label: t("client.type.corporate") },
            { value: "3", label: t("client.type.others") },
          ],
        },
        {
          type: "dropdown",
          name: "connection_type",
          label: { labelText: t("client.connection_type.label") },
          placeholder: t("client.connection_type.placeholder"),
          options: [
            { value: "1", label: t("client.connection_type.shared") },
            { value: "2", label: t("client.connection_type.dedicated") },
          ],
        },
        {
          type: "text",
          name: "mac_address",
          label: { labelText: t("client.mac_address.label") },
          placeholder: t("client.mac_address.placeholder"),
        },
        {
          type: "date",
          name: "termination_date",
          label: { labelText: t("client.termination_date.label") },
          placeholder: t("client.termination_date.placeholder"),
        },
      ],
    },
    {
      name: t("common.advance_information"),
      form: [
        {
          type: "text",
          name: "father_name",
          label: { labelText: t("client.father_name.label") },
          placeholder: t("client.father_name.placeholder"),
        },
        {
          type: "text",
          name: "occupation",
          label: { labelText: t("client.occupation.label") },
          placeholder: t("client.occupation.placeholder"),
        },
        {
          type: "email",
          name: "email",
          label: { labelText: t("client.email.label") },
          placeholder: t("client.email.placeholder"),
        },
        {
          type: "textarea",
          name: "permanent_address",
          label: { labelText: t("client.permanent_address.label") },
          placeholder: t("client.permanent_address.placeholder"),
          rows: 2,
        },
        {
          type: "dropdown",
          name: "upazila_id",
          label: { labelText: t("client.upazila.label") },
          placeholder: t("client.upazila.placeholder"),
          api: "/dropdown-upazilas",
        },
        {
          type: "dropdown",
          name: "invoice_day",
          label: { labelText: t("client.invoice_day.label") },
          placeholder: t("client.invoice_day.placeholder"),
          options: invoiceDayOptions,
        },
        {
          type: "date",
          name: "connection_date",
          label: { labelText: t("client.connection_date.label") },
          placeholder: t("client.connection_date.placeholder"),
        },
        {
          type: "text",
          name: "fund",
          label: { labelText: t("client.fund.label") },
          placeholder: t("client.fund.placeholder"),
        },
      ],
    },
  ];
};

export default ClientFormFieldSchema;
