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
                    label: { labelText: t('client_name'), mandatory: true },
                    placeholder: t('client_name'),
                    permission: true,
                },
                {
                    type: "text",
                    label: { labelText: t('phone_number') },
                    name: "phone",
                    placeholder: t("ex:016772171.."),
                    permission: true,
                },
                {
                    type: "text",
                    label: { labelText: t('client_pppoe_id') },
                    name: "pppoe_username",
                    placeholder: t("pppoe_id"),
                    permission: true,
                },
                {
                    type: "text",
                    label: { labelText: t('password') },
                    name: "pppoe_password",
                    placeholder: t("password"),
                    permission: true,
                },
                {
                    type: "text",
                    label: { labelText: t('ip_address') },
                    name: "ip_address",
                    placeholder: t("ip_address"),
                    permission: true,
                },
                {
                    type: "text",
                    label: { labelText: t('discount') },
                    name: "discount",
                    placeholder: t("0.00"),
                    permission: true,
                },
                {
                    type: "dropdown",
                    label: { labelText: t('payment_deadline') },
                    name: "payment_deadline",
                    placeholder: t("payment_deadline"),
                    permission: true,
                    options: paymentDeadLine(),
                },
                {
                    type: "dropdown",
                    label: { labelText: t('payment_term') },
                    name: "payment_term",
                    placeholder: t("payment_term"),
                    permission: true,
                    options: Array.from(Array(12).keys()).map((item) => ({
                        value: item + 1,
                        label: String(item + 1),
                    })),
                },
                {
                    type: "dropdown",
                    label: { labelText: t('zone') },
                    name: "zone_id",
                    placeholder: t("zone"),
                    permission: true,
                    api: "/dropdown-zones",
                },
                {
                    type: "dropdown",
                    label: { labelText: t('sub_zone') },
                    name: "sub_zone_id",
                    placeholder: t("sub_zone"),
                    permission: true,
                    api: "/dropdown-sub-zones",
                },
                {
                    type: "dropdown",
                    label: { labelText: t('network') },
                    name: "network_id",
                    placeholder: t("network"),
                    api: "/dropdown-networks",
                    permission: true,
                },
                {
                    type: "dropdown",
                    label: { labelText: t('network_package') },
                    name: "package_id",
                    placeholder: t("network_package"),
                    api: "/dropdown-network-packages",
                    permission: true,
                },
                {
                    type: "dropdown",
                    label: { labelText: t('device') },
                    name: "device_id",
                    placeholder: t("device"),
                    api: "/dropdown-devices",
                    permission: true,
                },
                {
                    type: "text",
                    label: { labelText: t('latitude') },
                    name: "adr_latitude",
                    placeholder: t("latitude"),
                    permission: true,
                },
                {
                    type: "text",
                    label: { labelText: t('longitude') },
                    name: "longitude",
                    placeholder: t("longitude"),
                    permission: true,
                },
                {
                    type: "dropdown",
                    label: { labelText: t('status') },
                    name: "status",
                    placeholder: t("status"),
                    permission: mode === "create",
                    options: [
                        { value: 1, label: "Active" },
                        { value: 0, label: "Inactive" },
                    ],
                },
                {
                    type: "radio",
                    label: { labelText: t('send_welcome_sms') },
                    name: "welcome_notification",
                    permission: true,
                    direction: "row",
                    defaultValue: "0",
                    options: [
                        { label: "Yes", value: 1, disabled: false },
                        { label: "No", value: 0, disabled: false },
                    ],
                },
                {
                    type: "radio",
                    label: { labelText: t('billing_term') },
                    name: "billing_term",
                    permission: true,
                    direction: "row",
                    defaultValue: "prepaid",
                    options: [
                        { label: "Prepaid", value: "prepaid", disabled: false },
                        { label: "Postpaid", value: "postpaid", disabled: false },
                    ],
                },
                {
                    type: "textarea",
                    label: { labelText: t('current_address') },
                    name: "current_address",
                    placeholder: t("current_address"),
                    permission: true,
                },
                {
                    type: "textarea",
                    label: { labelText: t('note') },
                    name: "note",
                    placeholder: t("note"),
                    permission: true,
                },
            ],
        },
        {
            name: "test2",
            form: [
                {
                    type: "text",
                    label: { labelText: t('confirm_password') },
                    name: "confirm",
                    placeholder: t("confirm_password"),
                    permission: true,
                },
            ],
        },
    ];
};

export default ClientFormSchema;
