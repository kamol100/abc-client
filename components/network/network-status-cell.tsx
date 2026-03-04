"use client";

import { Badge } from "@/components/ui/badge";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { NetworkRow } from "./network-type";

type Props = {
  network: NetworkRow;
};

const NetworkStatusCell: FC<Props> = ({ network }) => {
  const { t } = useTranslation();

  const statusLabel = (enabled: boolean) =>
    enabled ? t("network.status.on") : t("network.status.off");

  const statusVariant = (enabled: boolean) =>
    enabled ? "default" : "destructive";

  return (
    <div className="flex flex-col gap-1 min-w-[170px]">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {t("network.auto_client_mikrotik_status.label")}:
        </span>
        <Badge
          variant={statusVariant(Number(network.auto_client_mikrotik_status) === 1)}
        >
          {statusLabel(Number(network.auto_client_mikrotik_status) === 1)}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {t("network.graph_status.label")}:
        </span>
        <Badge variant={statusVariant(Number(network.graph_status) === 1)}>
          {statusLabel(Number(network.graph_status) === 1)}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {t("network.auto_sync_status.label")}:
        </span>
        <Badge variant={statusVariant(Number(network.auto_sync_status) === 1)}>
          {statusLabel(Number(network.auto_sync_status) === 1)}
        </Badge>
      </div>
    </div>
  );
};

export default NetworkStatusCell;
