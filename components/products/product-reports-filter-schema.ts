import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import type { ProductMovementMode } from "@/components/products/product-movement-filter-schema";

export const ProductReportsFilterSchema = (
    mode: ProductMovementMode,
): FieldConfig[] => {
    const dateFieldName = mode === "in" ? "purchase_date" : "out_date";
    const staffFieldName = mode === "in" ? "purchase_by" : "received_by";
    const staffPlaceholderKey =
        mode === "in"
            ? "product_reports.filters.purchase_by"
            : "product_reports.filters.received_by";

    return [
        {
            type: "dropdown",
            name: "product_id",
            placeholder: "product_reports.filters.product",
            api: "/dropdown-products",
            isClearable: true,
        },
        {
            type: "dateRange",
            name: dateFieldName,
            placeholder:
                mode === "in"
                    ? "product_reports.filters.purchase_date"
                    : "product_reports.filters.out_date",
        },
        {
            type: "dropdown",
            name: "vendor_id",
            placeholder: "product_reports.filters.vendor",
            api: "/dropdown-vendors",
            isClearable: true,
        },
        {
            type: "dropdown",
            name: "entry_by",
            placeholder: "product_reports.filters.entry_by",
            api: "/dropdown-staffs",
            isClearable: true,
        },
        {
            type: "dropdown",
            name: staffFieldName,
            placeholder: staffPlaceholderKey,
            api: "/dropdown-staffs",
            isClearable: true,
        },
        {
            type: "dropdown",
            name: "status",
            placeholder: "product_reports.filters.status",
            isClearable: true,
            options: [
                { value: "new", label: "product_in.status.new" },
                { value: "old", label: "product_in.status.old" },
                { value: "replace", label: "product_in.status.replace" },
            ],
        },
    ];
};

export default ProductReportsFilterSchema;
