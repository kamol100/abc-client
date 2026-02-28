"use client";

import { Form } from "@/components/ui/form";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
// import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useForm } from "react-hook-form";
import ChangePagination from "../change-pagination";
import FormFilter from "@/components/form-wrapper/form-filter";
import InputField from "../form/input-field";
import { useSidebar } from "../ui/sidebar";
import { DataTableViewOptions } from "./data-table-view-options";
import ActionButton from "../action-button";
import { Table2 } from "lucide-react";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  toolbarOptions?: any;
  toggleColumns?: boolean;
  data: TData[];
  setFilter?: (x: string) => void;
  queryKey?: string;
  form?: any;
  toolbarTitle?: string | null;
  toolbarTitleClass?: string;
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
  toolbarTitleClass = "",
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
  const { isMobile } = useSidebar();
  const [showFilter, setShowFilter] = useState(false);
  return (
    <div
      className={cn(!showFilter && "flex flex-wrap items-center justify-between")}
    >
      <div className="flex flex-1 flex-wrap items-center gap-2 w-full">
        {toolbarTitle && !showFilter && !isMobile && (
          <div className={toolbarTitleClass}>{toolbarTitle}</div>
        )}
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
          <ActionButton
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </ActionButton>
        )}
      </div>
      <div
        className={cn(!showFilter ? "flex items-center gap-2 ml-3" : "w-full")}
      >
        {toggleColumns && !showFilter && <DataTableViewOptions table={table} />}
        {!showFilter && (
          <ActionButton size={"default"} variant="outline" className="ml-auto lg:flex hover:bg-primary hover:text-primary-foreground">
            <Table2 className="mr-2 h-4 w-4" />
          </ActionButton>
        )}

        {toolbarOptions?.filter && (
          <FormFilter
            formSchema={toolbarOptions.filter}
            grids={toolbarOptions?.filter?.length}
            setFilter={setFilter}
            watchFields={toolbarOptions?.watchFields}
            searchButton
            setShowFilter={setShowFilter}
          />
        )}
        {FormComponent && !showFilter && <FormComponent />}
      </div>
    </div>
  );
}
