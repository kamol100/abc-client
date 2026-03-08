"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/context/app-provider";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import FormFilter from "@/components/form-wrapper/form-filter";
import { ClientMapListSchema, ClientMapRowSchema } from "@/components/maps/maps-type";
import ClientMapsFilterSchema from "@/components/maps/client-maps-filter-schema";
import { getSettingString, resolveMapCenter } from "@/components/maps/map-utils";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const ClientMapsCanvas = dynamic(
  () => import("@/components/maps/client-maps-canvas"),
  {
    ssr: false,
    loading: () => (
      <Skeleton className="h-[60vh] min-h-[420px] w-full rounded-md border border-border" />
    ),
  },
);

function parseClientMapRows(data: unknown): ReturnType<typeof ClientMapListSchema.parse> {
  const rows = Array.isArray(data) ? data : [];
  const parsedList = ClientMapListSchema.safeParse(rows);
  if (parsedList.success) return parsedList.data;

  return rows.flatMap((row) => {
    const parsedRow = ClientMapRowSchema.safeParse(row);
    return parsedRow.success ? [parsedRow.data] : [];
  });
}

export default function ClientMapsTable() {
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
    queryKey: ["client-maps"],
    url: "client-maps",
    params,
    pagination: false,
  });

  const mapRows = useMemo(() => parseClientMapRows(data?.data), [data?.data]);
  const center = useMemo(
    () => resolveMapCenter(settings.lat, settings.lon),
    [settings.lat, settings.lon],
  );

  const companyName =
    getSettingString(settings, ["company_name", "company", "name"]) ??
    t("client_map.company.fallback_name");
  const companyAddress = getSettingString(settings, [
    "company_address",
    "address",
  ]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="rounded-md border border-border bg-card p-3">
        <FormFilter
          formSchema={ClientMapsFilterSchema()}
          grids={4}
          setFilter={setFilter}
          searchButton
        />
      </div>

      {isError ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {t("client_map.error.load_failed")}
        </div>
      ) : (
        <div className="relative">
          <ClientMapsCanvas
            data={mapRows}
            center={center}
            companyName={companyName}
            companyAddress={companyAddress}
          />

          {(isLoading || isFetching) && (
            <div
              className={cn(
                "pointer-events-none absolute inset-0 z-10 grid place-items-center rounded-md",
                "bg-background/30 backdrop-blur-[1px]",
              )}
              aria-live="polite"
              aria-label={t("client_map.loading")}
            >
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
