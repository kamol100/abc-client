"use client";

import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import FormFilter from "@/components/form-wrapper/form-filter";
import MyButton from "@/components/my-button";
import { MyDrawer } from "@/components/my-drawer";
import type { DataTableToolbarOptions } from "@/components/data-table/data-table-toolbar-options";
import type { useFilterForm } from "@/hooks/use-filter-form";

type FilterHook = ReturnType<typeof useFilterForm>;
type FilterOptions = DataTableToolbarOptions & { filter: NonNullable<DataTableToolbarOptions["filter"]> };

type BaseProps = {
  options: FilterOptions;
  filterHook: FilterHook;
  setFilter: (query: string) => void;
  resultCount?: number;
};

/** Desktop, closed: just the button that opens the filter row. */
export function ToolbarFilterTrigger({ onOpen }: { onOpen: () => void }) {
  const { t } = useTranslation();
  return (
    <MyButton
      action="filter"
      size="icon"
      variant="outline"
      className="shrink-0"
      aria-label={t("common.filter")}
      onClick={onOpen}
    />
  );
}

/**
 * Desktop, open: the filter row that replaces the toolbar. The page's end
 * actions stay reachable at the end of the row.
 */
export function ToolbarFilterRow({
  options,
  filterHook,
  setFilter,
  resultCount,
  onOpenChange,
  endAction,
}: BaseProps & { onOpenChange: (open: boolean) => void; endAction?: ReactNode }) {
  return (
    <div className="w-full">
      <FormFilter
        formSchema={options.filter}
        grids={options.filter.length}
        filterRows={options.filter_row}
        setFilter={setFilter}
        watchFields={options.watchFields}
        searchButton
        forceOpen
        formHook={filterHook}
        setShowFilter={onOpenChange}
        resultCount={resultCount}
        endAction={endAction}
        flush
      />
    </div>
  );
}

/** Mobile: bottom-sheet filter, unchanged from the current toolbar. */
export function ToolbarFilterDrawer({ options, filterHook, setFilter, resultCount, isFiltered, onReset }: BaseProps & {
  isFiltered: boolean;
  onReset: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <MyDrawer
      open={open}
      onOpenChange={setOpen}
      trigger={
        <MyButton action="filter" size="icon" variant="outline" className="shrink-0" aria-label={t("common.filter")} />
      }
      title="common.filter"
      side="bottom"
      footer={
        <div className="flex w-full gap-2">
          <MyButton
            action="reset"
            onClick={onReset}
            variant="outline"
            className="flex-1"
            size="default"
            title="common.reset"
          />
          <MyButton
            action="search"
            size="default"
            icon={true}
            variant={isFiltered ? "default" : "outline"}
            onClick={() => {
              filterHook.triggerSubmit();
              setOpen(false);
            }}
            className="flex-1"
            title="common.apply_filter"
          />
        </div>
      }
    >
      <FormFilter
        formSchema={options.filter}
        grids={1}
        setFilter={setFilter}
        watchFields={options.watchFields}
        searchButton
        forceOpen
        hideTrigger
        className="flex flex-col gap-4"
        formHook={filterHook}
        resultCount={resultCount}
      />
    </MyDrawer>
  );
}

/** Mobile simple search: toggles the single `any` field under the toolbar. */
export function ToolbarSimpleSearchTrigger({ pinned, onToggle }: { pinned: boolean; onToggle: () => void }) {
  const { t } = useTranslation();
  return (
    <MyButton
      action="filter"
      size="icon"
      variant="outline"
      className="shrink-0"
      disabled={pinned}
      aria-label={t("common.filter")}
      onClick={onToggle}
    />
  );
}
