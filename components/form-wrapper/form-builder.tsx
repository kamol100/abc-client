"use client";

import { ReactNode, useCallback, useMemo, useState } from "react";
import { FieldValues } from "react-hook-form";
import { z } from "zod";
import { applyFormFieldDefaults, toFormValues } from "@/components/form-builder/core/values";
import { FieldArrayRenderer } from "@/components/form-builder/fields/field-array";
import { fieldDefinitionOf } from "@/components/form-builder/fields/registry";
import { VisibleFormField } from "@/components/form-builder/layout/visible-field";
import {
  AccordionSection,
  FieldConfig,
  FormFieldConfig,
  GRID_STYLES,
  HydratePolicy,
} from "@/components/form-wrapper/form-builder-type";
import FormWrapper from "@/components/form-wrapper/form-wrapper";

// Callers with a custom layout import this from here.
export { VisibleFormField };

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
  /** After a successful save: the response `data` and the payload that was sent (see FormWrapper). */
  onSuccess?: (response: Record<string, unknown> | undefined, payload: FieldValues) => void;
  actionButton?: boolean;
  actionButtonClass?: string;
  submitTitle?: string;
  /** Keep the submit button spinning at least this long after a valid submit, then close. */
  submitHoldMs?: number;
  hydrateOnEdit?: HydratePolicy;
  fullPage?: boolean;
  extraPayload?: Record<string, unknown>;
  transformPayload?: (values: FieldValues) => FieldValues;
  preparePayload?: (values: FieldValues) => Promise<FieldValues | false> | FieldValues | false;
  preventDuplicateSubmit?: boolean;
  resetOnSuccess?: boolean;
  skipInvalidate?: boolean;
  onSubmitError?: (error: unknown, payload: FieldValues) => void;
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
  successMessage,
  onClose,
  onSuccess,
  actionButton = true,
  actionButtonClass,
  submitTitle,
  submitHoldMs,
  hydrateOnEdit = "ifNeeded",
  fullPage = false,
  extraPayload,
  transformPayload,
  preparePayload,
  preventDuplicateSubmit,
  resetOnSuccess,
  skipInvalidate,
  onSubmitError,
  children,
}: FormBuilderProps) => {
  const [saveOnChange, setSaveOnChange] = useState(false);

  const transformedData = useMemo(() => {
    const base =
      mode === "edit" && data
        ? toFormValues(data, formSchema)
        : data;
    return applyFormFieldDefaults(base, formSchema, { radios: mode === "create" });
  }, [data, mode, formSchema]);

  const transformCallback = useCallback(
    (rawData: Record<string, unknown>) =>
      applyFormFieldDefaults(
        toFormValues(rawData, formSchema),
        formSchema
      ),
    [formSchema]
  );

  // Draws one field that holds a value. How each type is drawn lives in
  // `components/form-builder/fields/`.
  const renderStaticField = (field: FieldConfig, namePrefix = ""): ReactNode => {
    const definition = fieldDefinitionOf(field.type);
    if (!definition) return null;

    return definition.render({
      field,
      name: namePrefix ? `${namePrefix}.${field.name}` : field.name,
      namePrefix,
      requestSave: () => setSaveOnChange(true),
    });
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
    if (field.type === "slot") return null;
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
      onSuccess={onSuccess}
      actionButton={actionButton}
      saveOnChange={saveOnChange}
      setSaveOnChange={setSaveOnChange}
      actionButtonClass={actionButtonClass}
      submitTitle={submitTitle}
      submitHoldMs={submitHoldMs}
      hydrateOnEdit={hydrateOnEdit}
      formSchema={formSchema}
      transformToFormValues={transformCallback}
      extraPayload={extraPayload}
      transformPayload={transformPayload}
      preparePayload={preparePayload}
      preventDuplicateSubmit={preventDuplicateSubmit}
      resetOnSuccess={resetOnSuccess}
      skipInvalidate={skipInvalidate}
      onSubmitError={onSubmitError}
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
