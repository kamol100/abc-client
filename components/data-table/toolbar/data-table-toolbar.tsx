"use client";

import { Fragment, useId, useState, type ReactNode } from "react";
import type { Table } from "@tanstack/react-table";
import ChangePagination from "@/components/change-pagination";
import FormFilter from "@/components/form-wrapper/form-filter";
import { useSidebar } from "@/components/ui/sidebar";
import { SettingsButton } from "@/components/settings/ui/settings-button";
import { useOptionalSettings } from "@/context/app-provider";
import { useFilterForm } from "@/hooks/use-filter-form";
import {
  filterPositionKey,
  listSettingsSection,
  toFilterPosition,
  type FilterPosition,
} from "@/components/data-table/toolbar/list-pages";
import {
  renderAdd,
  visibleItems,
  type DataTableToolbarConfig,
  type ToolbarItem,
} from "@/components/data-table/toolbar/toolbar-config";
import { ToolbarLayout } from "@/components/data-table/toolbar/toolbar-layout";
import { ToolbarStart, hasToolbarStart } from "@/components/data-table/toolbar/toolbar-start";
import { ToolbarActions } from "@/components/data-table/toolbar/toolbar-actions";
import {
  ToolbarFilterDrawer,
  ToolbarFilterPanel,
  ToolbarFilterReset,
  ToolbarFilterRow,
  ToolbarFilterTrigger,
  ToolbarSimpleSearchTrigger,
} from "@/components/data-table/toolbar/toolbar-filter";
import { useMobileSimpleSearch } from "@/components/data-table/toolbar/use-mobile-simple-search";

export type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  data: TData[];
  config: DataTableToolbarConfig;
  setFilter?: (query: string) => void;
  queryKey?: string;
  resultCount?: number;
};

/**
 * Reads a `DataTableToolbarConfig`, owns toolbar state (filter open, mobile
 * simple search) and hands each piece to `ToolbarLayout`. It never decides
 * positions itself.
 */
export function DataTableToolbar<TData>({
  table,
  data,
  config,
  setFilter = () => {},
  queryKey,
  resultCount,
}: DataTableToolbarProps<TData>) {
  const { isMobile } = useSidebar();
  const settings = useOptionalSettings();
  const panelId = useId();
  const [filterOpen, setFilterOpen] = useState(false);
  const isFiltered = table.getState().columnFilters.length > 0;
  const features = config.features ?? {};
  const filter = features.filter;
  const page = config.page ?? null;

  // The list page's company setting picks where the desktop filter opens. Mobile always uses the sheet.
  const position: FilterPosition =
    page && !isMobile ? toFilterPosition(settings?.[filterPositionKey(page)]) : "inline";
  const usePanel = position === "below" && Boolean(filter?.filter);

  const filterHook = useFilterForm({
    formSchema: filter?.filter || [],
    setFilter,
    watchFields: filter?.watchFields,
    defaultValues: filter?.defaultValues,
    // The panel has no Search button, so every field applies as it changes.
    autoApply: usePanel,
  });
  const simple = useMobileSimpleSearch({
    enabled: Boolean(filter?.simpleSearch) && isMobile,
    filter: filter?.filter,
  });

  const resetFilter = filterHook.resetFilter;

  // Closing the desktop filter (row or panel) clears an active filter, as it does today.
  const handleFilterOpenChange = (open: boolean) => {
    if (!open && changedFromDefaults(filterHook.form.getValues(), filter?.defaultValues)) resetFilter();
    setFilterOpen(open);
  };

  const filterOptions = filter?.filter ? { ...filter, filter: filter.filter } : null;

  const filterChanged = changedFromDefaults(filterHook.form.watch(), filter?.defaultValues);

  let filterControl: ReactNode = null;
  let filterReset: ReactNode = null;
  if (filterOptions) {
    if (isMobile && simple.active) {
      filterControl = <ToolbarSimpleSearchTrigger pinned={simple.pinned} onToggle={simple.toggle} />;
    } else if (isMobile) {
      filterControl = (
        <ToolbarFilterDrawer
          options={filterOptions}
          filterHook={filterHook}
          setFilter={setFilter}
          resultCount={resultCount}
          isFiltered={isFiltered}
          onReset={resetFilter}
        />
      );
    } else if (usePanel) {
      filterControl = (
        <ToolbarFilterTrigger
          open={filterOpen}
          controls={panelId}
          onClick={() => handleFilterOpenChange(!filterOpen)}
        />
      );
      if (filterOpen) filterReset = <ToolbarFilterReset onReset={resetFilter} active={filterChanged} />;
    } else {
      filterControl = <ToolbarFilterTrigger onClick={() => handleFilterOpenChange(true)} />;
    }
  }

  // On mobile, "row" items leave their slot for their own full-width row.
  const start = visibleItems(config.start, isMobile);
  const center = visibleItems(config.center, isMobile);
  const end = visibleItems(config.end, isMobile);
  const inSlot = (items: ToolbarItem[]) =>
    isMobile ? items.filter((item) => item.mobile !== "row" && item.mobile !== "actions") : items;
  // On mobile, start/center items marked "actions" join the actions row, before the end items.
  const toActions = isMobile ? [...start, ...center].filter((item) => item.mobile === "actions") : [];
  const mobileRows = isMobile
    ? [...start, ...center, ...end].filter((item) => item.mobile === "row")
    : [];

  const startItems = inSlot(start);
  const centerItems = inSlot(center);
  const endItems = [...toActions, ...inSlot(end)];
  const filterRowItems = endItems.filter((item) => item.inFilterRow !== false);
  const filterOpenCenterItems = centerItems.filter((item) => item.inFilterRow !== false);
  // The add slot (after the filter button) stays at the end of the open filter row too.
  const addNode = renderAdd(features.add);
  const filterRowEnd =
    filterRowItems.length > 0 || addNode ? (
      <>
        {renderItems(filterRowItems)}
        {addNode}
      </>
    ) : undefined;
  const showStart = hasToolbarStart(filter, config.title, startItems, isMobile, isFiltered);

  return (
    <ToolbarLayout
      isMobile={isMobile}
      start={
        showStart ? (
          <ToolbarStart
            table={table}
            data={data}
            filter={filter}
            title={config.title}
            titleClassName={config.titleClassName}
            items={startItems}
            isMobile={isMobile}
          />
        ) : undefined
      }
      center={centerItems.length > 0 ? renderItems(centerItems) : undefined}
      end={
        <ToolbarActions
          table={table}
          items={endItems.filter((item) => !item.onlyInFilterRow)}
          columns={features.columns ?? false}
          layoutToggle={features.layoutToggle ?? true}
          settings={page ? <SettingsButton section={listSettingsSection(page)} /> : null}
          filterReset={filterReset}
          filter={filterControl}
          add={addNode}
        />
      }
      mobileLead={<ChangePagination queryKey={queryKey} />}
      mobileRows={mobileRows}
      mobileActions={config.mobileActions}
      expanded={
        !isMobile && !usePanel && filterOpen && filterOptions ? (
          <>
            {/* Center items (e.g. a running total) stay visible above the open filter. */}
            {filterOpenCenterItems.length > 0 && (
              <div className="flex items-center justify-center gap-2" data-toolbar-slot="center">
                {renderItems(filterOpenCenterItems)}
              </div>
            )}
            <ToolbarFilterRow
              options={filterOptions}
              filterHook={filterHook}
              setFilter={setFilter}
              resultCount={resultCount}
              onOpenChange={handleFilterOpenChange}
              endAction={filterRowEnd}
            />
          </>
        ) : undefined
      }
      panel={
        !isMobile && usePanel && filterOptions ? (
          <ToolbarFilterPanel options={filterOptions} filterHook={filterHook} setFilter={setFilter} />
        ) : undefined
      }
      panelOpen={filterOpen}
      panelId={panelId}
      below={
        isMobile && simple.visible ? (
          <FormFilter
            formSchema={simple.fields}
            grids={1}
            setFilter={setFilter}
            forceOpen
            hideTrigger
            className="w-full"
            formHook={filterHook}
            resultCount={resultCount}
          />
        ) : undefined
      }
    />
  );
}

function renderItems(items: ToolbarItem[]): ReactNode {
  return items.map((item) => <Fragment key={item.key}>{item.node}</Fragment>);
}

/** True when any field holds something other than its default (empty when no default). */
function changedFromDefaults(values: Record<string, unknown>, defaults: Record<string, unknown> = {}): boolean {
  const text = (value: unknown) => (value == null ? "" : String(value));
  return Object.keys({ ...defaults, ...values }).some((key) => text(values[key]) !== text(defaults[key]));
}
