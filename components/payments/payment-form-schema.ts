import { useTranslation } from "react-i18next";
import { FormFieldConfig } from "../form-wrapper/form-builder-type";

export const PaymentFormFieldSchema = (
    mode: "create" | "edit" = "create"
): FormFieldConfig[] => {
    const { t } = useTranslation();

    const statusOptions =
        mode === "edit"
            ? [
                  { value: "paid", label: t("common.paid") },
                  { value: "due", label: t("payment.due") },
              ]
            : [
                  { value: "paid", label: t("common.paid") },
                  { value: "due", label: t("payment.due") },
                  { value: "partial_paid", label: t("payment.partial_paid") },
              ];

    return [
        {
            type: "text",
            name: "title",
            label: { labelText: t("payment.title.label"), mandatory: true },
            placeholder: t("payment.title.placeholder"),
        },
        {
            type: "number",
            name: "amount",
            label: { labelText: t("payment.amount.label"), mandatory: true },
            placeholder: t("payment.amount.placeholder"),
        },
        {
            type: "dropdown",
            name: "client_id",
            label: { labelText: t("payment.client.label"), mandatory: true },
            placeholder: t("payment.client.placeholder"),
            api: "/dropdown-clients",
            valueKey: "client",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "fund_id",
            label: { labelText: t("payment.fund.label"), mandatory: true },
            placeholder: t("payment.fund.placeholder"),
            api: "/dropdown-funds",
            valueKey: "fund",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "date",
            name: "payment_date",
            label: { labelText: t("payment.payment_date.label") },
            placeholder: t("payment.payment_date.placeholder"),
        },
        {
            type: "dropdown",
            name: "status",
            label: { labelText: t("common.status"), mandatory: true },
            placeholder: t("payment.status.placeholder"),
            options: statusOptions,
        },
        {
            type: "number",
            name: "discount",
            label: { labelText: t("payment.discount.label") },
            placeholder: t("payment.discount.placeholder"),
        },
        {
            type: "number",
            name: "partial_amount",
            label: { labelText: t("payment.partial_amount.label") },
            placeholder: t("payment.partial_amount.placeholder"),
        },
        {
            type: "text",
            name: "transaction_id",
            label: { labelText: t("payment.transaction_id.label") },
            placeholder: t("payment.transaction_id.placeholder"),
        },
        {
            type: "radio",
            name: "confirmation_sms",
            label: { labelText: t("payment.confirmation_sms.label") },
            options: [
                { label: t("common.yes"), value: 1 },
                { label: t("common.no"), value: 0 },
            ],
            defaultValue: "1",
            direction: "row",
        },
        {
            type: "textarea",
            name: "note",
            label: { labelText: t("common.note") },
            placeholder: t("common.optional_note"),
            rows: 2,
        },
    ];
};

export default PaymentFormFieldSchema;
