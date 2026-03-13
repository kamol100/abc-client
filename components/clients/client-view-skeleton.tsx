"use client";

import Card from "@/components/card";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loader that mirrors the Client View page layout:
 * - Header (back button, title, badge, action buttons)
 * - Three info cards (Basic, Billing, Server)
 * - Payment table section
 * - Ticket table section
 * - Client history table section
 */
export default function ClientViewSkeleton() {
    const infoRow = (
        <div className="flex items-start gap-2 py-1.5 text-sm">
            <Skeleton className="h-4 w-24 shrink-0" />
            <Skeleton className="h-4 w-3 shrink-0" />
            <Skeleton className="h-4 flex-1 min-w-0 max-w-[180px]" />
        </div>
    );

    return (
        <div className="space-y-6 overflow-auto pr-3">
            {/* Header: back button + title + badge + action buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
                    <Skeleton className="h-6 w-36" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Skeleton key={i} className="h-9 w-28 rounded-md" />
                    ))}
                </div>
            </div>

            {/* Basic view: 3 cards in grid */}
            <div className="w-full">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Card>
                        <div className="flex items-center justify-between border-b bg-muted/40 px-3 py-2.5">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                        <div className="space-y-0 px-3 py-3">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i}>{infoRow}</div>
                            ))}
                        </div>
                    </Card>
                    <Card>
                        <div className="border-b bg-muted/40 px-3 py-2.5">
                            <Skeleton className="h-5 w-44" />
                        </div>
                        <div className="space-y-0 px-3 py-3">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i}>{infoRow}</div>
                            ))}
                        </div>
                    </Card>
                    <Card>
                        <div className="border-b bg-muted/40 px-3 py-2.5">
                            <Skeleton className="h-5 w-40" />
                        </div>
                        <div className="space-y-0 px-3 py-3">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i}>{infoRow}</div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Payment table section */}
            <div className="border-t pt-4">
                <DataTableSkeleton rows={4} columns={5} actionButtonCount={2} />
            </div>

            {/* Ticket table section */}
            <div className="border-t pt-4">
                <DataTableSkeleton rows={4} columns={5} actionButtonCount={2} />
            </div>

            {/* Client history section */}
            <div className="border-t pt-4">
                <DataTableSkeleton rows={4} columns={4} actionButtonCount={2} />
            </div>
        </div>
    );
}
