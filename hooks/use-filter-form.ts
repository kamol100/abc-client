import { DROP_VALUE, KEEP_VALUE } from "@/components/form-builder/fields/define-field";
import { fieldDefinitionOf } from "@/components/form-builder/fields/registry";
import { objectToQueryString } from "@/lib/helper/helper";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { FieldValues, useForm } from "react-hook-form";
import type { FieldConfig, TextFieldConfig } from "@/components/form-wrapper/form-builder-type";

const DEBOUNCE_MS = 400;
const MIN_WATCH_LENGTH = 3;

/** A field the user types into. Which types those are is set in the field definitions. */
function isTextField(field: FieldConfig): field is TextFieldConfig {
  return fieldDefinitionOf(field.type)?.isTextInput === true;
}

function resolveWatchFields(
  formSchema: FieldConfig[],
  watchFieldsProp?: string[],
  autoApply = false,
): string[] {
  if (autoApply) return formSchema.filter(isTextField).map((f) => f.name);
  if (watchFieldsProp) return watchFieldsProp;
  return formSchema
    .filter((f): f is TextFieldConfig => isTextField(f) && !!f.watchForFilter)
    .map((f) => f.name);
}

/**
 * The filter values as they go into the query string. Each field type says how its
 * value is written (see `toFilterParam` in its definition); other values go as they are.
 */
function serializeFilterParams(
  params: FieldValues,
  formSchema: FieldConfig[],
): FieldValues {
  const serialized: FieldValues = { ...params };

  formSchema.forEach((field) => {
    const rawValue = serialized[field.name];
    if (!rawValue) return;

    const toFilterParam = fieldDefinitionOf(field.type)?.toFilterParam;
    if (!toFilterParam) return;

    const param = toFilterParam(rawValue);
    if (param === DROP_VALUE) {
      delete serialized[field.name];
    } else if (param !== KEEP_VALUE) {
      serialized[field.name] = param;
    }
  });

  return serialized;
}

type UseFilterFormOptions = {
  formSchema: FieldConfig[];
  setFilter: (query: string) => void;
  watchFields?: string[];
  defaultFilter?: string;
  /**
   * Values the form starts with and returns to on reset. The page must start
   * its query with the same values (see `objectToQueryString`).
   */
  defaultValues?: FieldValues;
  /**
   * Every text field applies as you type (debounced), like dropdowns and dates
   * already do, so the form needs no Search button. Used by the filter panel.
   */
  autoApply?: boolean;
};

export function useFilterForm({
  formSchema,
  setFilter,
  watchFields: watchFieldsProp,
  defaultFilter,
  defaultValues,
  autoApply = false,
}: UseFilterFormOptions) {
  const form = useForm<FieldValues>({ defaultValues });
  const { watch, setValue, handleSubmit } = form;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolvedWatchFields = useMemo(
    () => resolveWatchFields(formSchema, watchFieldsProp, autoApply),
    [formSchema, watchFieldsProp, autoApply],
  );

  const textFieldNames = useMemo(
    () => formSchema.filter(isTextField).map((f) => f.name),
    [formSchema],
  );

  const hasManualSearchFields = useMemo(
    () => textFieldNames.some((name) => !resolvedWatchFields.includes(name)),
    [textFieldNames, resolvedWatchFields],
  );

  const submitFilter = useCallback(
    (params: FieldValues) => {
      const normalizedParams = serializeFilterParams(params, formSchema);
      let query = objectToQueryString(normalizedParams);
      if (defaultFilter) {
        query = query ? `${query}&${defaultFilter}` : defaultFilter;
      }
      setFilter(query);
    },
    [defaultFilter, formSchema, setFilter],
  );

  const submitFilterRef = useRef(submitFilter);
  submitFilterRef.current = submitFilter;

  const triggerSubmit = useCallback(() => {
    handleSubmit((params) => submitFilterRef.current(params))();
  }, [handleSubmit]);

  useEffect(() => {
    if (!resolvedWatchFields.length) return;

    const subscription = watch((value, { name }) => {
      if (!name || !resolvedWatchFields.includes(name)) return;

      const fieldValue = String(value[name] ?? "");
      const shouldSubmit =
        fieldValue.length >= MIN_WATCH_LENGTH || fieldValue.length === 0;

      if (!shouldSubmit) return;

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        handleSubmit((params) => submitFilterRef.current(params))();
      }, DEBOUNCE_MS);
    });

    return () => subscription.unsubscribe();
  }, [watch, resolvedWatchFields, handleSubmit]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const clearField = useCallback(
    (fieldName: string) => {
      setValue(fieldName, "");
      handleSubmit((params) => submitFilterRef.current(params))();
    },
    [setValue, handleSubmit],
  );

  /** Back to `defaultValues` (or empty) and run the query again. */
  const resetFilter = useCallback(() => {
    form.reset();
    submitFilterRef.current(defaultValues ?? {});
  }, [form, defaultValues]);

  return {
    form,
    resolvedWatchFields,
    hasManualSearchFields,
    triggerSubmit,
    clearField,
    submitFilter,
    resetFilter,
  };
}
