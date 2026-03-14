"use client";

import { FC } from "react";
import { Upload, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import useApiQuery, { ApiResponse } from "@/hooks/use-api-query";
import { ClientSpeed } from "./client-type";

interface Props {
    clientId: string;
}

const ClientSpeedWidget: FC<Props> = ({ clientId }) => {
    const { data, isLoading } = useApiQuery<ApiResponse<ClientSpeed>>({
        queryKey: ["client-speed", clientId],
        url: `clients-speed/${clientId}`,
        pagination: false,
        refetchInterval: 5_000,
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
            <Badge variant="secondary" className="gap-1 text-xs">
                <Upload className="h-3 w-3" />
                {speed?.upload_speed ?? "—"}
            </Badge>
            <Badge variant="secondary" className="gap-1 text-xs">
                <Download className="h-3 w-3" />
                {speed?.download_speed ?? "—"}
            </Badge>
        </div>
    );
};

export default ClientSpeedWidget;
