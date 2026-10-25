"use client";

import { type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { User, Wifi, WifiOff } from "lucide-react";
import Card from "@/components/card";
import MyBadge from "@/components/my-badge";
import OnuStatusBadge from "@/components/onu/onu-status-badge";
import { getClientTerminationDateDisplay } from "@/components/clients/client-termination-date";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClientDashboardInfo as ClientDashboardInfoData } from "@/components/client-area/dashboard/client-dashboard-type";
import { cn } from "@/lib/utils";

type Props = {
  data: ClientDashboardInfoData | null;
  isLoading: boolean;
  isError: boolean;
};

const SKELETON_FIELDS = 12;

export default function ClientDashboardInfo({ data, isLoading, isError }: Props) {
  const { t } = useTranslation();

  return (
    <Card>
      <section className="p-4" aria-busy={isLoading || undefined}>
        <h2 className="text-xl font-bold text-foreground">{t("client_dashboard.info.title")}</h2>
        {isLoading ? (
          <div className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: SKELETON_FIELDS }, (_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>
        ) : isError || !data ? (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {t("common.failed_to_load_data")}
          </p>
        ) : (
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem label={t("client_dashboard.info.account_status")}>
              <AccountStatus status={data.status} />
            </InfoItem>
            <InfoItem label={t("client_dashboard.info.connection_status")}>
              <ConnectionStatus online={data.connection.is_online} />
            </InfoItem>
            <InfoItem label={t("client_dashboard.info.onu_status")}>
              <OnuStatus status={data.onu_status} />
            </InfoItem>
            <InfoItem label={t("client_dashboard.info.customer_id")}>
              <InfoText value={data.customer_id} />
            </InfoItem>
            <InfoItem label={t("client_dashboard.info.account_expiration")}>
              <Expiration value={data.termination_date} />
            </InfoItem>
            <InfoItem label={t("client_dashboard.info.username")}>
              <InfoText value={data.username} className="font-mono" />
            </InfoItem>
            <InfoItem label={t("client_dashboard.info.name")}>
              <InfoText value={data.name} />
            </InfoItem>
            <InfoItem label={t("client_dashboard.info.phone")}>
              <InfoText value={data.phone} />
            </InfoItem>
            <InfoItem label={t("client_dashboard.info.alternate_phone")}>
              <InfoText value={data.alternate_phone} />
            </InfoItem>
            <InfoItem label={t("client_dashboard.info.email")}>
              <InfoText value={data.email} />
            </InfoItem>
            <InfoItem label={t("client_dashboard.info.dynamic_ip")}>
              <InfoText value={data.connection.ip_address} className="font-mono" />
            </InfoItem>
            <InfoItem label={t("client_dashboard.info.package")}>
              <InfoText value={data.package} />
            </InfoItem>
          </dl>
        )}
      </section>
    </Card>
  );
}

function InfoItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm font-medium text-foreground">{children}</dd>
    </div>
  );
}

function InfoText({ value, className }: { value: string | null; className?: string }) {
  const trimmed = value?.trim();
  if (!trimmed) {
    return <span className="font-normal text-muted-foreground">—</span>;
  }

  return <span className={cn("break-words", className)}>{trimmed}</span>;
}

function AccountStatus({ status }: { status: number | null }) {
  const { t } = useTranslation();
  if (status === 1) {
    return (
      <MyBadge type="success" variant="soft" size="sm" icon={User}>
        {t("common.active")}
      </MyBadge>
    );
  }
  if (status === 0) {
    return (
      <MyBadge type="error" variant="soft" size="sm" icon={User}>
        {t("common.inactive")}
      </MyBadge>
    );
  }

  return <Unavailable />;
}

function ConnectionStatus({ online }: { online: boolean }) {
  const { t } = useTranslation();
  const Icon = online ? Wifi : WifiOff;

  return (
    <MyBadge
      type={online ? "success" : "error"}
      variant="soft"
      size="sm"
      icon={Icon}
      className={online ? "bg-green-600/15 text-green-700 dark:text-green-400" : undefined}
    >
      {t(online ? "client.basic_view.online" : "client.basic_view.offline")}
    </MyBadge>
  );
}

function OnuStatus({ status }: { status: string | null }) {
  if (!status) return <Unavailable />;

  return <OnuStatusBadge status={status} />;
}

function Expiration({ value }: { value: string | null }) {
  const display = getClientTerminationDateDisplay(value);
  if (!display) return <InfoText value={null} />;
  if (display.kind === "unparsed") return <InfoText value={display.text} />;

  return (
    <span className={display.kind === "expired" ? "text-destructive" : "text-primary"}>
      {display.date}
    </span>
  );
}

function Unavailable() {
  const { t } = useTranslation();

  return <span className="font-normal text-muted-foreground">{t("client_dashboard.info.not_available")}</span>;
}
