"use client";

/**
 * Filter for the map pages.
 *
 * Desktop: the fields in a card above the map.
 * Mobile: a filter button that opens the same bottom sheet as list tables,
 * so the fields never get squeezed under the map.
 */

import { useTranslation } from "react-i18next";
import FormFilter from "@/components/form-wrapper/form-filter";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import { ToolbarFilterDrawer } from "@/components/data-table/toolbar/toolbar-filter";
import { useSidebar } from "@/components/ui/sidebar";
import { useFilterForm } from "@/hooks/use-filter-form";

type MapFilterProps = {
  /** Keep this stable (useMemo); the filter form is built from it. */
  formSchema: FieldConfig[];
  /** Desktop columns. */
  grids: number;
  /** Current query string; drives the "filtered" state of the mobile sheet. */
  filterValue: string | null;
  setFilter: (query: string) => void;
  /** Mobile only: text shown next to the filter button. */
  title?: string;
};

export default function MapFilter({ formSchema, grids, filterValue, setFilter, title }: MapFilterProps) {
  const { t } = useTranslation();
  const { isMobile } = useSidebar();
  const filterHook = useFilterForm({ formSchema, setFilter });

  if (!isMobile) {
    return (
      <div className="shrink-0 rounded-md border border-border bg-card p-3">
        <FormFilter
          formSchema={formSchema}
          grids={grids}
          setFilter={setFilter}
          searchButton
          forceOpen
          formHook={filterHook}
        />
      </div>
    );
  }

  return (
    <div className="flex shrink-0 items-center justify-between gap-2">
      <span className="min-w-0 truncate text-sm font-semibold">{title ? t(title) : null}</span>
      <ToolbarFilterDrawer
        options={{ filter: formSchema }}
        filterHook={filterHook}
        setFilter={setFilter}
        isFiltered={Boolean(filterValue)}
        onReset={filterHook.resetFilter}
      />
    </div>
  );
}
