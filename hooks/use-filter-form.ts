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

function formatDateValue(value: unknown): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string") {
    if (value.includes("T")) return value.slice(0, 10);
    return value.trim() || undefined;
  }
  return undefined;
}

function serializeFilterParams(
  params: FieldValues,
  formSchema: FieldConfig[],
): FieldValues {
  const serialized: FieldValues = { ...params };

  formSchema.forEach((field) => {
    const rawValue = serialized[field.name];
    if (!rawValue) return;

    if (field.type === "date") {
      const normalizedDate = formatDateValue(rawValue);
      if (normalizedDate) serialized[field.name] = normalizedDate;
      return;
    }

    if (field.type === "dateRange") {
      if (typeof rawValue === "string") {
        serialized[field.name] = rawValue;
        return;
      }
      if (typeof rawValue === "object" && rawValue !== null) {
        const from = formatDateValue((rawValue as { from?: unknown }).from);
        const to = formatDateValue((rawValue as { to?: unknown }).to);
        if (from && to) {
          serialized[field.name] = `${from},${to}`;
        } else if (from) {
          serialized[field.name] = from;
        } else {
          delete serialized[field.name];
        }
      }
    }
  });

  return serialized;
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

  return {
    form,
    resolvedWatchFields,
    hasManualSearchFields,
    triggerSubmit,
    clearField,
    submitFilter,
  };
}
