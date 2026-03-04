"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, Wifi, WifiOff } from "lucide-react";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import useInView from "@/hooks/use-in-view";
import { cn } from "@/lib/utils";

interface NetworkConnectionPayload {
  message?: string;
}

type Props = {
  networkId: number;
};

const NetworkConnectionStatusCell: FC<Props> = ({ networkId }) => {
  const { t } = useTranslation();
  const { ref, inView } = useInView();

  const { data, isLoading } = useApiQuery<ApiResponse<NetworkConnectionPayload>>({
    queryKey: ["network-status", networkId],
    url: `network-status/${networkId}`,
    pagination: false,
    enabled: inView,
    staleTime: 10_000,
  });

  const isConnected = data?.data?.message === "connected";

  return (
    <div ref={ref} className="min-w-[130px]">
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <div
          className={cn(
            "inline-flex items-center gap-1.5 text-sm font-medium",
            isConnected ? "text-emerald-600" : "text-destructive"
          )}
        >
          {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          <span>
            {isConnected
              ? t("network.connection.connected")
              : t("network.connection.disconnected")}
          </span>
        </div>
      )}
    </div>
  );
};

export default NetworkConnectionStatusCell;
