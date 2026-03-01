"use client";

import dynamic from "next/dynamic";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { z } from "zod";
import FormWrapper from "./form-wrapper";
import CheckboxField from "../form/checkbox-field";
import DatePicker from "../form/DatePicker";
import InputField from "../form/input-field";
import RadioField from "../form/radio-field";
import Switch from "../form/switch";
import TextareaField from "../form/textarea-field";
import {
  AccordionSection,
  CheckboxFieldConfig,
  DateFieldConfig,
  DateRangeFieldConfig,
  DropdownFieldConfig,
  FieldConfig,
  GRID_STYLES,
  HydratePolicy,
  RadioFieldConfig,
  SwitchFieldConfig,
  TextareaFieldConfig,
} from "@/components/form-wrapper/form-builder-type";

const parseDateForForm = (v: unknown): Date | undefined => {
  if (!v) return undefined;
  if (v instanceof Date) return v;
  if (typeof v === "string") return new Date(v);
  return undefined;
};

const parseDateRangeForForm = (v: unknown): { from: Date; to?: Date } | undefined => {
  if (!v || typeof v !== "object") return undefined;
  const obj = v as { from?: unknown; to?: unknown };
  const from = parseDateForForm(obj.from);
  if (!from) return undefined;
  return { from, to: parseDateForForm(obj.to) ?? undefined };
};

export const flattenFormSchema = (
  formSchema: FieldConfig[] | AccordionSection[]
): FieldConfig[] => {
  if (!formSchema.length) return [];
  if ("form" in formSchema[0]) {
    return (formSchema as AccordionSection[]).flatMap((s) => s.form);
  }
  return formSchema as FieldConfig[];
};

const transformDataToFormValues = (
  data: Record<string, unknown>,
  formSchema: FieldConfig[] | AccordionSection[]
): Record<string, unknown> => {
  if (!data) return {};
  const fields = flattenFormSchema(formSchema);
  const formValues: Record<string, unknown> = { ...data };

  fields.forEach((field) => {
    if (field.type === "date") {
      const key = field.valueKey ?? field.name;
      const parsed = parseDateForForm(data[key]);
      if (parsed) formValues[field.name] = parsed;
    }
    if (field.type === "dateRange") {
      const key = field.valueKey ?? field.name;
      const parsed = parseDateRangeForForm(data[key]);
      if (parsed) formValues[field.name] = parsed;
    }
    if (field.type === "dropdown") {
      const sourceKey = field.valueKey || field.name;
      const sourceValue = data[sourceKey];

      if (sourceValue !== undefined && sourceValue !== null) {
        if (field.valueMapping) {
          const { idKey = "id" } = field.valueMapping;
          if (field.isMulti && Array.isArray(sourceValue)) {
            formValues[field.name] = sourceValue.map(
              (item: unknown) =>
                typeof item === "object" && item !== null
                  ? (item as Record<string, unknown>)[idKey]
                  : item
            );
          } else if (typeof sourceValue === "object" && !Array.isArray(sourceValue)) {
            formValues[field.name] = (sourceValue as Record<string, unknown>)[idKey];
          } else {
            formValues[field.name] = sourceValue;
          }
        } else {
          formValues[field.name] = sourceValue;
        }
      }
    }
  });

  return formValues;
};

const SelectDropdown = dynamic(() => import("../select-dropdown"));

export type FormBuilderProps = {
  formSchema: FieldConfig[] | AccordionSection[];
  grids?: number;
  gridGap?: string;
  schema: z.ZodType;
  api?: string;
  method: "GET" | "POST" | "PUT";
  mode: "create" | "edit";
  queryKey?: string;
  data?: Record<string, unknown>;
  onClose?: () => void | undefined;
  actionButton?: boolean;
  actionButtonClass?: string;
  hydrateOnEdit?: HydratePolicy;
  fullPage?: boolean;
  children?: (renderField: (field: FieldConfig) => ReactNode) => ReactNode;
};

const FormBuilder = ({
  formSchema,
  grids = 1,
  gridGap = "gap-4",
  schema,
  api,
  method,
  mode = "create",
  data,
  queryKey,
  onClose,
  actionButton = true,
  actionButtonClass,
  hydrateOnEdit = "ifNeeded",
  fullPage = false,
  children,
}: FormBuilderProps) => {
  const [saveOnChange, setSaveOnChange] = useState(false);

  const transformedData = useMemo(() => {
    if (mode === "edit" && data) {
      return transformDataToFormValues(data, formSchema);
    }
    return data;
  }, [data, mode, formSchema]);

  const transformCallback = useCallback(
    (rawData: Record<string, unknown>) =>
      transformDataToFormValues(rawData, formSchema),
    [formSchema]
  );

  const FIELD_RENDERERS: Record<FieldConfig["type"], (f: FieldConfig) => ReactNode> = {
    text: (f) => <InputField name={f.name} label={f.label} placeholder={f.placeholder} type={f.type} />,
    email: (f) => <InputField name={f.name} label={f.label} placeholder={f.placeholder} type={f.type} />,
    password: (f) => <InputField name={f.name} label={f.label} placeholder={f.placeholder} type={f.type} />,
    number: (f) => <InputField name={f.name} label={f.label} placeholder={f.placeholder} type={f.type} />,
    textarea: (f) => {
      const cfg = f as TextareaFieldConfig;
      return <TextareaField name={cfg.name} label={cfg.label} placeholder={cfg.placeholder} rows={cfg.rows} />;
    },
    dropdown: (f) => {
      const cfg = f as DropdownFieldConfig;
      return (
        <SelectDropdown
          name={cfg.name}
          label={cfg.label}
          placeholder={cfg.placeholder}
          api={cfg.api}
          options={cfg.options}
          isMulti={cfg.isMulti}
          isDisabled={cfg.isDisabled}
          isLoading={cfg.isLoading}
          isClearable={cfg.isClearable}
        />
      );
    },
    radio: (f) => {
      const cfg = f as RadioFieldConfig;
      return (
        <RadioField
          name={cfg.name}
          label={cfg.label}
          direction={cfg.direction}
          defaultValue={cfg.defaultValue}
          options={cfg.options}
        />
      );
    },
    switch: (f) => {
      const cfg = f as SwitchFieldConfig;
      return (
        <div className="flex items-center space-x-2">
          <Switch
            name={cfg.name}
            label={cfg.label}
            onValueChange={cfg.saveOnChange ? () => setSaveOnChange(true) : undefined}
          />
        </div>
      );
    },
    checkbox: (f) => {
      const cfg = f as CheckboxFieldConfig;
      return (
        <CheckboxField
          name={cfg.name}
          label={cfg.label}
          options={cfg.options}
          direction={cfg.direction}
          single={cfg.single}
        />
      );
    },
    date: (f) => {
      const cfg = f as DateFieldConfig;
      return (
        <DatePicker
          name={cfg.name}
          label={cfg.label}
          placeholder={cfg.placeholder}
          mode="single"
          required={cfg.required}
          dateFormat={cfg.dateFormat}
        />
      );
    },
    dateRange: (f) => {
      const cfg = f as DateRangeFieldConfig;
      return (
        <DatePicker
          name={cfg.name}
          label={cfg.label}
          placeholder={cfg.placeholder}
          mode="range"
          required={cfg.required}
          dateFormat={cfg.dateFormat}
          rangeDateFormat={cfg.dateFormat}
        />
      );
    },
  };

  const renderField = (field: FieldConfig) => FIELD_RENDERERS[field.type]?.(field) ?? null;

  return (
    <FormWrapper
      schema={schema}
      api={api}
      method={method}
      mode={mode}
      queryKey={queryKey}
      data={transformedData}
      onClose={onClose}
      actionButton={actionButton}
      saveOnChange={saveOnChange}
      setSaveOnChange={setSaveOnChange}
      actionButtonClass={actionButtonClass}
      hydrateOnEdit={hydrateOnEdit}
      formSchema={formSchema}
      transformToFormValues={transformCallback}
      grids={grids}
      fullPage={fullPage}
    >
      {children ? (
        children(renderField)
      ) : (
        <div className={`grid ${gridGap} m-auto ${GRID_STYLES[grids]} w-full`}>
          {(formSchema as FieldConfig[]).map((field, index) => (
            <div key={index}>
              {field.permission !== false ? renderField(field) : null}
            </div>
          ))}
        </div>
      )}
    </FormWrapper>
  );
};

export default FormBuilder;
