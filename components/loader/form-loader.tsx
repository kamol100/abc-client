"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { GRID_STYLES } from "@/components/form-wrapper/form-builder-type";

export type FormLoaderProps = {
    /** Number of grid columns (1–8). Uses same grid breakpoints as form builder. */
    grids?: number;
    /** Number of field rows to show. */
    fieldCount?: number;
    /** Optional class for the container. */
    className?: string;
};

/**
 * Reusable form skeleton loader. Uses theme spacing and adapts to container size.
 * Compatible with light/dark mode via Skeleton (bg-primary/10).
 */
export function FormLoader({
    grids = 1,
    fieldCount = 4,
    className,
}: FormLoaderProps) {
    return (
        <div
            className={cn(
                "grid w-full min-w-0 m-auto gap-4",
                GRID_STYLES[grids] ?? GRID_STYLES[1],
                className
            )}
        >
            {Array.from({ length: fieldCount }).map((_, i) => (
                <div key={i} className="flex min-w-0 flex-col gap-2">
                    <Skeleton className="h-4 w-1/4 max-w-full shrink-0 rounded-md" />
                    <Skeleton className="h-10 min-h-10 w-full flex-1 rounded-md" />
                </div>
            ))}
        </div>
    );
}
