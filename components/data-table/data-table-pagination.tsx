import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePagination } from "@/hooks/use-pagination";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "../ui/pagination";
import { useSidebar } from "../ui/sidebar";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pagination: Pagination;
  setCurrentPage?: (page: number) => void;
}

export function DataTablePagination<TData>({
  table,
  pagination,
  setCurrentPage = () => {},
}: DataTablePaginationProps<TData>) {
  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: pagination.current_page,
    totalPages: pagination.total_pages,
    paginationItemsToDisplay: 5,
  });
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
  console.log(pagination, "pg", table.getPageCount(), pages);
  return (
    <div className="flex items-center justify-between gap-3 max-sm:flex-col">
      {/* Page number information */}
      {!isMobile && (
        <p
          className="text-muted-foreground flex-1 text-sm whitespace-nowrap"
          aria-live="polite"
        >
          Page{" "}
          <span className="text-foreground">{pagination.current_page}</span> of{" "}
          <span className="text-foreground">{pagination.total_pages}</span>
        </p>
      )}

      {/* Pagination buttons */}
      <div className="grow">
        <Pagination>
          <PaginationContent>
            {/* Previous page button */}
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="disabled:pointer-events-none disabled:opacity-50"
                onClick={() => setCurrentPage(pagination.current_page - 1)}
                disabled={pagination?.current_page <= 1}
                aria-label="Go to previous page"
              >
                <ChevronLeftIcon aria-hidden="true" />
              </Button>
            </PaginationItem>

            {/* Left ellipsis (...) */}
            {showLeftEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Page number buttons */}
            {pages.map((page) => {
              const isActive = page === pagination?.current_page;
              return (
                <PaginationItem key={page}>
                  <Button
                    size="icon"
                    variant={`${isActive ? "outline" : "ghost"}`}
                    onClick={() => setCurrentPage(page)}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {page}
                  </Button>
                </PaginationItem>
              );
            })}

            {/* Right ellipsis (...) */}
            {showRightEllipsis && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Next page button */}
            <PaginationItem>
              <Button
                size="icon"
                variant="outline"
                className="disabled:pointer-events-none disabled:opacity-50"
                onClick={() => setCurrentPage(pagination.current_page + 1)}
                disabled={pagination.current_page === pagination.total_pages}
                aria-label="Go to next page"
              >
                <ChevronRightIcon aria-hidden="true" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* Results per page */}
      <div className="flex flex-1 justify-end">
        <Select
          value={table.getState().pagination.pageSize.toString()}
          // onValueChange={(value) => {
          //   table.setPageSize(Number(value));
          // }}
          aria-label="Results per page"
        >
          <SelectTrigger
            id="results-per-page"
            className="w-fit whitespace-nowrap"
          >
            <SelectValue placeholder="Select number of results" />
          </SelectTrigger>
          <SelectContent>
            {[5, 10, 25, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={pageSize.toString()}>
                {pageSize} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
