import { defineField } from "@/components/form-builder/fields/define-field";
import type { CustomFieldConfig } from "@/components/form-builder/types";

/**
 * Your own component in a field's place. Use it when no built-in type fits:
 *
 *   { type: "custom", name: "totals", className: "col-span-full", render: () => <InvoiceTotals /> }
 *
 * `render` receives the field's form path, so the same component works at the top
 * level and inside a row of a field array.
 */
export const customField = defineField<CustomFieldConfig>({
    types: ["custom"],
    sourceKeys: (field) => field.sourceKeys ?? [],
    render: ({ field, name, namePrefix }) => field.render({ name, namePrefix }),
});
