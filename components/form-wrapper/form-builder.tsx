"use client";

import dynamic from "next/dynamic";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { FieldValues, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { z } from "zod";
import FormWrapper from "./form-wrapper";
import CheckboxField from "../form/checkbox-field";
import DatePicker from "../form/DatePicker";
import InputField from "../form/input-field";
import RadioField from "../form/radio-field";
import Switch from "../form/switch";
import TextareaField from "../form/textarea-field";
import GeolocationField from "../form/geolocation-field";
import Label from "../label";
import {
  AccordionSection,
  FieldArrayConfig,
  FieldConfig,
  FormFieldConfig,
  GRID_STYLES,
  HydratePolicy,
  VisibleWhen,
} from "@/components/form-wrapper/form-builder-type";
import MyButton from "../my-button";

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

const applyDropdownDefaults = (
  values: Record<string, unknown> | undefined,
  formSchema: FormFieldConfig[] | AccordionSection[]
): Record<string, unknown> => {
  const next: Record<string, unknown> = { ...(values ?? {}) };

  for (const field of flattenFieldConfigs(formSchema)) {
    if (field.type !== "dropdown" || field.defaultValue == null) continue;
    const current = next[field.name];
    if (current === undefined || current === null || current === "") {
      next[field.name] = field.defaultValue;
    }
  }

  return next;
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
        <div key={item.id} className="relative flex items-end justify-center gap-3 border rounded-md p-3">
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

          <div className="flex items-center gap-1 justify-end flex-1">
            {allowReorder && index > 0 && (
              <MyButton type="button" variant="default" size="icon" onClick={() => move(index, index - 1)}>
                <ArrowUp className="h-4 w-4" />
              </MyButton>
            )}
            {allowReorder && index < fields.length - 1 && (
              <MyButton type="button" variant="default" size="icon" onClick={() => move(index, index + 1)}>
                <ArrowDown className="h-4 w-4" />
              </MyButton>
            )}
            {canRemove && (
              <MyButton type="button" variant="outline" size="default" action="delete" onClick={() => remove(index)} />
            )}
          </div>
        </div>
      ))}

      {canAppend && (
        <MyButton
          icon={true}
          action="create"
          title={addButtonLabel}
          onClick={() => append({ ...defaultItem })}
          className=" hover:bg-primary hover:text-primary-foreground"
        >
        </MyButton>
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
  successMessage?: string;
  data?: Record<string, unknown>;
  onClose?: () => void | undefined;
  actionButton?: boolean;
  actionButtonClass?: string;
  submitTitle?: string;
  hydrateOnEdit?: HydratePolicy;
  fullPage?: boolean;
  extraPayload?: Record<string, unknown>;
  transformPayload?: (values: FieldValues) => FieldValues;
  children?: (renderField: (field: FormFieldConfig) => ReactNode) => ReactNode;
};

const hasFilledValue = (value: unknown): boolean => {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
};

const ConditionalFormField = ({
  field,
  visibleWhen,
  children,
}: {
  field: FormFieldConfig;
  visibleWhen: VisibleWhen;
  children: ReactNode;
}) => {
  const { getValues, setValue } = useFormContext();
  const watched = useWatch({ name: visibleWhen.field });
  const visible =
    visibleWhen.equals === undefined
      ? hasFilledValue(watched)
      : watched === visibleWhen.equals || String(watched) === String(visibleWhen.equals);
  const resetValue = visibleWhen.resetValue ?? null;

  useEffect(() => {
    if (visible) return;
    if (Object.is(getValues(field.name), resetValue)) return;
    setValue(field.name, resetValue, {
      shouldValidate: false,
      shouldDirty: false,
      shouldTouch: false,
    });
  }, [visible, field.name, resetValue, getValues, setValue]);

  if (!visible) return null;

  return <div className={field.className}>{children}</div>;
};

export const VisibleFormField = ({
  field,
  children,
}: {
  field: FormFieldConfig;
  children: ReactNode;
}) => {
  if (field.permission === false) return null;
  if (!field.visibleWhen) {
    return <div className={field.className}>{children}</div>;
  }

  return (
    <ConditionalFormField field={field} visibleWhen={field.visibleWhen}>
      {children}
    </ConditionalFormField>
  );
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
  successMessage,
  onClose,
  actionButton = true,
  actionButtonClass,
  submitTitle,
  hydrateOnEdit = "ifNeeded",
  fullPage = false,
  extraPayload,
  transformPayload,
  children,
}: FormBuilderProps) => {
  const [saveOnChange, setSaveOnChange] = useState(false);

  const transformedData = useMemo(() => {
    const base =
      mode === "edit" && data
        ? transformDataToFormValues(data, formSchema)
        : data;
    return applyDropdownDefaults(base, formSchema);
  }, [data, mode, formSchema]);

  const transformCallback = useCallback(
    (rawData: Record<string, unknown>) =>
      applyDropdownDefaults(
        transformDataToFormValues(rawData, formSchema),
        formSchema
      ),
    [formSchema]
  );

  const renderStaticField = (f: FieldConfig, namePrefix = ""): ReactNode => {
    const name = namePrefix ? `${namePrefix}.${f.name}` : f.name;

    switch (f.type) {
      case "text":
      case "email":
      case "password":
      case "number":
        return (
          <InputField
            name={name}
            label={f.label}
            placeholder={f.placeholder}
            type={f.type}
            rules={f.rules}
            disabled={f.disabled}
          />
        );
      case "textarea":
        return (
          <TextareaField
            name={name}
            label={f.label}
            placeholder={f.placeholder}
            rows={f.rows}
            rules={f.rules}
            disabled={f.disabled}
          />
        );
      case "dropdown":
        return (
          <SelectDropdown
            name={name}
            label={f.label}
            placeholder={f.placeholder}
            api={f.api}
            options={f.options}
            isMulti={f.isMulti}
            isDisabled={f.isDisabled || f.disabled}
            isLoading={f.isLoading}
            isClearable={f.isClearable}
            optionValueKey={f.valueMapping?.idKey}
            rules={f.rules}
            parentFieldName={f.dependsOn?.field}
            buildApi={f.dependsOn?.buildApi}
            resetOnParentChange={f.dependsOn?.resetOnChange}
            populate={f.populate?.map((item) => ({
              field: namePrefix ? `${namePrefix}.${item.field}` : item.field,
              from: item.from,
            }))}
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
              disabled={f.disabled}
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
            disabled={f.disabled}
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
            disabled={f.disabled}
          />
        );
      case "geolocation":
        return (
          <GeolocationField
            latitudeName={namePrefix ? `${namePrefix}.${f.latitudeName}` : f.latitudeName}
            longitudeName={namePrefix ? `${namePrefix}.${f.longitudeName}` : f.longitudeName}
            latitudeLabel={f.latitudeLabel}
            longitudeLabel={f.longitudeLabel}
            latitudePlaceholder={f.latitudePlaceholder}
            longitudePlaceholder={f.longitudePlaceholder}
            getLocationLabel={f.getLocationLabel}
            getLocationSuccess={f.getLocationSuccess}
            getLocationError={f.getLocationError}
            className={f.className}
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
      successMessage={successMessage}
      data={transformedData}
      onClose={onClose}
      actionButton={actionButton}
      saveOnChange={saveOnChange}
      setSaveOnChange={setSaveOnChange}
      actionButtonClass={actionButtonClass}
      submitTitle={submitTitle}
      hydrateOnEdit={hydrateOnEdit}
      formSchema={formSchema}
      transformToFormValues={transformCallback}
      extraPayload={extraPayload}
      transformPayload={transformPayload}
      grids={grids}
      fullPage={fullPage}
    >
      {children ? (
        children((field) => renderField(field))
      ) : (
        <div className={`grid ${gridGap} m-auto ${GRID_STYLES[grids]} w-full`}>
          {(formSchema as FormFieldConfig[]).map((field) => (
            <VisibleFormField key={field.name} field={field}>
              {renderField(field)}
            </VisibleFormField>
          ))}
        </div>
      )}
    </FormWrapper>
  );
};

export default FormBuilder;
