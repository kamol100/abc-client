import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";

import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/use-pagination";
import ChangePagination from "../change-pagination";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
} from "../ui/pagination";
import { useSidebar } from "../ui/sidebar";

interface DataTablePaginationProps<TData> {
  pagination: Pagination;
  setCurrentPage?: (page: number) => void;
  queryKey?: string;
}

export function DataTablePagination<TData>({
  pagination,
  setCurrentPage = () => {},
  queryKey,
}: DataTablePaginationProps<TData>) {
  const { pages, showLeftEllipsis, showRightEllipsis } = usePagination({
    currentPage: pagination.current_page,
    totalPages: pagination.total_pages,
    paginationItemsToDisplay: 5,
  });
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
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
      {!isMobile && (
        <div className="flex flex-1 justify-end">
          <ChangePagination queryKey={queryKey} />
        </div>
      )}
    </div>
  );
}
