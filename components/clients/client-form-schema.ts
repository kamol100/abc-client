import { useTranslation } from "react-i18next";
import { AccordionSection } from "../form-wrapper/form-builder-type";

type Props = {
    mode?: "create" | "edit";
};

export const ClientFormSchema = ({ mode = "create" }: Props): AccordionSection[] => {
    const { t } = useTranslation();

    const paymentDeadLine = () => {
        const label = (item: number): string => {
            let label: string = "None";
            if (item > 0 && item < 10) {
                label = `0${item}`;
            }
            if (item > 9) {
                label = item.toString();
            }
            return label;
        };
        return Array.from(Array(31).keys()).map((item) => ({
            value: item,
            label: label(item),
        }));
    };

    return [
        {
            name: "test",
            form: [
                {
                    type: "text",
                    name: "name",
                    label: { labelText: t("client.name.label"), mandatory: true },
                    placeholder: t("client.name.placeholder"),
                    permission: true,
                },
                {
                    type: "text",
                    label: { labelText: t("client.phone.label") },
                    name: "phone",
                    placeholder: t("client.phone.placeholder"),
                    permission: true,
                },
                {
                    type: "text",
                    label: { labelText: t("client.pppoe_username.label") },
                    name: "pppoe_username",
                    placeholder: t("client.pppoe_username.placeholder"),
                    permission: true,
                },
                {
                    type: "text",
                    label: { labelText: t("client.pppoe_password.label") },
                    name: "pppoe_password",
                    placeholder: t("client.pppoe_password.placeholder"),
                    permission: true,
                },
                {
                    type: "text",
                    label: { labelText: t("client.ip_address.label") },
                    name: "ip_address",
                    placeholder: t("client.ip_address.placeholder"),
                    permission: true,
                },
                {
                    type: "text",
                    label: { labelText: t("client.discount.label") },
                    name: "discount",
                    placeholder: t("client.discount.placeholder"),
                    permission: true,
                },
                {
                    type: "dropdown",
                    label: { labelText: t("client.payment_deadline.label") },
                    name: "payment_deadline",
                    placeholder: t("client.payment_deadline.placeholder"),
                    permission: true,
                    options: paymentDeadLine(),
                },
                {
                    type: "dropdown",
                    label: { labelText: t("client.payment_term.label") },
                    name: "payment_term",
                    placeholder: t("client.payment_term.placeholder"),
                    permission: true,
                    options: Array.from(Array(12).keys()).map((item) => ({
                        value: item + 1,
                        label: String(item + 1),
                    })),
                },
                {
                    type: "dropdown",
                    label: { labelText: t("client.zone.label") },
                    name: "zone_id",
                    placeholder: t("client.zone.placeholder"),
                    permission: true,
                    api: "/dropdown-zones",
                },
                {
                    type: "dropdown",
                    label: { labelText: t("client.sub_zone.label") },
                    name: "sub_zone_id",
                    placeholder: t("client.sub_zone.placeholder"),
                    permission: true,
                    api: "/dropdown-sub-zones",
                },
                {
                    type: "dropdown",
                    label: { labelText: t("client.network.label") },
                    name: "network_id",
                    placeholder: t("client.network.placeholder"),
                    api: "/dropdown-networks",
                    permission: true,
                },
                {
                    type: "dropdown",
                    label: { labelText: t("client.package.label") },
                    name: "package_id",
                    placeholder: t("client.package.placeholder"),
                    api: "/dropdown-network-packages",
                    permission: true,
                },
                {
                    type: "dropdown",
                    label: { labelText: t("client.device.label") },
                    name: "device_id",
                    placeholder: t("client.device.placeholder"),
                    api: "/dropdown-devices",
                    permission: true,
                },
                {
                    type: "text",
                    label: { labelText: t("client.latitude.label") },
                    name: "adr_latitude",
                    placeholder: t("client.latitude.placeholder"),
                    permission: true,
                },
                {
                    type: "text",
                    label: { labelText: t("client.longitude.label") },
                    name: "longitude",
                    placeholder: t("client.longitude.placeholder"),
                    permission: true,
                },
                {
                    type: "dropdown",
                    label: { labelText: t("common.status") },
                    name: "status",
                    placeholder: t("client.status.placeholder"),
                    permission: mode === "create",
                    options: [
                        { value: 1, label: t("common.active") },
                        { value: 0, label: t("common.inactive") },
                    ],
                },
                {
                    type: "radio",
                    label: { labelText: t("client.welcome_notification.label") },
                    name: "welcome_notification",
                    permission: true,
                    direction: "row",
                    defaultValue: "0",
                    options: [
                        { label: t("common.yes"), value: 1, disabled: false },
                        { label: t("common.no"), value: 0, disabled: false },
                    ],
                },
                {
                    type: "radio",
                    label: { labelText: t("client.billing_term.label") },
                    name: "billing_term",
                    permission: true,
                    direction: "row",
                    defaultValue: "prepaid",
                    options: [
                        { label: t("common.prepaid"), value: "prepaid", disabled: false },
                        { label: t("common.postpaid"), value: "postpaid", disabled: false },
                    ],
                },
                {
                    type: "textarea",
                    label: { labelText: t("client.current_address.label") },
                    name: "current_address",
                    placeholder: t("client.current_address.placeholder"),
                    permission: true,
                },
                {
                    type: "textarea",
                    label: { labelText: t("client.note.label") },
                    name: "note",
                    placeholder: t("client.note.placeholder"),
                    permission: true,
                },
            ],
        },
        {
            name: "test2",
            form: [
                {
                    type: "text",
                    label: { labelText: t("client.confirm.label") },
                    name: "confirm",
                    placeholder: t("client.confirm.placeholder"),
                    permission: true,
                },
            ],
        },
    ];
};

export default ClientFormSchema;
