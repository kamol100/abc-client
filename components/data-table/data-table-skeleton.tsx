"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

const DEFAULT_ACTION_BUTTON_COUNT = 2;

export interface DataTableSkeletonProps {
  rows: number;
  columns: number;
  /** Number of button-shaped skeletons in the last column (e.g. Edit, Delete). Default 3. */
  actionButtonCount?: number;
}

export function DataTableSkeleton({
  rows,
  columns,
  actionButtonCount = DEFAULT_ACTION_BUTTON_COUNT,
}: DataTableSkeletonProps) {
  const actionCount = Math.min(
    Math.max(1, actionButtonCount),
    DEFAULT_ACTION_BUTTON_COUNT
  );
  const hasActionColumn = columns > 0;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Array.from({ length: columns }).map((_, index) => {
            const isLastColumn = hasActionColumn && index === columns - 1;
            return (
              <TableHead
                key={index}
                className={isLastColumn ? "text-right w-[1%]" : undefined}
              >
                {isLastColumn ? (
                  <div className="flex w-full items-center justify-end pr-3">
                    <Skeleton className="h-4 w-24" />
                  </div>
                ) : (
                  <Skeleton className="h-4 w-24" />
                )}
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <TableRow key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => {
              const isLastColumn = hasActionColumn && colIndex === columns - 1;
              return (
                <TableCell
                  key={colIndex}
                  className={isLastColumn ? "text-right w-[1%]" : undefined}
                >
                  {isLastColumn ? (
                    <div className="flex w-full items-center justify-end gap-2 pr-3">
                      {Array.from({ length: actionCount }).map((_, btnIndex) => (
                        <Skeleton
                          key={btnIndex}
                          className="h-4 w-4 min-w-0 rounded-md"
                          aria-hidden
                        />
                      ))}
                    </div>
                  ) : (
                    <Skeleton className="h-3 w-full" />
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
