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

const paymentDeadlineOptions = Array.from({ length: 32 }, (_, i) => {
  const label = i === 0 ? "client.payment_deadline.none" : i < 10 ? `0${i}` : String(i);
  return { value: String(i), label };
});

export const ClientFormFieldSchema = ({ mode = "create" }: Props): AccordionSection[] => {
  return [
    {
      name: "common.basic_information",
      form: [
        {
          type: "text",
          name: "name",
          label: { labelText: "client.name.label", mandatory: true },
          placeholder: "client.name.placeholder",
        },
        {
          type: "text",
          name: "pppoe_username",
          label: { labelText: "client.pppoe_username.label", mandatory: true },
          placeholder: "client.pppoe_username.placeholder",
        },
        {
          type: "text",
          name: "pppoe_password",
          label: { labelText: "client.pppoe_password.label", mandatory: true },
          placeholder: "client.pppoe_password.placeholder",
        },
        {
          type: "text",
          name: "phone",
          label: { labelText: "client.phone.label" },
          placeholder: "client.phone.placeholder",
        },
        {
          type: "text",
          name: "ip_address",
          label: { labelText: "client.ip_address.label" },
          placeholder: "client.ip_address.placeholder",
        },
        {
          type: "text",
          name: "discount",
          label: { labelText: "client.discount.label" },
          placeholder: "client.discount.placeholder",
        },
        {
          type: "radio",
          name: "welcome_notification",
          label: { labelText: "client.welcome_notification.label" },
          direction: "row",
          defaultValue: "1",
          options: [
            { label: "common.yes", value: "1" },
            { label: "common.no", value: "0" },
          ],
        },
        {
          type: "dropdown",
          name: "payment_deadline",
          label: { labelText: "client.payment_deadline.label" },
          placeholder: "client.payment_deadline.placeholder",
          options: paymentDeadlineOptions,
        },
        {
          type: "dropdown",
          name: "payment_term",
          label: { labelText: "client.payment_term.label" },
          placeholder: "client.payment_term.placeholder",
          options: paymentTermOptions,
        },
        {
          type: "radio",
          name: "billing_term",
          label: { labelText: "client.billing_term.label" },
          direction: "row",
          defaultValue: "prepaid",
          options: [
            { label: "common.prepaid", value: "prepaid" },
            { label: "common.postpaid", value: "postpaid" },
          ],
        },
        {
          type: "radio",
          name: "billing_type",
          label: { labelText: "client.billing_type.label" },
          direction: "row",
          defaultValue: "auto",
          options: [
            { label: "common.auto", value: "auto" },
            { label: "common.manual", value: "manual" },
            { label: "common.no_salary", value: "no_bill" },
          ],
        },
        {
          type: "dropdown",
          name: "zone_id",
          label: { labelText: "client.zone.label" },
          placeholder: "client.zone.placeholder",
          api: "/dropdown-zones",
          valueKey: "zone",
          valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
          type: "dropdown",
          name: "sub_zone_id",
          label: { labelText: "client.sub_zone.label" },
          placeholder: "client.sub_zone.placeholder",
          api: "/dropdown-sub-zones",
          valueKey: "sub_zone",
          valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
          type: "dropdown",
          name: "network_id",
          label: { labelText: "client.network.label", mandatory: true },
          placeholder: "client.network.placeholder",
          api: "/dropdown-networks",
          valueKey: "network",
          valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
          type: "dropdown",
          name: "package_id",
          label: { labelText: "client.package.label", mandatory: true },
          placeholder: "client.package.placeholder",
          api: "/dropdown-network-packages",
          valueKey: "package",
          valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
          type: "dropdown",
          name: "device_id",
          label: { labelText: "client.device.label" },
          placeholder: "client.device.placeholder",
          api: "/dropdown-devices",
          valueKey: "device",
          valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
          type: "dropdown",
          name: "status",
          label: { labelText: "client.status.label" },
          placeholder: "client.status.placeholder",
          permission: mode === "create",
          options: [
            { value: 1, label: "common.active" },
            { value: 0, label: "common.inactive" },
          ],
        },
        {
          type: "textarea",
          name: "current_address",
          label: { labelText: "client.current_address.label" },
          placeholder: "client.current_address.placeholder",
          rows: 2,
        },
        {
          type: "textarea",
          name: "note",
          label: { labelText: "client.note.label" },
          placeholder: "client.note.placeholder",
          rows: 2,
        },
      ],
    },
    {
      name: "common.connectivity_information",
      form: [
        {
          type: "dropdown",
          name: "cable_type",
          label: { labelText: "client.cable_type.label" },
          placeholder: "client.cable_type.placeholder",
          options: [
            { value: "UTP", label: "client.cable_type.options.utp" },
            { value: "FIBER", label: "client.cable_type.options.fiber" },
          ],
        },
        {
          type: "number",
          name: "cable_length",
          label: { labelText: "client.cable_length.label" },
          placeholder: "client.cable_length.placeholder",
        },
        {
          type: "dropdown",
          name: "connection_mode",
          label: { labelText: "client.connection_mode.label" },
          placeholder: "client.connection_mode.placeholder",
          options: [
            { value: "1", label: "common.active" },
            { value: "0", label: "common.inactive" },
          ],
        },
        {
          type: "dropdown",
          name: "type",
          label: { labelText: "client.type.label" },
          placeholder: "client.type.placeholder",
          options: [
            { value: "1", label: "client.type.home" },
            { value: "2", label: "client.type.corporate" },
            { value: "3", label: "client.type.others" },
          ],
        },
        {
          type: "dropdown",
          name: "connection_type",
          label: { labelText: "client.connection_type.label" },
          placeholder: "client.connection_type.placeholder",
          options: [
            { value: "1", label: "client.connection_type.shared" },
            { value: "2", label: "client.connection_type.dedicated" },
          ],
        },
        {
          type: "text",
          name: "mac_address",
          label: { labelText: "client.mac_address.label" },
          placeholder: "client.mac_address.placeholder",
        },
        {
          type: "date",
          name: "termination_date",
          label: { labelText: "client.termination_date.label" },
          placeholder: "client.termination_date.placeholder",
        },
      ],
    },
    {
      name: "common.advance_information",
      form: [
        {
          type: "text",
          name: "father_name",
          label: { labelText: "client.father_name.label" },
          placeholder: "client.father_name.placeholder",
        },
        {
          type: "text",
          name: "occupation",
          label: { labelText: "client.occupation.label" },
          placeholder: "client.occupation.placeholder",
        },
        {
          type: "email",
          name: "email",
          label: { labelText: "client.email.label" },
          placeholder: "client.email.placeholder",
        },
        {
          type: "textarea",
          name: "permanent_address",
          label: { labelText: "client.permanent_address.label" },
          placeholder: "client.permanent_address.placeholder",
          rows: 2,
        },
        {
          type: "dropdown",
          name: "upazila_id",
          label: { labelText: "client.upazila.label" },
          placeholder: "client.upazila.placeholder",
          api: "/dropdown-upazilas",
        },
        {
          type: "dropdown",
          name: "invoice_day",
          label: { labelText: "client.invoice_day.label" },
          placeholder: "client.invoice_day.placeholder",
          options: invoiceDayOptions,
        },
        {
          type: "date",
          name: "connection_date",
          label: { labelText: "client.connection_date.label" },
          placeholder: "client.connection_date.placeholder",
        },
        {
          type: "text",
          name: "fund",
          label: { labelText: "client.fund.label" },
          placeholder: "client.fund.placeholder",
        },
      ],
    },
  ];
};

export default ClientFormFieldSchema;
