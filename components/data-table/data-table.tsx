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

import { cn } from "@/lib/utils";
import { useSettings } from "@/context/app-provider";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { SettingSchema } from "../settings/setting-zod-schema";
import { SkeletonLoader } from "../skeleton-loader";
import { useSidebar } from "../ui/sidebar";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";

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
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
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

  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  const queryClient = useQueryClient();

  const [topMargin, setTopMargin] = React.useState(
    "[&>div]:max-h-[calc(100dvh-170px)]"
  );
  const { settings: setting } = useSettings();
  useEffect(() => {
    if (setting?.show_dashboard_header) {
      setTopMargin("[&>div]:max-h-[calc(100dvh-235px)]");
    } else {
      setTopMargin("[&>div]:max-h-[calc(100dvh-170px)]");
    }
  }, [setting?.show_dashboard_header]);
  useEffect(() => {
    queryClient.setQueryData(["show_header"], {
      show_dashboard_header: setting?.show_dashboard_header,
    });
  }, [setting?.show_dashboard_header]);

  return (
    <div className="border bottom-1 rounded-md">
      {toolbar && (
        <div className="p-3">
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
          />
        </div>
      )}
      <div className={cn(`flex flex-col`, topMargin)}>
        {isLoading || isFetching ? (
          <div className="flex-1 overflow-auto">
            <SkeletonLoader
              rows={pagination?.pageSize}
              columns={7}
              options="table"
            />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/90 sticky top-0 backdrop-blur-xs">
              {table?.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="flex-1 overflow-auto" tabIndex={0}>
              {table?.getRowModel().rows?.length ? (
                table?.getRowModel().rows.map((row, rowIndex) => (
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
                    No results.
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
            "sticky bottom-0 border-t p-3 bg-background",
            isMobile && "bottom-16"
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
