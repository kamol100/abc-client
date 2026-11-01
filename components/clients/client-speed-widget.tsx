"use client";

import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Upload, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { ClientSpeed } from "@/components/clients/client-type";

interface Props {
    clientId?: string;
    url?: string;
}

const ClientSpeedWidget: FC<Props> = ({ clientId, url }) => {
    const { t } = useTranslation();
    const speedUrl = url ?? `clients-speed/${clientId ?? ""}`;
    const { data, isLoading } = useApiQuery<ApiResponse<ClientSpeed>>({
        queryKey: ["client-speed", speedUrl],
        url: speedUrl,
        pagination: false,
        enabled: Boolean(url) || Boolean(clientId),
        refetchInterval: () => (typeof document !== "undefined" && document.hidden ? false : 15_000),
        refetchIntervalInBackground: false,
        retry: 0,
    });

    const speed = data?.data;

    if (isLoading) {
        return (
            <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-16 rounded-md" />
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            <Badge variant="secondary" className="gap-1 text-xs" aria-label={t("client.speed.upload")}>
                <Upload className="h-3 w-3" aria-hidden />
                {speed?.upload_speed ?? "—"}
            </Badge>
            <Badge variant="secondary" className="gap-1 text-xs" aria-label={t("client.speed.download")}>
                <Download className="h-3 w-3" aria-hidden />
                {speed?.download_speed ?? "—"}
            </Badge>
        </div>
    );
};

export default ClientSpeedWidget;
