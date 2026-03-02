import { useTranslation } from "react-i18next";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const PaymentFilterSchema = (): FieldConfig[] => {
    const { t } = useTranslation();

    return [
        {
            type: "dateRange",
            name: "payment_date",
            placeholder: t("payment.payment_date.label"),
        },
        {
            type: "text",
            name: "track_id",
            placeholder: t("payment.invoice_id.placeholder"),
            watchForFilter: true,
        },
        {
            type: "dropdown",
            name: "staff_id",
            placeholder: t("payment.collect_by.label"),
            api: "/dropdown-staffs",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "client_id",
            placeholder: t("payment.client.label"),
            api: "/dropdown-clients",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "fund_id",
            placeholder: t("payment.fund.label"),
            api: "/dropdown-funds",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "zone_id",
            placeholder: t("zone.name.label"),
            api: "/dropdown-zones",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
    ];
};

export default PaymentFilterSchema;
