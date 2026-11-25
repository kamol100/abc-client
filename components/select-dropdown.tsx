"use client";

import { FC, useEffect, useMemo, useRef } from "react";
import {
  Control,
  Controller,
  FieldValues,
  RegisterOptions,
  UseFormSetValue,
  get,
  useFormContext,
  useWatch,
} from "react-hook-form";
import { SelectBox } from "@/components/controls/select-box";
import { useSelectOptions } from "@/components/controls/use-select-options";
import { FieldShell, useFieldId } from "@/components/form-builder/fields/field-shell";
import type {
  DropdownPopulate,
  LabelProps,
  SelectOption,
} from "@/components/form-wrapper/form-builder-type";

/** Copies values from the chosen option's API record into other form fields. */
const applyDropdownPopulate = (
  setValue: UseFormSetValue<FieldValues>,
  populate: DropdownPopulate[] | undefined,
  selected: SelectOption | null | undefined,
) => {
  if (!populate?.length || !selected?.meta) return;

  for (const { field, from } of populate) {
    if (!Object.hasOwn(selected.meta, from)) continue;
    setValue(field, selected.meta[from], {
      shouldDirty: true,
      shouldValidate: true,
    });
  }
};

/** Equal as form values: ids compare as text (3 and "3"), lists item by item. */
const sameValue = (left: unknown, right: unknown): boolean => {
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((item, index) => String(item) === String(right[index]))
    );
  }
  const isEmpty = (value: unknown) => value === undefined || value === null || value === "";
  if (isEmpty(left) || isEmpty(right)) return isEmpty(left) && isEmpty(right);
  return String(left) === String(right);
};

type SelectDropdownProps = {
  name: string;
  label?: LabelProps;
  api?: string;
  options?: SelectOption[];
  isMulti?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  placeholder?: string;
  optionValueKey?: string;
  /** Which key of an API record is the option label. Defaults to `name`. */
  optionLabelKey?: string;
  onValueChange?: (value: unknown) => void;
  control?: Control<FieldValues>;
  rules?: RegisterOptions;
  parentFieldName?: string;
  buildApi?: (parentValue: string | number) => string;
  resetOnParentChange?: boolean;
  populate?: DropdownPopulate[];
};

/**
 * The dropdown as a form field: a `SelectBox` bound to React Hook Form, with a label
 * and an error. It adds the two things only a form field can do:
 *   - depend on another field (`parentFieldName` + `buildApi`): options load from an
 *     endpoint built from the parent's value, and the choice is cleared when it changes;
 *   - `populate`: copy values from the chosen record into other fields.
 */
const SelectDropdown: FC<SelectDropdownProps> = ({
  name,
  label,
  api: staticApi,
  options: staticOptions,
  isMulti = false,
  isDisabled = false,
  isLoading = false,
  isClearable = true,
  isSearchable = true,
  placeholder = "common.select_option",
  optionValueKey = "id",
  optionLabelKey = "name",
  onValueChange,
  control: controlProp,
  rules,
  parentFieldName,
  buildApi,
  resetOnParentChange = true,
  populate,
}) => {
  const { control: ctxControl, setValue, getValues, formState } = useFormContext();
  const control = controlProp ?? ctxControl;
  const id = useFieldId(name);
  // The values the form was last filled with (on mount, or when an edit form loaded its record).
  const { defaultValues } = formState;

  // Subscribes to the parent field only, so other fields do not re-render this one.
  const watchedParent = useWatch({
    control,
    name: parentFieldName ?? "",
    disabled: !parentFieldName,
  });
  const parentValue = parentFieldName ? watchedParent : undefined;
  const hasDependency = !!parentFieldName && !!buildApi;
  const parentHasValue = parentValue !== undefined && parentValue !== null && parentValue !== "";

  // With a parent, options come only from `buildApi`, and only once the parent is set.
  const api = useMemo(() => {
    if (hasDependency && parentHasValue) {
      return buildApi(parentValue as string | number);
    }
    return hasDependency ? undefined : staticApi;
  }, [hasDependency, parentHasValue, parentValue, buildApi, staticApi]);

  // Clear this field when the user changes the parent to another value.
  const prevParentRef = useRef(parentValue);
  useEffect(() => {
    if (!hasDependency || !parentFieldName) return;
    const prevParent = prevParentRef.current;
    prevParentRef.current = parentValue;

    if (prevParent === undefined) return;
    if (String(prevParent) === String(parentValue)) return;

    // The form was just filled (an edit record arrived): parent and child both hold
    // the values they were filled with, so they belong together. Keep the child.
    const filledTogether =
      sameValue(parentValue, get(defaultValues, parentFieldName)) &&
      sameValue(getValues(name), get(defaultValues, name));
    if (filledTogether) return;

    if (resetOnParentChange) {
      setValue(name, isMulti ? [] : null, { shouldValidate: true });
    }
  }, [parentValue, hasDependency, parentFieldName, resetOnParentChange, name, isMulti, setValue, getValues, defaultValues]);

  const { options, isLoading: isApiLoading, loadFailed, reload } = useSelectOptions({
    name,
    api,
    staticOptions,
    optionValueKey,
    optionLabelKey,
  });

  return (
    <FieldShell name={name} label={label} labelFor={id} labelBoxClassName="mb-2" className="">
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <SelectBox
            id={id}
            value={value}
            options={options}
            isMulti={isMulti}
            isSearchable={isSearchable}
            isClearable={isClearable}
            isDisabled={isDisabled || (hasDependency && !parentHasValue)}
            isLoading={isLoading || isApiLoading}
            placeholder={placeholder}
            hasError={Boolean(error)}
            loadFailed={loadFailed}
            onReload={reload}
            onChange={(nextValue, selected) => {
              onChange(nextValue);
              onValueChange?.(nextValue);
              if (!isMulti) applyDropdownPopulate(setValue, populate, selected);
            }}
          />
        )}
      />
    </FieldShell>
  );
};

export default SelectDropdown;
