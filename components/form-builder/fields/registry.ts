/**
 * The list of field types the form builder knows.
 *
 * To add a field type:
 *   1. Add its config type to `FieldConfig` in `form-wrapper/form-builder-type.ts`.
 *   2. Write a definition file in this folder (copy `textarea.tsx` for a simple one).
 *   3. Add it to `fieldDefinitions` below.
 */
import { checkboxField } from "@/components/form-builder/fields/checkbox";
import { dateField, dateRangeField } from "@/components/form-builder/fields/date";
import type { FieldDefinition } from "@/components/form-builder/fields/define-field";
import { dropdownField } from "@/components/form-builder/fields/dropdown";
import { geolocationField } from "@/components/form-builder/fields/geolocation";
import { passwordField } from "@/components/form-builder/fields/password";
import { radioField } from "@/components/form-builder/fields/radio";
import { switchField } from "@/components/form-builder/fields/switch";
import { textField } from "@/components/form-builder/fields/text";
import { textareaField } from "@/components/form-builder/fields/textarea";

const fieldDefinitions: FieldDefinition[] = [
    textField,
    passwordField,
    textareaField,
    dropdownField,
    radioField,
    switchField,
    checkboxField,
    dateField,
    dateRangeField,
    geolocationField,
];

const definitionByType = new Map<string, FieldDefinition>(
    fieldDefinitions.flatMap((definition) =>
        definition.types.map((type) => [type, definition] as const),
    ),
);

/** The definition for a field `type`, or undefined for a type the builder does not know. */
export const fieldDefinitionOf = (type: string): FieldDefinition | undefined =>
    definitionByType.get(type);
