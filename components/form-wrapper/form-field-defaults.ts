/**
 * Moved to `components/form-builder/core/`. This file re-exports the old names so
 * existing imports keep working.
 */
export {
    flattenFieldConfigs,
    flattenFormSchema,
} from "@/components/form-builder/core/form-schema";
export {
    applyFormFieldDefaults,
    isBlankFieldArrayValue,
    normalizeFieldArrayItems,
} from "@/components/form-builder/core/values";
