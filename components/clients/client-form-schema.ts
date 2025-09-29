import { useTranslation } from "react-i18next";
import { AccordionFormBuilderType } from "../form-wrapper/form-builder-type";

type props = {
    mode: string
}

export const UserFormSchema = (): AccordionFormBuilderType[] => {
    const { t } = useTranslation();

    const paymentDeadLine = () => {
        const label = (item: number): string => {
            let label: string = "None";
            if (item > 0 && item < 10) {
                label = `0${item}`;
            }
            if (item > 9) {
                label = item?.toString();
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
                    label: t('client_name'),
                    placeholder: t('client_name'),
                    mandatory: true,
                    permission: true,
                    order: 2
                },
                {
                    type: "text",
                    label: t('client_pppoe_id'),
                    name: "pppoe_username",
                    placeholder: t("pppoe_id"),
                    permission: true,
                    order: 1
                },
                {
                    type: "text",
                    label: t('password'),
                    name: "pppoe_password",
                    placeholder: t("password"),
                    permission: true,
                    order: 3
                },
                {
                    type: "text",
                    label: t('phone_number'),
                    name: "phone",
                    placeholder: t("ex:016772171.."),
                    permission: true,
                    order: 4
                },
                {
                    type: "text",
                    label: t('ip_address'),
                    name: "ip_address",
                    placeholder: t("ip_address"),
                    permission: true,
                },
                {
                    type: "text",
                    label: t('discount'),
                    name: "discount",
                    placeholder: t("0.00"),
                    permission: true,
                },
                {
                    type: "radio",
                    label: t('send_welcome_sms'),
                    name: "welcome_notification",
                    permission: true,
                    direction: "row",
                    defaultValue: "0",
                    options: [
                        { label: "Yes", value: 1, disabled: false },
                        { label: "No", value: 0, disabled: false },
                    ]
                },
                {
                    type: "dropdown",
                    label: t('payment_deadline'),
                    name: "payment_deadline",
                    defaultValue: 10,
                    placeholder: t("payment_deadline"),
                    permission: true,
                    options: paymentDeadLine()
                },
                {
                    type: "dropdown",
                    label: t('payment_term'),
                    name: "payment_term",
                    defaultValue: 1,
                    placeholder: t("payment_term"),
                    permission: true,
                    options: Array.from(Array(12).keys()).map((item) => ({
                        value: item + 1,
                        label: item + 1,
                    }))
                },
                {
                    type: "radio",
                    label: t('billing_term'),
                    name: "billing_term",
                    permission: true,
                    direction: "row",
                    defaultValue: "prepaid",
                    options: [
                        { label: "Prepaid", value: "prepaid", disabled: false },
                        { label: "Postpaid", value: "postpaid", disabled: false },
                    ]
                },
                {
                    type: "textarea",
                    label: t('current_address'),
                    name: "current_address",
                    placeholder: t("current_address"),
                    permission: true,
                },
                {
                    type: "dropdown",
                    label: t('zone'),
                    name: "zone_id",
                    defaultValue: "zone",
                    placeholder: t("zone"),
                    permission: true,
                    api: "/dropdown-zones"
                },
                {
                    type: "dropdown",
                    label: t('sub_zone'),
                    name: "sub_zone_id",
                    defaultValue: "sub_zone",
                    placeholder: t("sub_zone"),
                    permission: true,
                    api: "/dropdown-sub-zones"
                },
                {
                    type: "text",
                    label: t('confirm_password'),
                    name: "confirm",
                    placeholder: t("confirm_password"),
                    permission: true,
                },
                {
                    type: "dropdown",
                    label: t('status'),
                    name: "status",
                    defaultValue: "status",
                    placeholder: t("status"),
                    permission: true,
                    options: [
                        { value: 1, label: "Active" },
                        { value: 0, label: "Inactive" },
                    ]
                },
            ]
        },
        {
            name: "test2",
            form: [

                {
                    type: "text",
                    label: t('confirm_password'),
                    name: "confirm",
                    placeholder: t("confirm_password"),
                    permission: true,
                },
            ]
        }


    ];


};
export default UserFormSchema;