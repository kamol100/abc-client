"use client";

import { cn } from "@/lib/utils";
import { AccordionItem } from "@radix-ui/react-accordion";
import dynamic from "next/dynamic";
import { ReactNode, useMemo, useState } from "react";
import { z } from "zod";
import FormWrapper from "./form-wrapper";
import CheckboxField from "../form/checkbox-field";
import DatePicker from "../form/DatePicker";
import InputField from "../form/input-field";
import RadioField from "../form/radio-field";
import Switch from "../form/switch";
import TextareaField from "../form/textarea-field";
import { Accordion, AccordionContent, AccordionTrigger } from "../ui/accordion";
import {
  AccordionSection,
  CheckboxFieldConfig,
  DateFieldConfig,
  DateRangeFieldConfig,
  DropdownFieldConfig,
  FieldConfig,
  GRID_STYLES,
  RadioFieldConfig,
  SwitchFieldConfig,
  TextareaFieldConfig,
} from "./form-builder-type";

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

const transformDataToFormValues = (
  data: Record<string, unknown>,
  formSchema: FieldConfig[]
): Record<string, unknown> => {
  if (!data) return {};
  const formValues: Record<string, unknown> = { ...data };

  formSchema.forEach((field) => {
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

type FormBuilderProps = {
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
  accordion?: boolean;
  accordionClass?: string | null;
  accordionTitleClass?: string | null;
  accordionBodyClass?: string | null;
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
  accordion = false,
  accordionClass = null,
  accordionBodyClass = null,
  accordionTitleClass = null,
}: FormBuilderProps) => {
  const [saveOnChange, setSaveOnChange] = useState(false);

  const transformedData = useMemo(() => {
    if (mode === "edit" && data) {
      return transformDataToFormValues(data, formSchema as FieldConfig[]);
    }
    return data;
  }, [data, mode, formSchema]);

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
    >
      {accordion ? (
        <Accordion
          type="single"
          defaultValue={formSchema[0]?.name}
          collapsible
          className={cn("w-full border rounded-md bg-muted", accordionClass)}
        >
          {(formSchema as AccordionSection[]).map((section) => (
            <AccordionItem
              value={section.name}
              key={section.name}
              className="w-full [&:not(:last-child)]:border-b decoration-transparent bg-muted"
            >
              <AccordionTrigger
                className={cn("px-3 font-semibold text-lg capitalize py-2", accordionTitleClass)}
              >
                {section.name}
              </AccordionTrigger>
              <AccordionContent
                  className={cn(
                  `grid ${gridGap} m-auto ${GRID_STYLES[grids]} w-full`,
                  "bg-background p-3 rounded-md",
                  accordionBodyClass
                )}
              >
                {section.form.map((field, index) => (
                  <div key={index}>
                    {field.permission !== false ? renderField(field) : null}
                  </div>
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
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
