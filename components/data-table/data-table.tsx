"use client";

import {
  Cell,
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

type CellRenderer<TData> = ColumnDef<TData, unknown>["cell"];

const isPlainFunction = (value: unknown): value is (props: unknown) => React.ReactNode =>
  typeof value === "function" && !(value.prototype && value.prototype.isReactComponent);

/**
 * Identifies a column's `cell` by its code, not by the function object. A page that
 * builds its columns while rendering hands over a new function every time; the code
 * behind it is the same.
 */
const cellRendererKey = <TData,>(renderer: CellRenderer<TData>): string =>
  isPlainFunction(renderer) ? renderer.toString() : "static";

/**
 * Draws one cell. The column's `cell` function is called here, not mounted as its own
 * component. Mounted directly (flexRender), a new function object counts as a new
 * component: every cell is thrown away and built again on each render of the page, and
 * a dialog opened from a row closes by itself. The caller keys this by the function's
 * code, so a cell whose code really changes still starts fresh.
 */
function CellContent<TData>({ cell }: { cell: Cell<TData, unknown> }) {
  const renderer = cell.column.columnDef.cell;
  if (isPlainFunction(renderer)) return <>{renderer(cell.getContext())}</>;
  return <>{flexRender(renderer, cell.getContext())}</>;
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

      {/* One themed surface for the rows and the pagination footer. */}
      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow",
          isFixed && "flex-1 min-h-0"
        )}
      >
        <div
          data-table-scroll-container
          className={cn(
            "flex flex-col",
            isFixed && "flex-1 min-h-0 overflow-auto"
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
                  "bg-[hsl(var(--table-header)/0.9)] backdrop-blur-xs",
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
                          <CellContent
                            key={cellRendererKey(cell.column.columnDef.cell)}
                            cell={cell}
                          />
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
          <div className="shrink-0 border-t border-border bg-[hsl(var(--table-header))] px-3 py-2.5">
            <DataTablePagination
              pagination={paginationData}
              setCurrentPage={setCurrentPage}
              queryKey={queryKey}
            />
          </div>
        )}
      </div>
    </div>
  );
}
