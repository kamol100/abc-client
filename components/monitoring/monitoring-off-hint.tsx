"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { usePermissions } from "@/context/app-provider";

/** Shown on a device that is not checked automatically: which switch is off and where to turn it on. */
export default function MonitoringOffHint({ deviceOff, companyOff }: { deviceOff: boolean; companyOff: boolean }) {
    const { t } = useTranslation();
    const { hasPermission } = usePermissions();
    const linkClass = "font-medium text-foreground underline underline-offset-2";

    if (!deviceOff && !companyOff) return null;

    return (
        <div
            role="note"
            className="flex flex-col gap-1 rounded-md border border-dashed bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
        >
            {deviceOff && (
                <p className="flex flex-wrap items-center gap-x-3">
                    <span>{t("monitoring.off_hint.device")}</span>
                    {hasPermission("devices.access") && (
                        <Link href="/devices" className={linkClass}>
                            {t("monitoring.off_hint.devices")}
                        </Link>
                    )}
                </p>
            )}
            {companyOff && (
                <p className="flex flex-wrap items-center gap-x-3">
                    <span>{t("monitoring.off_hint.company")}</span>
                    {hasPermission("company-settings.access") && (
                        <Link href="/settings/monitoring" className={linkClass}>
                            {t("monitoring.off_hint.settings")}
                        </Link>
                    )}
                </p>
            )}
        </div>
    );
}
