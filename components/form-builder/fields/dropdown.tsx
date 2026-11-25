import { lazy, Suspense, type ComponentProps } from "react";
import { resolveFieldPath } from "@/components/form-builder/core/conditions";
import { defineField, KEEP_VALUE } from "@/components/form-builder/fields/define-field";
import { FieldShell } from "@/components/form-builder/fields/field-shell";
import type { DropdownFieldConfig } from "@/components/form-wrapper/form-builder-type";
import { Skeleton } from "@/components/ui/skeleton";

// react-select is large, so the dropdown's code is loaded when the first one is drawn.
const LazySelectDropdown = lazy(() => import("@/components/select-dropdown"));

/**
 * The dropdown field. While its code loads, the label and a box of the same height
 * are drawn in its place, so nothing moves when the real control arrives.
 */
function SelectDropdown(props: ComponentProps<typeof LazySelectDropdown>) {
    return (
        <Suspense
            fallback={
                <FieldShell
                    name={props.name}
                    label={props.label}
                    labelFor={props.name}
                    labelBoxClassName="mb-2"
                    className=""
                >
                    <Skeleton className="h-9 w-full rounded-md" />
                </FieldShell>
            }
        >
            <LazySelectDropdown {...props} />
        </Suspense>
    );
}

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
        <SelectDropdown
            name={name}
            label={field.label}
            placeholder={field.placeholder}
            api={field.api}
            options={field.options}
            isMulti={field.isMulti}
            isDisabled={field.isDisabled || field.disabled}
            isLoading={field.isLoading}
            isClearable={field.isClearable}
            isSearchable={field.isSearchable}
            optionValueKey={field.valueMapping?.idKey}
            optionLabelKey={field.valueMapping?.labelKey}
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
        <SelectDropdown
            name={field.name}
            label={field.label}
            placeholder={field.placeholder}
            api={field.api}
            options={field.options}
            isMulti={field.isMulti}
            isDisabled={field.isDisabled}
            isClearable={field.isClearable}
            isSearchable={field.isSearchable}
            onValueChange={onValueChange}
        />
    ),
});
