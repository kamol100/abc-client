import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";

export type ProductMovementMode = "in" | "out";

export const ProductMovementFilterSchema = (
    mode: ProductMovementMode,
): FieldConfig[] => {
    const dateFieldName = mode === "in" ? "purchase_date" : "out_date";
    const staffFieldName = mode === "in" ? "purchase_by" : "received_by";
    const staffPlaceholderKey =
        mode === "in"
            ? "product_movement.filters.purchase_by"
            : "product_movement.filters.received_by";

    const filters: FieldConfig[] = [
        {
            type: "dateRange",
            name: dateFieldName,
            placeholder:
                mode === "in"
                    ? "product_movement.filters.purchase_date"
                    : "product_movement.filters.out_date",
        },
        {
            type: "dropdown",
            name: "vendor_id",
            placeholder: "product_movement.filters.vendor",
            api: "/dropdown-vendors",
            isClearable: true,
        },
        {
            type: "dropdown",
            name: "status",
            placeholder: "product_movement.filters.status",
            isClearable: true,
            options: [
                { value: "new", label: "product_in.status.new" },
                { value: "old", label: "product_in.status.old" },
                { value: "replace", label: "product_in.status.replace" },
            ],
        },
        {
            type: "dropdown",
            name: "entry_by",
            placeholder: "product_movement.filters.entry_by",
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
    ];

    if (mode === "out") {
        filters.push({
            type: "dropdown",
            name: "client_id",
            placeholder: "product_movement.filters.client",
            api: "/dropdown-clients",
            isClearable: true,
        });
    }

    return filters;
};

export default ProductMovementFilterSchema;
