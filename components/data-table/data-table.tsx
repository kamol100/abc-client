"use client";

import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { usePathname } from "next/navigation";
import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useTableLayoutMode } from "@/context/table-layout-provider";
import { cn } from "@/lib/utils";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { DataTableToolbar } from "@/components/data-table/toolbar/data-table-toolbar";
import type { DataTableToolbarConfig } from "@/components/data-table/toolbar/toolbar-config";
import { usePersistedColumnVisibility } from "@/components/data-table/use-persisted-column-visibility";
import { useTranslation } from "react-i18next";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    className?: string;
  }
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /**
   * Toolbar content: title, start/center/end items and built-in features.
   * `false` hides the toolbar; `true` (default) shows only the built-ins.
   */
  toolbar?: boolean | DataTableToolbarConfig;
  pagination?: Pagination;
  setCurrentPage?: (page: number) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  setFilter?: (x: string) => void;
  queryKey?: string;
  initialColumnVisibility?: VisibilityState;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  toolbar = true,
  pagination: paginationData = undefined,
  setCurrentPage = () => { },
  isFetching = false,
  isLoading = false,
  setFilter = () => { },
  queryKey,
  initialColumnVisibility,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const { t } = useTranslation();
  const pathname = usePathname();
  const toolbarConfig: DataTableToolbarConfig = typeof toolbar === "object" ? toolbar : {};
  // Column choices are saved only when the column menu is on.
  const columnsEnabled = toolbarConfig.features?.columns === true;
  const { columnVisibility, onColumnVisibilityChange, hasResolvedVisibility } =
    usePersistedColumnVisibility({
      enabled: columnsEnabled,
      pathname: pathname ?? "",
      queryKey,
      columns,
      initialColumnVisibility,
    });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const serverPaginated = paginationData !== undefined;
  const declaredPageSize = paginationData?.per_page ?? 20;
  const pageSize = serverPaginated
    ? Math.max(data.length, declaredPageSize)
    : declaredPageSize;
  const pagination = React.useMemo<PaginationState>(
    () => ({ pageIndex: 0, pageSize }),
    [pageSize],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    enableRowSelection: true,
    manualPagination: serverPaginated,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    ...(serverPaginated ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const { isFixed } = useTableLayoutMode();

  const showSkeleton =
    !hasResolvedVisibility || isLoading || (isFetching && data.length === 0);
  const visibleColumnCount = table.getVisibleFlatColumns().length || columns.length;

  return (
    <div className={cn("flex flex-col", isFixed && "flex-1 min-h-0")}>
      {toolbar && (
        <div className="shrink-0 pb-3">
          <DataTableToolbar
            table={table}
            data={data}
            config={toolbarConfig}
            setFilter={setFilter}
            queryKey={queryKey}
            resultCount={paginationData?.total}
          />
        </div>
      )}

      <div
        data-table-scroll-container
        className={cn(
          "rounded-md border border-border",
          isFixed ? "flex flex-col flex-1 min-h-0 overflow-auto" : "flex flex-col"
        )}
      >
        {showSkeleton ? (
          <DataTableSkeleton
            rows={pagination.pageSize}
            columns={visibleColumnCount}
          />
        ) : (
          <Table>
            <TableHeader
              className={cn(
                "bg-muted/90 backdrop-blur-xs",
                isFixed && "sticky top-0 z-10"
              )}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className={header.column.columnDef.meta?.className}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody tabIndex={0}>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={cell.column.columnDef.meta?.className}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {t("data_table.no_results")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {paginationData && (
        <div
          className={cn(
            "shrink-0 py-3 bg-background",
            isFixed && "sticky bottom-0"
          )}
        >
          <DataTablePagination
            pagination={paginationData}
            setCurrentPage={setCurrentPage}
            queryKey={queryKey}
          />
        </div>
      )}
    </div>
  );
}
