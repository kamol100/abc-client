import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardCardSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden animate-in fade-in duration-300">
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-4 min-h-8">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-[130px] -mt-1 -mr-1" />
        </div>
        <div className="flex flex-1 items-center pt-2">
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <div className="border-t bg-muted/40 px-4 py-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  );
}
