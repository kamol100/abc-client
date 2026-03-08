import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardChartSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-full md:w-44" />
      </div>
      <Skeleton className="h-72 w-full rounded-md" />
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-24" />
      </div>
    </div>
  );
}
