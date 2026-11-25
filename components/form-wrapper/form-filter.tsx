"use client";

import { Form } from "@/components/ui/form";
import { useFilterForm } from "@/hooks/use-filter-form";
import { cn } from "@/lib/utils";
import { useState, useMemo, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import DisplayCount from "@/components/display-count";
import MyButton from "@/components/my-button";
import { FieldConfig, GRID_STYLES } from "@/components/form-wrapper/form-builder-type";
import { fieldDefinitionOf } from "@/components/form-builder/fields/registry";
import {
  FILTER_ITEM_CLASS,
  FILTER_ROW_CLASS,
  splitFilterFields,
  visibleFilterFields,
} from "@/components/data-table/filter-layout";

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
  /** Matching row count. Shown at the start of the open filter row. */
  resultCount?: number;
  /** Stays in the filter action row while the fields are open. */
  endAction?: ReactNode;
  /**
   * No top margin. The table toolbar uses it so the open filter row is exactly as
   * tall as the closed toolbar and the table below does not jump.
   */
  flush?: boolean;
  /** Replaces the field grid's classes (columns and gap). Used by the filter panel. */
  fieldsClassName?: string;
};

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
  resultCount,
  endAction,
  flush = false,
  fieldsClassName,
}: FormFilterProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(forceOpen);

  const internalHook = useFilterForm({ formSchema, setFilter, watchFields, defaultFilter });
  const {
    form,
    hasManualSearchFields,
    triggerSubmit,
    clearField,
    submitFilter,
    resetFilter,
  } = formHook || internalHook;

  const values = form.watch();
  const isFilterActive = useMemo(() => {
    return Object.values(values).some(value => value && value.toString().length > 0);
  }, [values]);

  const handleReset = resetFilter;

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
  // Nothing to show on the right (e.g. the filter panel): leave the slot out, so it adds no gap.
  const hasActions = showSearchButton || !hideTrigger || endAction != null;

  // How each type is drawn in a filter lives in `components/form-builder/fields/`.
  // A type with no filter version draws nothing.
  const renderField = (field: FieldConfig) =>
    fieldDefinitionOf(field.type)?.renderFilter?.({
      field,
      value: form.watch(field.name) ?? "",
      onValueChange: triggerSubmit,
      onClear: clearField,
    }) ?? null;

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
      <div className={fieldsClassName ?? cn("w-full grid ", gridGap, GRID_STYLES[grids])}>
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
        rowCount != null && "h-auto min-w-0 items-start",
        rowCount != null && !flush && "mt-1",
        rowCount != null && fieldsOpen && "w-full",
        className ?? (rowCount != null ? undefined : cn(!flush && "mt-1", "h-9 !ml-[1px]")),
      )}
    >
      {fieldsOpen && (
        <div className={cn(
          "flex min-w-0 flex-1 gap-2",
          rowCount != null ? "items-start" : "items-center",
        )}>
          {hasResultCount(resultCount) && (
            <FilterResultCount count={resultCount} label={t("common.results")} />
          )}
          <div className="min-w-0 flex-1">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(submitFilter)}
                className={cn("flex w-full", rowCount != null && "min-w-0")}
              >
                {renderFilterFields()}
              </form>
            </Form>
          </div>
        </div>
      )}
      {hasActions && (
      <div className="shrink-0 self-start">
        <div
          className="flex flex-row-reverse justify-between gap-2 md:flex-row lg:flex-row"
          data-filter-actions
        >
          {showSearchButton && (
            <MyButton
              action="search"
              aria-label={t("common.search")}
              size="icon"
              onClick={triggerSubmit}
            />
          )}
          {!hideTrigger && isOpen && (
            <MyButton
              action="reset"
              aria-label={t("common.reset")}
              size="icon"
              variant={isFilterActive ? "default" : "outline"}
              onClick={handleReset}
            />
          )}
          <MyButton
            action="filter"
            aria-label={t("common.filter")}
            size="icon"
            variant={isOpen ? "default" : "outline"}
            onClick={handleToggle}
            className={hideTrigger ? "hidden" : ""}
            hidden={hideTrigger}
          />
          {endAction}
        </div>
      </div>
      )}

    </div>
  );
};

function hasResultCount(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function FilterResultCount({ count, label }: { count: number; label: string }) {
  return (
    <span
      data-testid="filter-result-count"
      className="inline-flex h-9 shrink-0 items-center rounded-full border border-border bg-background px-3 text-sm font-medium text-foreground"
    >
      <span className="sr-only">{label}</span>
      <DisplayCount amount={count} />
    </span>
  );
}

export default FormFilter;
