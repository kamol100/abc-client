import dynamic from "next/dynamic";
import { resolveFieldPath } from "@/components/form-builder/core/conditions";
import { defineField, KEEP_VALUE } from "@/components/form-builder/fields/define-field";
import type { DropdownFieldConfig } from "@/components/form-wrapper/form-builder-type";

// react-select is large, so it is loaded only when a form or a filter has a dropdown.
const FormSelect = dynamic(() => import("@/components/select-dropdown"));
const FilterSelect = dynamic(() => import("@/components/select-dropdown"), {
    loading: () => null,
});

/**
 * A select. Options come from `options` or from `api`.
 *
 * The API returns a related record as an object (`zone: { id, name }`); the form holds
 * only its id (`zone_id: 3`). `valueKey` names the record's key and `valueMapping.idKey`
 * names the id inside it.
 */
export const dropdownField = defineField<DropdownFieldConfig>({
    types: ["dropdown"],
    render: ({ field, name, namePrefix }) => (
        <FormSelect
            name={name}
            label={field.label}
            placeholder={field.placeholder}
            api={field.api}
            options={field.options}
            isMulti={field.isMulti}
            isDisabled={field.isDisabled || field.disabled}
            isLoading={field.isLoading}
            isClearable={field.isClearable}
            optionValueKey={field.valueMapping?.idKey}
            parentFieldName={
                field.dependsOn ? resolveFieldPath(namePrefix, field.dependsOn.field) : undefined
            }
            buildApi={field.dependsOn?.buildApi}
            resetOnParentChange={field.dependsOn?.resetOnChange}
            populate={field.populate?.map((item) => ({
                field: resolveFieldPath(namePrefix, item.field),
                from: item.from,
            }))}
        />
    ),
    readValue: (field, record) => {
        const sourceValue = record[field.valueKey || field.name];
        if (sourceValue === undefined || sourceValue === null) return KEEP_VALUE;
        if (!field.valueMapping) return sourceValue;

        // The API sent the related record (or a list of them): keep only the id.
        const { idKey = "id" } = field.valueMapping;
        if (field.isMulti && Array.isArray(sourceValue)) {
            return sourceValue.map((item: unknown) =>
                typeof item === "object" && item !== null
                    ? (item as Record<string, unknown>)[idKey]
                    : item,
            );
        }
        if (typeof sourceValue === "object" && !Array.isArray(sourceValue)) {
            return (sourceValue as Record<string, unknown>)[idKey];
        }
        return sourceValue;
    },
    renderFilter: ({ field, onValueChange }) => (
        <FilterSelect
            name={field.name}
            label={field.label}
            placeholder={field.placeholder}
            api={field.api}
            options={field.options}
            isMulti={field.isMulti}
            isDisabled={field.isDisabled}
            isClearable={field.isClearable}
            onValueChange={onValueChange}
        />
    ),
});
