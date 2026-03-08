import { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export const ProductInFormFieldSchema = (): FieldConfig[] => {
    return [
        {
            type: "dropdown",
            name: "purchase_by",
            api: "/dropdown-staffs",
            isClearable: false,
            label: {
                labelText: "product_in.purchase_by.label",
                mandatory: true,
            },
            placeholder: "product_in.purchase_by.placeholder",
        },
        {
            type: "date",
            name: "purchase_date",
            label: {
                labelText: "product_in.purchase_date.label",
            },
            placeholder: "product_in.purchase_date.placeholder",
        },
        {
            type: "text",
            name: "voucher",
            label: {
                labelText: "product_in.voucher.label",
            },
            placeholder: "product_in.voucher.placeholder",
        },
        {
            type: "textarea",
            name: "note",
            rows: 2,
            label: {
                labelText: "product_in.note.label",
            },
            placeholder: "product_in.note.placeholder",
        },
        {
            type: "dropdown",
            name: "expense.expense_type_id",
            api: "/dropdown-expense-types",
            label: {
                labelText: "product_in.expense.expense_type.label",
            },
            placeholder: "product_in.expense.expense_type.placeholder",
        },
        {
            type: "dropdown",
            name: "expense.vendor_id",
            api: "/dropdown-vendors",
            label: {
                labelText: "product_in.expense.vendor.label",
            },
            placeholder: "product_in.expense.vendor.placeholder",
        },
        {
            type: "dropdown",
            name: "expense.fund_id",
            api: "/dropdown-funds",
            label: {
                labelText: "product_in.expense.fund.label",
            },
            placeholder: "product_in.expense.fund.placeholder",
        },
        {
            type: "number",
            name: "expense.amount",
            label: {
                labelText: "product_in.expense.amount.label",
            },
            placeholder: "product_in.expense.amount.placeholder",
        },
        {
            type: "textarea",
            name: "expense.note",
            rows: 2,
            label: {
                labelText: "product_in.expense.expense_note.label",
            },
            placeholder: "product_in.expense.expense_note.placeholder",
        },
    ];
};

export default ProductInFormFieldSchema;
