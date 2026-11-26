import type { FormFieldConfig } from "@/components/form-wrapper/form-builder-type";
import { INVOICE_PAYMENT_FUNDS_API } from "@/components/invoices/payment-fund-access";
import { toNumber } from "@/lib/helper/helper";

/** A new invoice line, before the user fills it in. */
export const defaultInvoiceLine = {
    description: "",
    amount: 0,
    quantity: 1,
    discount: 0,
    order: 0,
    total_amount: 0,
    uuid: null,
};

/**
 * The invoice's line items: a table of rows the user can add to and remove from.
 * The line total is worked out from amount and quantity; the line discount is not
 * part of it (the totals box takes it off the sum).
 */
const invoiceLinesField: FormFieldConfig = {
    type: "fieldArray",
    name: "lines",
    minItems: 1,
    defaultItem: defaultInvoiceLine,
    addButtonLabel: "invoice.lines.add",
    reserveErrorSpace: true,
    table: {
        title: "invoice.lines.title",
        rowLabel: "invoice.lines.item",
        removeLabel: "invoice.lines.remove",
        columns: {
            description: 4,
            amount: 2,
            quantity: 1,
            discount: 2,
            total_amount: { span: 2, align: "right" },
        },
    },
    itemFields: [
        {
            type: "text",
            name: "description",
            label: { labelText: "invoice.line.description.label", mandatory: true },
            placeholder: "invoice.line.description.placeholder",
        },
        {
            type: "number",
            name: "amount",
            label: { labelText: "invoice.line.amount.label", mandatory: true },
            placeholder: "invoice.line.amount.placeholder",
            errorEllipsis: true,
        },
        {
            type: "number",
            name: "quantity",
            label: { labelText: "invoice.line.quantity.label", mandatory: true },
            placeholder: "invoice.line.quantity.placeholder",
            errorEllipsis: true,
        },
        {
            type: "number",
            name: "discount",
            label: { labelText: "invoice.line.discount.label" },
            placeholder: "invoice.line.discount.placeholder",
            errorEllipsis: true,
        },
        {
            type: "computed",
            name: "total_amount",
            label: { labelText: "invoice.line.total.label" },
            placeholder: "invoice.line.total.placeholder",
            compute: ({ row }) => lineTotal(row),
        },
    ],
};

const lineTotal = (line: Record<string, unknown>): number =>
    toNumber(line.amount as number | string | null | undefined) *
    toNumber(line.quantity as number | string | null | undefined);

/**
 * `fundLocked`: the user may only pay into their own fund (see paymentFundAccess).
 * `resellerLocked`: the reseller an invoice is billed to cannot be changed (edit).
 */
export const InvoiceFormFieldSchema = ({
    fundLocked = false,
    resellerLocked = false,
}: { fundLocked?: boolean; resellerLocked?: boolean } = {}): FormFieldConfig[] => [
    {
        type: "date",
        name: "create_date",
        label: { labelText: "invoice.create_date.label", mandatory: true },
        placeholder: "invoice.create_date.placeholder",
    },
    {
        type: "date",
        name: "due_date",
        label: { labelText: "invoice.due_date.label", mandatory: true },
        placeholder: "invoice.due_date.placeholder",
    },
    {
        type: "dropdown",
        name: "invoice_type_id",
        label: { labelText: "invoice.invoice_type.label", mandatory: true },
        placeholder: "invoice.invoice_type.placeholder",
        api: "/dropdown-invoice-types",
        valueKey: "invoice_type",
        valueMapping: { idKey: "id", labelKey: "name" },
    },
    {
        type: "dropdown",
        name: "bill_to_type",
        label: { labelText: "invoice.bill_to.type.label", mandatory: true },
        placeholder: "invoice.bill_to.type.placeholder",
        options: [
            { value: "client", label: "invoice.bill_to.type.client" },
            { value: "reseller", label: "invoice.bill_to.type.reseller" },
        ],
    },
    {
        type: "dropdown",
        name: "bill_to_id",
        label: { labelText: "invoice.bill_to.reseller.label", mandatory: true },
        placeholder: "invoice.bill_to.reseller.placeholder",
        api: "/dropdown-resellers",
        isDisabled: resellerLocked,
        valueKey: "bill_to",
        valueMapping: { idKey: "id", labelKey: "name" },
    },
    {
        type: "dropdown",
        name: "client_id",
        label: { labelText: "invoice.client.label", mandatory: true },
        placeholder: "invoice.client.placeholder",
        api: "/dropdown-clients",
        valueKey: "client",
        valueMapping: { idKey: "id", labelKey: "name" },
    },
    {
        type: "number",
        name: "discount",
        label: { labelText: "invoice.discount.label" },
        placeholder: "invoice.discount.placeholder",
    },
    {
        type: "dropdown",
        name: "status",
        label: { labelText: "invoice.status.label" },
        placeholder: "invoice.status.placeholder",
        options: [
            { value: "due", label: "invoice.status.due" },
            { value: "paid", label: "invoice.status.paid" },
            { value: "partial_paid", label: "invoice.status.partial_paid" },
        ],
    },
    {
        type: "number",
        name: "partial_amount",
        label: { labelText: "invoice.partial_amount.label" },
        placeholder: "invoice.partial_amount.placeholder",
    },
    {
        type: "dropdown",
        name: "fund_id",
        label: { labelText: "invoice.fund.label" },
        placeholder: "invoice.fund.placeholder",
        api: INVOICE_PAYMENT_FUNDS_API,
        isDisabled: fundLocked,
        valueKey: "fund",
        valueMapping: { idKey: "id", labelKey: "name" },
    },
    {
        type: "date",
        name: "payment_date",
        label: { labelText: "invoice.payment_date.label" },
        placeholder: "invoice.payment_date.placeholder",
    },
    {
        type: "radio",
        name: "confirmation_sms",
        label: { labelText: "invoice.confirmation_sms.label" },
        direction: "row",
        defaultValue: "0",
        options: [
            { label: "common.yes", value: 1 },
            { label: "common.no", value: 0 },
        ],
    },
    {
        type: "textarea",
        name: "note",
        label: { labelText: "invoice.note.label" },
        placeholder: "invoice.note.placeholder",
        rows: 2,
    },
    invoiceLinesField,
];

export default InvoiceFormFieldSchema;
