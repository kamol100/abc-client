"use client";

import { Fragment, type ReactNode } from "react";
import type { Table } from "@tanstack/react-table";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import InputField from "@/components/form/input-field";
import MyButton from "@/components/my-button";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import type { DataTableToolbarOptions } from "@/components/data-table/data-table-toolbar-options";
import type { ToolbarItem } from "@/components/data-table/toolbar/toolbar-config";

type ToolbarStartProps<TData> = {
  table: Table<TData>;
  data: TData[];
  filter?: DataTableToolbarOptions;
  /** Desktop only. */
  title?: ReactNode;
  titleClassName?: string;
  items: ToolbarItem[];
  isMobile: boolean;
};

/** Left slot: title, page items, client-side faceted filters and their reset. */
export function ToolbarStart<TData>({
  table,
  data,
  filter,
  title,
  titleClassName,
  items,
  isMobile,
}: ToolbarStartProps<TData>) {
  const labelForm = useForm<Record<string, string>>();
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <>
      {title && !isMobile && <div className={titleClassName}>{title}</div>}
      {items.map((item) => (
        <Fragment key={item.key}>{item.node}</Fragment>
      ))}
      {filter?.input_filter && (
        <Form {...labelForm}>
          <InputField placeholder="Filter labels..." name="" />
        </Form>
      )}
      {filter?.columns?.map((column) => {
        const tableColumn = table.getColumn(column);
        return tableColumn ? (
          <DataTableFacetedFilter
            key={column}
            column={tableColumn}
            title={column}
            options={uniqueOptions(data, column)}
          />
        ) : null;
      })}
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
    </>
  );
}

/** True when the start slot renders anything for this device. */
export function hasToolbarStart(
  filter: DataTableToolbarOptions | undefined,
  title: ReactNode,
  items: ToolbarItem[],
  isMobile: boolean,
  isFiltered: boolean,
): boolean {
  return Boolean(
    (title && !isMobile) ||
      items.length > 0 ||
      filter?.input_filter ||
      (filter?.columns?.length ?? 0) > 0 ||
      isFiltered,
  );
}

function uniqueOptions<TData>(data: TData[], key: string) {
  const values = new Set(
    data.map((row) => (row as Record<string, unknown>)[key]),
  );
  return Array.from(values).map((value) => ({
    label: String(value ?? ""),
    value: String(value ?? ""),
  }));
}
