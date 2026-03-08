"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/context/app-provider";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import FormFilter from "@/components/form-wrapper/form-filter";
import { TjBoxMapListSchema, TjBoxMapRowSchema } from "@/components/maps/maps-type";
import TjBoxMapsFilterSchema from "@/components/maps/tj-box-maps-filter-schema";
import { resolveMapCenter } from "@/components/maps/map-utils";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const TjBoxMapsCanvas = dynamic(
  () => import("@/components/maps/tj-box-maps-canvas"),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-[60vh] min-h-[420px] w-full rounded-md border border-border" />
    ),
  },
);

function parseTjBoxMapRows(data: unknown): ReturnType<typeof TjBoxMapListSchema.parse> {
  const rows = Array.isArray(data) ? data : [];
  const parsedList = TjBoxMapListSchema.safeParse(rows);
  if (parsedList.success) return parsedList.data;

  return rows.flatMap((row) => {
    const parsedRow = TjBoxMapRowSchema.safeParse(row);
    return parsedRow.success ? [parsedRow.data] : [];
  });
}

export default function TjBoxMapsTable() {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const [filterValue, setFilter] = useState<string | null>(null);

  const params = useMemo(
    () =>
      filterValue ? Object.fromEntries(new URLSearchParams(filterValue)) : undefined,
    [filterValue],
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useApiQuery<ApiResponse<unknown[]>>({
    queryKey: ["tj-box-maps"],
    url: "tj-boxes-map",
    params,
    pagination: false,
  });

  const mapRows = useMemo(() => parseTjBoxMapRows(data?.data), [data?.data]);
  const center = useMemo(
    () => resolveMapCenter(settings.lat, settings.lon),
    [settings.lat, settings.lon],
  );

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="rounded-md border border-border bg-card p-3">
        <FormFilter
          formSchema={TjBoxMapsFilterSchema()}
          grids={4}
          setFilter={setFilter}
          searchButton
        />
      </div>

      {isError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {t("tj_box_map.error.load_failed")}
        </div>
      ) : (
        <div className="relative">
          <TjBoxMapsCanvas data={mapRows} center={center} />

          {(isLoading || isFetching) && (
            <div
              className={cn(
                "pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-md",
                "bg-background/30 backdrop-blur-[1px]",
              )}
              aria-live="polite"
              aria-label={t("tj_box_map.loading")}
            >
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
