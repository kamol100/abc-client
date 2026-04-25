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
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useTranslation } from "react-i18next";
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  toolbar?: boolean;
  toolbarOptions?: any;
  toggleColumns?: boolean;
  pagination?: Pagination;
  setCurrentPage?: (page: number) => void;
  isLoading?: boolean;
  isFetching?: boolean;
  setFilter?: (x: string) => void;
  queryKey?: string;
  form?: any;
  toolbarTitle?: string | null;
  toolbarTitleClass?: string;
  initialColumnVisibility?: VisibilityState;
  toolbarBeforeForm?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  toolbar = true,
  toolbarOptions,
  toggleColumns = false,
  pagination: paginationData = undefined,
  setCurrentPage = () => { },
  isFetching = false,
  isLoading = false,
  setFilter = () => { },
  queryKey,
  form,
  toolbarTitle = null,
  toolbarTitleClass = "",
  initialColumnVisibility,
  toolbarBeforeForm,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const { t } = useTranslation();
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialColumnVisibility ?? {});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: paginationData?.per_page ?? 20,
  });

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
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const { isFixed } = useTableLayoutMode();

  const showSkeleton = isLoading || (isFetching && data.length === 0);
  const visibleColumnCount = table.getVisibleFlatColumns().length || columns.length;

  return (
    <div className={cn("flex flex-col", isFixed && "flex-1 min-h-0")}>
      {toolbar && (
        <div className="shrink-0 pb-3">
          <DataTableToolbar
            table={table}
            toolbarOptions={toolbarOptions}
            data={data}
            toggleColumns={toggleColumns}
            setFilter={setFilter}
            queryKey={queryKey}
            form={form}
            toolbarTitle={toolbarTitle}
            toolbarTitleClass={toolbarTitleClass}
            toolbarBeforeForm={toolbarBeforeForm}
          />
        </div>
      )}

      <div
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
                    <TableHead key={header.id} colSpan={header.colSpan}>
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
                      <TableCell key={cell.id}>
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
