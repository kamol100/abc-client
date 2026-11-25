"use client";

import { ReactNode, useEffect } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import {
  hiddenFieldValue,
  isFieldVisible,
  resolveFieldPath,
} from "@/components/form-builder/core/conditions";
import { FormFieldConfig, VisibleWhen } from "@/components/form-wrapper/form-builder-type";

/**
 * Shows a field only while its `visibleWhen` rule passes. While hidden, the field is
 * not drawn and its value is set to the rule's reset value.
 */
const ConditionalFormField = ({
  field,
  visibleWhen,
  namePrefix,
  children,
}: {
  field: FormFieldConfig;
  visibleWhen: VisibleWhen;
  namePrefix?: string;
  children: ReactNode;
}) => {
  const { getValues, setValue } = useFormContext();
  const name = resolveFieldPath(namePrefix, field.name);
  const watched = useWatch({ name: resolveFieldPath(namePrefix, visibleWhen.field) });
  const visible = isFieldVisible(visibleWhen, watched);
  const resetValue = hiddenFieldValue(visibleWhen);

  useEffect(() => {
    if (visible) return;
    if (Object.is(getValues(name), resetValue)) return;
    setValue(name, resetValue, {
      shouldValidate: false,
      shouldDirty: false,
      shouldTouch: false,
    });
  }, [visible, name, resetValue, getValues, setValue]);

  if (!visible) return null;

  return <div className={field.className}>{children}</div>;
};

/**
 * The wrapper around every field: applies `permission`, `className` and `visibleWhen`.
 * Inside a row of a field array, pass the row's path as `namePrefix` so the rule
 * reads and resets the fields of that row.
 */
export const VisibleFormField = ({
  field,
  namePrefix,
  children,
}: {
  field: FormFieldConfig;
  /** The path of the row the field sits in (`items.2`). Leave out at the top level. */
  namePrefix?: string;
  children: ReactNode;
}) => {
  if (field.permission === false) return null;
  if (!field.visibleWhen) {
    return <div className={field.className}>{children}</div>;
  }

  return (
    <ConditionalFormField field={field} visibleWhen={field.visibleWhen} namePrefix={namePrefix}>
      {children}
    </ConditionalFormField>
  );
};
