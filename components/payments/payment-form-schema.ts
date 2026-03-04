import { FormFieldConfig } from "../form-wrapper/form-builder-type";

export const PaymentFormFieldSchema = (
    mode: "create" | "edit" = "create"
): FormFieldConfig[] => {
    const statusOptions =
        mode === "edit"
            ? [
                  { value: "paid", label: "common.paid" },
                  { value: "due", label: "payment.due" },
              ]
            : [
                  { value: "paid", label: "common.paid" },
                  { value: "due", label: "payment.due" },
                  { value: "partial_paid", label: "payment.partial_paid" },
              ];

    return [
        {
            type: "text",
            name: "title",
            label: { labelText: "payment.title.label", mandatory: true },
            placeholder: "payment.title.placeholder",
        },
        {
            type: "number",
            name: "amount",
            label: { labelText: "payment.amount.label", mandatory: true },
            placeholder: "payment.amount.placeholder",
        },
        {
            type: "dropdown",
            name: "client_id",
            label: { labelText: "payment.client.label", mandatory: true },
            placeholder: "payment.client.placeholder",
            api: "/dropdown-clients",
            valueKey: "client",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "dropdown",
            name: "fund_id",
            label: { labelText: "payment.fund.label", mandatory: true },
            placeholder: "payment.fund.placeholder",
            api: "/dropdown-funds",
            valueKey: "fund",
            valueMapping: { idKey: "id", labelKey: "name" },
        },
        {
            type: "date",
            name: "payment_date",
            label: { labelText: "payment.payment_date.label" },
            placeholder: "payment.payment_date.placeholder",
        },
        {
            type: "dropdown",
            name: "status",
            label: { labelText: "common.status", mandatory: true },
            placeholder: "payment.status.placeholder",
            options: statusOptions,
        },
        {
            type: "number",
            name: "discount",
            label: { labelText: "payment.discount.label" },
            placeholder: "payment.discount.placeholder",
        },
        {
            type: "number",
            name: "partial_amount",
            label: { labelText: "payment.partial_amount.label" },
            placeholder: "payment.partial_amount.placeholder",
        },
        {
            type: "text",
            name: "transaction_id",
            label: { labelText: "payment.transaction_id.label" },
            placeholder: "payment.transaction_id.placeholder",
        },
        {
            type: "radio",
            name: "confirmation_sms",
            label: { labelText: "payment.confirmation_sms.label" },
            options: [
                { label: "common.yes", value: 1 },
                { label: "common.no", value: 0 },
            ],
            defaultValue: "1",
            direction: "row",
        },
        {
            type: "textarea",
            name: "note",
            label: { labelText: "common.note" },
            placeholder: "common.optional_note",
            rows: 2,
        },
    ];
};

export default PaymentFormFieldSchema;
