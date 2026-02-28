"use client";

import { Form } from "@/components/ui/form";
import { useFilterForm } from "@/hooks/use-filter-form";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import { useState } from "react";
import ActionButton from "@/components/action-button";
import InputField from "@/components/form/input-field";
import { Close } from "@/components/icon";
import { FieldConfig, GRID_STYLES } from "@/components/form-wrapper/form-builder-type";

const SelectDropdown = dynamic(() => import("@/components/select-dropdown"));

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

const FormFilter = ({
  formSchema,
  grids = 1,
  gridGap = "gap-3",
  setShowFilter = () => { },
  watchFields,
  searchButton = false,
  defaultFilter,
  setFilter = () => { },
  className = "h-9",
}: FormFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    form,
    hasManualSearchFields,
    triggerSubmit,
    clearField,
    submitFilter,
  } = useFilterForm({ formSchema, setFilter, watchFields, defaultFilter });

  const handleToggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    setShowFilter(next);
  };

  const showSearchButton = searchButton && hasManualSearchFields && isOpen;

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
    return null;
  };

  return (
    <div className={cn("flex-none md:flex lg:flex gap-3", className)}>
      {isOpen && (
        <div className="w-full">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(submitFilter)}
              className="flex w-full"
            >
              <div
                className={cn(
                  "w-full grid ",
                  gridGap,
                  GRID_STYLES[grids],
                )}
              >
                {formSchema.map((field, index) => (
                  <div key={field.name ?? index}>
                    {field.permission !== false ? renderField(field) : null}
                  </div>
                ))}
              </div>
            </form>
          </Form>
        </div>
      )}
      <div>
        <div className="flex justify-between flex-row-reverse md:flex-row lg:flex-row gap-2">
          {showSearchButton && (
            <ActionButton
              action="search"
              size="default"
              onClick={triggerSubmit}
            />
          )}
          <ActionButton
            action="filter"
            size="default"
            variant={isOpen ? "default" : "outline"}
            onClick={handleToggle}
          />
        </div>
      </div>

    </div>
  );
};

export default FormFilter;
