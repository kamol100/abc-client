"use client";

import Card from "@/components/card";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResellerViewSkeleton() {
    return (
        <div className="space-y-4 overflow-auto pr-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-md" />
                    <Skeleton className="h-6 w-40" />
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-9 w-24 rounded-md" />
                    <Skeleton className="h-9 w-24 rounded-md" />
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-9 w-24 rounded-md" />
                <Skeleton className="h-9 w-24 rounded-md" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index}>
                        <div className="border-b px-3 py-2.5">
                            <Skeleton className="h-5 w-40" />
                        </div>
                        <div className="space-y-2 px-3 py-3">
                            {Array.from({ length: 9 }).map((__, row) => (
                                <div key={row} className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-2" />
                                    <Skeleton className="h-4 flex-1" />
                                </div>
                            ))}
                        </div>
                    </Card>
                ))}
            </div>

            <DataTableSkeleton rows={5} columns={6} />
        </div>
    );
}
