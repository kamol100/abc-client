"use client";

import dynamic from "next/dynamic";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { z } from "zod";
import FormWrapper from "./form-wrapper";
import CheckboxField from "../form/checkbox-field";
import DatePicker from "../form/DatePicker";
import InputField from "../form/input-field";
import RadioField from "../form/radio-field";
import Switch from "../form/switch";
import TextareaField from "../form/textarea-field";
import Label from "../label";
import {
  AccordionSection,
  CheckboxFieldConfig,
  DateFieldConfig,
  DateRangeFieldConfig,
  DropdownFieldConfig,
  FieldArrayConfig,
  FieldConfig,
  FormFieldConfig,
  GRID_STYLES,
  HydratePolicy,
  RadioFieldConfig,
  SwitchFieldConfig,
  TextareaFieldConfig,
} from "@/components/form-wrapper/form-builder-type";
import ActionButton from "../action-button";

// --- Date helpers ---

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

// --- Schema helpers ---

export const flattenFormSchema = (
  formSchema: FormFieldConfig[] | AccordionSection[]
): FormFieldConfig[] => {
  if (!formSchema.length) return [];
  if ("form" in formSchema[0]) {
    return (formSchema as AccordionSection[]).flatMap((s) => s.form);
  }
  return formSchema as FormFieldConfig[];
};

export const flattenFieldConfigs = (
  formSchema: FormFieldConfig[] | AccordionSection[]
): FieldConfig[] => {
  const all = flattenFormSchema(formSchema);
  const result: FieldConfig[] = [];
  for (const field of all) {
    if (field.type === "fieldArray") {
      result.push(...field.itemFields);
    } else {
      result.push(field);
    }
  }
  return result;
};

// --- Data transform helpers ---

const transformFieldValues = (
  data: Record<string, unknown>,
  fields: FieldConfig[]
): Record<string, unknown> => {
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

const transformDataToFormValues = (
  data: Record<string, unknown>,
  formSchema: FormFieldConfig[] | AccordionSection[]
): Record<string, unknown> => {
  if (!data) return {};
  const allFields = flattenFormSchema(formSchema);
  const staticFields: FieldConfig[] = [];
  const arrayFields: FieldArrayConfig[] = [];

  for (const field of allFields) {
    if (field.type === "fieldArray") {
      arrayFields.push(field);
    } else {
      staticFields.push(field);
    }
  }

  const formValues = transformFieldValues(data, staticFields);

  for (const arrField of arrayFields) {
    const rawArray = data[arrField.name];
    if (Array.isArray(rawArray)) {
      formValues[arrField.name] = rawArray.map((item) =>
        transformFieldValues(item as Record<string, unknown>, arrField.itemFields)
      );
    } else {
      const minItems = arrField.minItems ?? 0;
      formValues[arrField.name] =
        minItems > 0
          ? Array.from({ length: minItems }, () => ({ ...arrField.defaultItem }))
          : [];
    }
  }

  return formValues;
};

// --- Dynamic imports ---

const SelectDropdown = dynamic(() => import("../select-dropdown"));

// --- FieldArrayRenderer ---

type FieldArrayRendererProps = {
  config: FieldArrayConfig;
  namePrefix?: string;
  renderItemField: (field: FieldConfig, namePrefix: string) => ReactNode;
};

const FieldArrayRenderer = ({
  config,
  namePrefix = "",
  renderItemField,
}: FieldArrayRendererProps) => {
  const { control } = useFormContext();
  const fullName = namePrefix ? `${namePrefix}.${config.name}` : config.name;
  const { fields, append, remove, move } = useFieldArray({ control, name: fullName });

  const {
    allowAppend = true,
    allowRemove = true,
    allowReorder = false,
    minItems = 0,
    maxItems,
    itemFields,
    defaultItem,
    grids: itemGrids = 1,
    gridGap: itemGridGap = "gap-4",
    addButtonLabel = "Add",
  } = config;

  const canAppend = allowAppend && (maxItems === undefined || fields.length < maxItems);
  const canRemove = allowRemove && fields.length > minItems;

  return (
    <div className={config.className ?? "col-span-full space-y-4"}>
      {config.label && <Label label={config.label} />}

      {fields.map((item, index) => (
        <div key={item.id} className="relative border rounded-md p-4 space-y-3">
          <div className={`grid ${itemGridGap} ${GRID_STYLES[itemGrids]} w-full`}>
            {itemFields.map((itemField) => {
              if (itemField.permission === false) return null;
              return (
                <div key={itemField.name}>
                  {renderItemField(itemField, `${fullName}.${index}`)}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-1 justify-end">
            {allowReorder && index > 0 && (
              <ActionButton type="button" variant="ghost" size="icon" onClick={() => move(index, index - 1)}>
                <ArrowUp className="h-4 w-4" />
              </ActionButton>
            )}
            {allowReorder && index < fields.length - 1 && (
              <ActionButton type="button" variant="ghost" size="icon" onClick={() => move(index, index + 1)}>
                <ArrowDown className="h-4 w-4" />
              </ActionButton>
            )}
            {canRemove && (
              <ActionButton type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </ActionButton>
            )}
          </div>
        </div>
      ))}

      {canAppend && (
        <ActionButton
          type="button"
          variant="outline"
          size="default"
          onClick={() => append({ ...defaultItem })}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-1" />
          {addButtonLabel}
        </ActionButton>
      )}
    </div>
  );
};

// --- FormBuilder ---

export type FormBuilderProps = {
  formSchema: FormFieldConfig[] | AccordionSection[];
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
  children?: (renderField: (field: FormFieldConfig) => ReactNode) => ReactNode;
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

  const renderStaticField = (f: FieldConfig, namePrefix = ""): ReactNode => {
    const name = namePrefix ? `${namePrefix}.${f.name}` : f.name;

    switch (f.type) {
      case "text":
      case "email":
      case "password":
      case "number":
        return <InputField name={name} label={f.label} placeholder={f.placeholder} type={f.type} rules={f.rules} />;
      case "textarea":
        return <TextareaField name={name} label={f.label} placeholder={f.placeholder} rows={f.rows} rules={f.rules} />;
      case "dropdown":
        return (
          <SelectDropdown
            name={name}
            label={f.label}
            placeholder={f.placeholder}
            api={f.api}
            options={f.options}
            isMulti={f.isMulti}
            isDisabled={f.isDisabled}
            isLoading={f.isLoading}
            isClearable={f.isClearable}
            rules={f.rules}
          />
        );
      case "radio":
        return (
          <RadioField
            name={name}
            label={f.label}
            direction={f.direction}
            defaultValue={f.defaultValue}
            options={f.options}
            rules={f.rules}
          />
        );
      case "switch":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              name={name}
              label={f.label}
              onValueChange={f.saveOnChange ? () => setSaveOnChange(true) : undefined}
              rules={f.rules}
            />
          </div>
        );
      case "checkbox":
        return (
          <CheckboxField
            name={name}
            label={f.label}
            options={f.options}
            direction={f.direction}
            single={f.single}
            rules={f.rules}
          />
        );
      case "date":
        return (
          <DatePicker
            name={name}
            label={f.label}
            placeholder={f.placeholder}
            mode="single"
            required={f.required}
            dateFormat={f.dateFormat}
            rules={f.rules}
          />
        );
      case "dateRange":
        return (
          <DatePicker
            name={name}
            label={f.label}
            placeholder={f.placeholder}
            mode="range"
            required={f.required}
            dateFormat={f.dateFormat}
            rangeDateFormat={f.dateFormat}
            rules={f.rules}
          />
        );
      default:
        return null;
    }
  };

  const renderField = (field: FormFieldConfig, namePrefix = ""): ReactNode => {
    if (field.type === "fieldArray") {
      return (
        <FieldArrayRenderer
          config={field}
          namePrefix={namePrefix}
          renderItemField={renderStaticField}
        />
      );
    }
    return renderStaticField(field, namePrefix);
  };

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
        children((field) => renderField(field))
      ) : (
        <div className={`grid ${gridGap} m-auto ${GRID_STYLES[grids]} w-full`}>
          {(formSchema as FormFieldConfig[]).map((field) => (
            <div key={field.name}>
              {field.permission !== false ? renderField(field) : null}
            </div>
          ))}
        </div>
      )}
    </FormWrapper>
  );
};

export default FormBuilder;
