"use client";

import { Fragment, type ReactNode } from "react";
import type { Table } from "@tanstack/react-table";
import { Maximize2, Minimize2 } from "lucide-react";
import MyButton from "@/components/my-button";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { useTableLayoutMode } from "@/context/table-layout-provider";
import type { ToolbarItem } from "@/components/data-table/toolbar/toolbar-config";

type ToolbarActionsProps<TData> = {
  table: Table<TData>;
  /** The page's `end` items: always first. */
  items: ToolbarItem[];
  columns: boolean;
  layoutToggle: boolean;
  /** Filter control for this device (desktop trigger, drawer, simple search). */
  filter?: ReactNode;
  add?: ReactNode;
};

/**
 * Right slot. Built-in features always follow the page's items, in this
 * order: page items, columns, fixed/full layout, filter, add.
 */
export function ToolbarActions<TData>({ table, items, columns, layoutToggle, filter, add }: ToolbarActionsProps<TData>) {
  const { isFixed, toggleMode } = useTableLayoutMode();

  return (
    <>
      {items.map((item) => (
        <Fragment key={item.key}>{item.node}</Fragment>
      ))}
      {columns && <DataTableViewOptions table={table} />}
      {layoutToggle && (
        <MyButton
          size="default"
          variant="outline"
          onClick={toggleMode}
          aria-label={isFixed ? "Switch to full layout" : "Switch to fixed layout"}
        >
          {isFixed ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
        </MyButton>
      )}
      {filter}
      {add}
    </>
  );
}
