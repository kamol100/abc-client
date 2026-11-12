"use client";

import { FC } from "react";
import { parse, format, isValid } from "date-fns";
import { Check, MessageSquare, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyTooltip from "@/components/my-tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePermissions } from "@/context/app-provider";
import useApiQuery, { type ApiResponse } from "@/hooks/use-api-query";
import { cn } from "@/lib/utils";

const SMS_STATUSES = ["unknown", "success", "failed"] as const;

type SmsDeliveryStatus = (typeof SMS_STATUSES)[number];

type SmsStatusItem = {
    status: SmsDeliveryStatus;
    sent_at: string | null;
    failure_reason: string | null;
};

type ClientSmsStatusData = {
    invoice_due: SmsStatusItem;
    invoice_due_reminder: SmsStatusItem | null;
};

type Props = {
    clientId?: string;
};

const UNKNOWN_ITEM: SmsStatusItem = {
    status: "unknown",
    sent_at: null,
    failure_reason: null,
};

function asStatus(value: unknown): SmsDeliveryStatus {
    if (value === "success" || value === "failed" || value === "unknown") return value;
    return "unknown";
}

function asItem(value: unknown): SmsStatusItem | null {
    if (!value || typeof value !== "object") return null;
    const record = value as Record<string, unknown>;
    return {
        status: asStatus(record.status),
        sent_at: typeof record.sent_at === "string" ? record.sent_at : null,
        failure_reason: typeof record.failure_reason === "string" ? record.failure_reason : null,
    };
}

function readStatus(data: ApiResponse<ClientSmsStatusData> | undefined): ClientSmsStatusData {
    const payload = data?.data;
    return {
        invoice_due: asItem(payload?.invoice_due) ?? UNKNOWN_ITEM,
        invoice_due_reminder: asItem(payload?.invoice_due_reminder),
    };
}

function combinedStatus(status: ClientSmsStatusData): SmsDeliveryStatus {
    const items = [status.invoice_due, status.invoice_due_reminder].filter(
        (item): item is SmsStatusItem => item !== null,
    );
    if (items.some((item) => item.status === "failed")) return "failed";
    if (items.some((item) => item.status === "success")) return "success";
    return "unknown";
}

function formatSmsTime(value: string | null): string | null {
    if (!value) return null;
    const parsed = parse(value, "yyyy-MM-dd HH:mm:ss", new Date());
    if (!isValid(parsed)) return value;
    return format(parsed, "dd MMM yyyy, h:mm a");
}

const SmsStatusIcon: FC<{ status: SmsDeliveryStatus }> = ({ status }) => (
    <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
        <MessageSquare
            className={cn(
                "h-4 w-4",
                status === "success" && "text-success",
                status === "failed" && "text-destructive",
            )}
        />
        {status === "success" && (
            <Check className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full bg-background text-success" />
        )}
        {status === "failed" && (
            <X className="absolute -bottom-px -right-px h-2.5 w-2.5 rounded-full bg-background text-destructive" />
        )}
    </span>
);

const SmsStatusDetails: FC<{ item: SmsStatusItem; titleKey: string }> = ({ item, titleKey }) => {
    const { t } = useTranslation();
    const when = formatSmsTime(item.sent_at);

    return (
        <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">{t(titleKey)}</p>
            {item.status === "unknown" && (
                <p className="text-xs text-muted-foreground">{t("client.sms_status.no_record")}</p>
            )}
            {item.status === "success" && when && (
                <p className="text-xs text-muted-foreground">
                    {t("client.sms_status.sent_at")}: {when}
                </p>
            )}
            {item.status === "failed" && (
                <div className="space-y-1 text-xs text-muted-foreground">
                    {item.failure_reason && (
                        <p>
                            {t("client.sms_status.reason")}: {item.failure_reason}
                        </p>
                    )}
                    {when && (
                        <p>
                            {t("client.sms_status.failed_at")}: {when}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

const ClientSmsStatus: FC<Props> = ({ clientId }) => {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const canLoad = Boolean(clientId) && (hasPermission("clients.show") || hasPermission("clients.sms-status"));
    const { data } = useApiQuery<ApiResponse<ClientSmsStatusData>>({
        queryKey: ["clients", clientId ?? "none", "sms-status"],
        url: `clients/${clientId}/sms-status`,
        pagination: false,
        enabled: canLoad,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });
    const status = readStatus(canLoad ? data : undefined);
    const iconStatus = combinedStatus(status);

    return (
        <Popover>
            <MyTooltip content={`client.sms_status.${iconStatus}`}>
                <PopoverTrigger asChild>
                    <button
                        type="button"
                        className="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm text-muted-foreground"
                        aria-label={t(`client.sms_status.${iconStatus}`)}
                    >
                        <SmsStatusIcon status={iconStatus} />
                    </button>
                </PopoverTrigger>
            </MyTooltip>
            <PopoverContent align="start" className="w-72 p-3">
                <div className="space-y-3">
                    <SmsStatusDetails item={status.invoice_due} titleKey="client.sms_status.invoice_due" />
                    {status.invoice_due_reminder && (
                        <div className="border-t pt-3">
                            <SmsStatusDetails
                                item={status.invoice_due_reminder}
                                titleKey="client.sms_status.invoice_due_reminder"
                            />
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default ClientSmsStatus;
