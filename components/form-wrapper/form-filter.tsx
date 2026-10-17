"use client";

import { Form } from "@/components/ui/form";
import { useFilterForm } from "@/hooks/use-filter-form";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";
import MyButton from "@/components/my-button";
import InputField from "@/components/form/input-field";
import DatePicker from "@/components/form/DatePicker";
import { Close } from "@/components/icon";
import { FieldConfig, GRID_STYLES } from "@/components/form-wrapper/form-builder-type";
import {
  FILTER_ITEM_CLASS,
  FILTER_ROW_CLASS,
  splitFilterFields,
  visibleFilterFields,
} from "@/components/data-table/filter-layout";

const SelectDropdown = dynamic(() => import("@/components/select-dropdown"), {
  loading: () => null,
});

type FormFilterProps = {
  formSchema: FieldConfig[];
  setFilter?: (query: string) => void;
  watchFields?: string[];
  grids?: number;
  gridGap?: string;
  defaultFilter?: string;
  searchButton?: boolean;
  setShowFilter?: (show: boolean) => void;
  className?: string;
  forceOpen?: boolean;
  hideTrigger?: boolean;
  formHook?: ReturnType<typeof useFilterForm>;
  /** How many flexible rows to use. Omitted keeps the single `grids` row. */
  filterRows?: number;
};

function FilterTextField({
  field,
  onClear,
  fieldValue,
}: {
  field: FieldConfig;
  onClear: (name: string) => void;
  fieldValue: string;
}) {
  return (
    <div className="relative">
      <InputField
        name={field.name}
        label={field.label}
        placeholder={field.placeholder}
        type={field.type}
      />
      {fieldValue && (
        <button
          type="button"
          className="absolute top-1 right-0 cursor-pointer p-2 text-muted-foreground hover:text-foreground"
          onClick={() => onClear(field.name)}
        >
          <Close />
        </button>
      )}
    </div>
  );
}

function FilterDropdownField({
  field,
  onValueChange,
}: {
  field: FieldConfig & { type: "dropdown" };
  onValueChange: () => void;
}) {
  return (
    <SelectDropdown
      name={field.name}
      label={field.label}
      placeholder={field.placeholder}
      api={field.api}
      options={field.options}
      isMulti={field.isMulti}
      isDisabled={field.isDisabled}
      isClearable={field.isClearable}
      onValueChange={onValueChange}
    />
  );
}

function FilterDateField({
  field,
  onValueChange,
}: {
  field: FieldConfig & { type: "date" | "dateRange" };
  onValueChange: () => void;
}) {
  return (
    <DatePicker
      name={field.name}
      placeholder={field.placeholder}
      mode={field.type === "dateRange" ? "range" : "single"}
      closeOnSelectDate={field.closeOnSelectDate}
      onValueChange={onValueChange}
    />
  );
}

const FormFilter = ({
  formSchema,
  grids = 1,
  gridGap = "gap-3",
  setShowFilter = () => { },
  watchFields,
  searchButton = false,
  defaultFilter,
  setFilter = () => { },
  className,
  forceOpen = false,
  hideTrigger = false,
  formHook,
  filterRows,
}: FormFilterProps) => {
  const [isOpen, setIsOpen] = useState(forceOpen);

  const internalHook = useFilterForm({ formSchema, setFilter, watchFields, defaultFilter });
  const {
    form,
    hasManualSearchFields,
    triggerSubmit,
    clearField,
    submitFilter,
  } = formHook || internalHook;

  const values = form.watch();
  const isFilterActive = useMemo(() => {
    return Object.values(values).some(value => value && value.toString().length > 0);
  }, [values]);

  const handleReset = () => {
    form.reset();
    submitFilter({});
  };

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    setShowFilter(next);

    const fieldsWillHide = !next && !forceOpen;
    if (fieldsWillHide && isFilterActive) {
      handleReset();
    }
  };

  const showSearchButton = searchButton && hasManualSearchFields && (isOpen || forceOpen);

  const renderField = (field: FieldConfig) => {
    if (field.type === "text" || field.type === "email" || field.type === "number") {
      return (
        <FilterTextField
          field={field}
          onClear={clearField}
          fieldValue={form.watch(field.name) ?? ""}
        />
      );
    }
    if (field.type === "dropdown") {
      return (
        <FilterDropdownField
          field={field}
          onValueChange={triggerSubmit}
        />
      );
    }
    if (field.type === "date" || field.type === "dateRange") {
      return <FilterDateField field={field} onValueChange={triggerSubmit} />;
    }
    return null;
  };

  const fields = visibleFilterFields(formSchema);
  const rowCount = typeof filterRows === "number" && filterRows >= 1 ? Math.floor(filterRows) : undefined;
  const fieldsOpen = isOpen || forceOpen;

  const renderFilterFields = () => {
    if (rowCount != null) {
      return (
        <div className="flex w-full min-w-0 flex-col gap-3">
          {splitFilterFields(fields, rowCount).map((row, rowIndex) => (
            <div key={rowIndex} className={FILTER_ROW_CLASS}>
              {row.map((field, index) => (
                <div key={field.name ?? index} className={FILTER_ITEM_CLASS}>
                  {renderField(field)}
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={cn("w-full grid ", gridGap, GRID_STYLES[grids])}>
        {formSchema.map((field, index) => {
          if (field.permission === false) return null;
          return (
            <div key={field.name ?? index}>
              {renderField(field)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "flex-none gap-3 md:flex lg:flex",
        rowCount != null && "mt-1 h-auto min-w-0 items-start",
        rowCount != null && fieldsOpen && "w-full",
        className ?? (rowCount != null ? undefined : "mt-1 h-9 !ml-[1px]"),
      )}
    >
      {fieldsOpen && (
        <div className={cn("w-full", rowCount != null && "min-w-0")}>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(submitFilter)}
              className={cn("flex w-full", rowCount != null && "min-w-0")}
            >
              {renderFilterFields()}
            </form>
          </Form>
        </div>
      )}
      <div>
        <div className="flex justify-between flex-row-reverse md:flex-row lg:flex-row gap-2">
          {showSearchButton && (
            <MyButton
              action="search"
              size="default"
              onClick={triggerSubmit}
            />
          )}
          {!hideTrigger && isOpen && (
            <MyButton
              action="reset"
              size="default"
              variant={isFilterActive ? "default" : "outline"}
              onClick={handleReset}
            />
          )}
          <MyButton
            action="filter"
            size="default"
            variant={isOpen ? "default" : "outline"}
            onClick={handleToggle}
            className={hideTrigger ? "hidden" : ""}
          />
        </div>
      </div>

    </div>
  );
};

export default FormFilter;
