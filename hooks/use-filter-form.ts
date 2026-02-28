import { objectToQueryString } from "@/lib/helper/helper";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { FieldValues, useForm } from "react-hook-form";
import type { FieldConfig, TextFieldConfig } from "@/components/form-wrapper/form-builder-type";

const TEXT_TYPES = new Set(["text", "email", "number", "password"]);
const DEBOUNCE_MS = 400;
const MIN_WATCH_LENGTH = 3;

function isTextField(field: FieldConfig): field is TextFieldConfig {
  return TEXT_TYPES.has(field.type);
}

function resolveWatchFields(
  formSchema: FieldConfig[],
  watchFieldsProp?: string[],
): string[] {
  if (watchFieldsProp) return watchFieldsProp;
  return formSchema
    .filter((f): f is TextFieldConfig => isTextField(f) && !!f.watchForFilter)
    .map((f) => f.name);
}

type UseFilterFormOptions = {
  formSchema: FieldConfig[];
  setFilter: (query: string) => void;
  watchFields?: string[];
  defaultFilter?: string;
};

export function useFilterForm({
  formSchema,
  setFilter,
  watchFields: watchFieldsProp,
  defaultFilter,
}: UseFilterFormOptions) {
  const form = useForm<FieldValues>();
  const { watch, setValue, handleSubmit } = form;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resolvedWatchFields = useMemo(
    () => resolveWatchFields(formSchema, watchFieldsProp),
    [formSchema, watchFieldsProp],
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
      let query = objectToQueryString(params);
      if (defaultFilter) {
        query = query ? `${query}&${defaultFilter}` : defaultFilter;
      }
      setFilter(query);
    },
    [defaultFilter, setFilter],
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

  return {
    form,
    resolvedWatchFields,
    hasManualSearchFields,
    triggerSubmit,
    clearField,
    submitFilter,
  };
}
