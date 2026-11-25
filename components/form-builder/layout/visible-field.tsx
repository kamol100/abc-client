"use client";

import { ReactNode, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { hiddenFieldValue, isFieldVisible } from "@/components/form-builder/core/conditions";
import { FormFieldConfig, VisibleWhen } from "@/components/form-wrapper/form-builder-type";

/**
 * Shows a field only while its `visibleWhen` rule passes. While hidden, the field is
 * not drawn and its value is set to the rule's reset value.
 */
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
  const visible = isFieldVisible(visibleWhen, watched);
  const resetValue = hiddenFieldValue(visibleWhen);

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
