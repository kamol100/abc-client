"use client";

import { Form } from "@/components/ui/form";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { cn } from "@/lib/utils";
import { useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import ChangePagination from "@/components/change-pagination";
import FormFilter from "@/components/form-wrapper/form-filter";
import InputField from "@/components/form/input-field";
import { useSidebar } from "@/components/ui/sidebar";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import MyButton from "@/components/my-button";
import { useTableLayoutMode } from "@/context/table-layout-provider";
import { Maximize2, Minimize2 } from "lucide-react";
import { MyDrawer } from "@/components/my-drawer";
import { useFilterForm } from "@/hooks/use-filter-form";
import type { DataTableToolbarOptions } from "@/components/data-table/data-table-toolbar-options";
import type { FieldConfig } from "@/components/form-wrapper/form-builder-type";
import {
  MobileSearchSettingSchema,
  type MobileSearchSetting,
} from "@/components/profiles/staff-account-type";
import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  toolbarOptions?: DataTableToolbarOptions;
  toolbarInfoComponent?: ReactNode;
  toggleColumns?: boolean;
  data: TData[];
  setFilter?: (x: string) => void;
  queryKey?: string;
  form?: any;
  toolbarTitle?: string | null;
  toolbarTitleClass?: string;
  /** Rendered immediately before the column visibility control. */
  toolbarBeforeViewOptions?: ReactNode;
  /** Rendered immediately before the create/edit form trigger (e.g. import). */
  toolbarBeforeForm?: ReactNode;
  /** When true, mobile may replace the filter sheet with the `any` text field. */
  simpleSearch?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  toolbarOptions,
  data,
  toggleColumns = false,
  setFilter = () => { },
  queryKey,
  form,
  toolbarTitle = null,
  toolbarInfoComponent,
  toolbarTitleClass = "",
  toolbarBeforeViewOptions,
  toolbarBeforeForm,
  simpleSearch = false,
}: DataTableToolbarProps<TData>) {
  const FormComponent = form as unknown as React.ComponentType | undefined;
  const isFiltered = table.getState().columnFilters.length > 0;
  const dataForm = useForm<any>();

  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });

  const handleDateSelect = ({ from, to }: { from: Date; to: Date }) => {
    setDateRange({ from, to });
    table.getColumn("date")?.setFilterValue([from, to]);
  };
  const columns = (data: any[], option: string) => {
    const uniqueSet = new Set(data.map((item) => item[option]));
    const column = Array.from(uniqueSet).map((value) => ({
      label: value,
      value: value,
    }));

    return column;
  };
  const { t } = useTranslation();
  const { isMobile } = useSidebar();
  const { isFixed, toggleMode } = useTableLayoutMode();
  const [showFilter, setShowFilter] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [simpleSearchOpen, setSimpleSearchOpen] = useState(false);
  const wantsSimpleSearch = simpleSearch && isMobile;
  const anyFields = useMemo(
    () => anySearchFields(toolbarOptions?.filter),
    [toolbarOptions?.filter],
  );
  const { data: staffAccount, isSuccess: staffAccountLoaded } = useApiQuery<ApiResponse<unknown>>({
    queryKey: ["staff-account"],
    url: "staff-account",
    pagination: false,
    enabled: wantsSimpleSearch,
  });
  const mobileSearch = wantsSimpleSearch && staffAccountLoaded
    ? readMobileSearch(staffAccount?.data)
    : null;
  const simpleSearchActive = mobileSearch?.mode === "simple" && anyFields.length > 0;
  const simpleSearchPinned = mobileSearch?.mode === "simple" && mobileSearch.always_open && anyFields.length > 0;
  const simpleSearchVisible = simpleSearchPinned || (simpleSearchActive && simpleSearchOpen);

  const filterHook = useFilterForm({
    formSchema: toolbarOptions?.filter || [],
    setFilter,
    watchFields: toolbarOptions?.watchFields,
  });

  const { form: filterForm, submitFilter: submitFilterHandler, triggerSubmit: triggerFilterSubmit } = filterHook;

  const handleResetFilter = () => {
    filterForm.reset();
    submitFilterHandler({});
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(!showFilter && "flex  justify-end")}
      >
        <div className="flex flex-1 flex-wrap items-center gap-x-2 w-full">
          {toolbarTitle && !showFilter && !isMobile && (
            <div className={toolbarTitleClass}>{toolbarTitle}</div>
          )}
          {toolbarInfoComponent && !showFilter && !isMobile && toolbarInfoComponent}
          {toolbarOptions?.input_filter && (
            <Form {...dataForm}>
              <InputField placeholder="Filter labels..." name="" />
            </Form>
          )}
          {toolbarOptions?.columns?.map((column: string) => {
            return (
              table.getColumn(column) && (
                <DataTableFacetedFilter
                  key={column}
                  column={table.getColumn(column)}
                  title={column}
                  options={columns(data, column)}
                />
              )
            );
          })}
          {isMobile && !showFilter && (
            <div className="flex justify-between w-full">
              <div>
                <ChangePagination queryKey={queryKey} />
              </div>
            </div>
          )}
          {isFiltered && (
            <MyButton
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2 lg:px-3"
            >
              Reset
              <Cross2Icon className="h-4 w-4" />
            </MyButton>
          )}
        </div>
        <div
          className={cn(!showFilter ? "flex items-center gap-2 ml-3" : "w-full")}
        >
          {!showFilter && toolbarBeforeViewOptions}
          {toggleColumns && !showFilter && <DataTableViewOptions table={table} />}
          {!showFilter && (
            <MyButton
              size="default"
              variant="outline"
              onClick={toggleMode}
              aria-label={isFixed ? "Switch to full layout" : "Switch to fixed layout"}
            >
              {isFixed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </MyButton>
          )}

          {toolbarOptions?.filter && (
            simpleSearchActive ? (
              <MyButton
                action="filter"
                size="default"
                variant="outline"
                disabled={simpleSearchPinned}
                aria-label={t("common.filter")}
                onClick={() => {
                  if (simpleSearchPinned) return;
                  setSimpleSearchOpen((open) => !open);
                }}
              />
            ) : isMobile ? (
              <MyDrawer
                open={filterDrawerOpen}
                onOpenChange={setFilterDrawerOpen}
                trigger={
                  <MyButton
                    action="filter"
                    size="default"
                    variant="outline"
                  />
                }
                title="common.filter"
                side="bottom"
                footer={
                  <div className="flex gap-2 w-full">
                    <MyButton
                      action="reset"
                      onClick={handleResetFilter}
                      variant="outline"
                      className="flex-1"
                      size={'default'}
                      title="common.reset"
                    />
                    <MyButton
                      action="search"
                      size={'default'}
                      icon={true}
                      variant={isFiltered ? "default" : "outline"}
                      onClick={() => {
                        triggerFilterSubmit();
                        setFilterDrawerOpen(false);
                      }}
                      className="flex-1"
                      title="common.apply_filter"
                    />
                  </div>
                }
              >
                <FormFilter
                  formSchema={toolbarOptions.filter}
                  grids={1}
                  setFilter={setFilter}
                  watchFields={toolbarOptions?.watchFields}
                  searchButton
                  forceOpen
                  hideTrigger
                  className="flex flex-col gap-4"
                  formHook={filterHook}
                />
              </MyDrawer>
            ) : (
              <FormFilter
                formSchema={toolbarOptions.filter}
                grids={toolbarOptions.filter.length}
                filterRows={toolbarOptions.filter_row}
                setFilter={setFilter}
                watchFields={toolbarOptions?.watchFields}
                searchButton
                setShowFilter={setShowFilter}
              />
            )
          )}
          {toolbarBeforeForm}
          {FormComponent && !showFilter && <FormComponent />}
        </div>
      </div>
      {isMobile && toolbarInfoComponent && !showFilter && (
        <div className="flex w-full justify-center">
          {toolbarInfoComponent}
        </div>
      )}
      {simpleSearchVisible && (
        <div className="w-full">
          <FormFilter
            formSchema={anyFields}
            grids={1}
            setFilter={setFilter}
            forceOpen
            hideTrigger
            className="w-full"
            formHook={filterHook}
          />
        </div>
      )}
    </div>
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readMobileSearch(account: unknown): MobileSearchSetting | null {
  if (!isRecord(account) || !isRecord(account.settings)) return null;
  const parsed = MobileSearchSettingSchema.safeParse(account.settings.mobile_search);
  return parsed.success ? parsed.data : null;
}

function anySearchFields(fields: FieldConfig[] | undefined): FieldConfig[] {
  return (fields ?? []).filter(
    (field) => field.type === "text" && field.name === "any" && field.watchForFilter === true,
  );
}
