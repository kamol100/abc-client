"use client";

import { useTranslation } from "react-i18next";
import MyBadge from "@/components/my-badge";
import { MyTooltip } from "@/components/my-tooltip";
import { cn } from "@/lib/utils";
import { unknownStatusText } from "./onu-freshness";
import { onuStatusBadgeType } from "./onu-power";
import { isOnuStatus, type OnuStatus } from "./onu-type";

/**
 * Grey "Unknown" badge for a status the app cannot vouch for (OLT down, not polled lately, never polled),
 * with the reason and the time of the data as a tooltip.
 */
export function UnknownStatusBadge({ reason, asOf, className }: { reason?: string | null; asOf?: string | null; className?: string }) {
    const { t } = useTranslation();
    const why = unknownStatusText(reason, asOf, t);

    return (
        <MyTooltip content={<span>{why}</span>}>
            <MyBadge type="pending" variant="soft" size="sm" className={className}>
                {t("onu.status.unknown")}
                <span className="sr-only">: {why}</span>
            </MyBadge>
        </MyTooltip>
    );
}

interface Props {
    status: OnuStatus | string | null | undefined;
    /** Vendor down cause (los, dying_gasp, …); "not_reported" = the OLT stopped listing the ONU. */
    cause?: string | null;
    /** false: the status is from an old poll (OLT down / stale / never polled) → "Unknown". */
    statusKnown?: boolean;
    unknownReason?: string | null;
    /** When the status was read (tooltip of the Unknown badge). */
    asOf?: string | null;
    className?: string;
}

/** Soft status badge; online mirrors the green MonitorStateBadge "Up". */
export default function OnuStatusBadge({ status, cause, statusKnown, unknownReason, asOf, className }: Props) {
    const { t } = useTranslation();
    if (statusKnown === false) {
        return (
            <div className={cn("flex flex-col items-start gap-0.5", className)}>
                <UnknownStatusBadge reason={unknownReason} asOf={asOf} />
            </div>
        );
    }

    const key = isOnuStatus(status) ? status : "unknown";

    return (
        <div className={cn("flex flex-col items-start gap-0.5", className)}>
            <MyBadge
                type={onuStatusBadgeType(key)}
                variant="soft"
                size="sm"
                className={key === "online" ? "bg-green-600/15 text-green-700 dark:text-green-400" : undefined}
            >
                {t(`onu.status.${key}`)}
            </MyBadge>
            {key !== "online" && cause === "not_reported" && (
                <span className="text-xs text-muted-foreground">{t("onu.not_reported")}</span>
            )}
        </div>
    );
}
