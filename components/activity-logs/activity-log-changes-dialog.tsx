"use client";

import { DialogWrapper } from "@/components/dialog-wrapper";
import { formatKey } from "@/lib/helper/helper";
import { useTranslation } from "react-i18next";
import type { ActivityLogChanges as ActivityLogChangesType } from "./activity-log-type";

type Props = {
    changes: ActivityLogChangesType;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    updated_at?: string;
};

function transformValue(value: unknown): string {
    if (value === null || value === undefined) return "—";
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
}

export function ActivityLogChangesDialog({
    changes,
    open,
    onOpenChange,
    updated_at = "",
}: Props) {
    const { t } = useTranslation();
    const hasOld = changes?.old !== undefined && Object.keys(changes.old).length > 0;
    const hasAttributes =
        changes?.attributes !== undefined &&
        Object.keys(changes.attributes).length > 0;

    return (
        <DialogWrapper
            open={open}
            onOpenChange={onOpenChange}
            size="4xl"
            showFooter={false}
            title="activity_log.change_log_title"
        >
            <div className="flex flex-col gap-6 pb-2 sm:flex-row">
                <div className="w-full space-y-2">
                    <p className="font-semibold capitalize">
                        {t("activity_log.original_values")}
                    </p>
                    <div className="rounded-md border border-green-800/50 bg-green-950/20 p-3 dark:border-green-700 dark:bg-green-950/30">
                        {hasOld ? (
                            <>
                                {Object.entries(changes.old ?? {}).map(([key, value], idx) => (
                                    <p key={idx} className="mt-2 text-left first:mt-0">
                                        {formatKey(key)}: {transformValue(value)}
                                    </p>
                                ))}
                            </>
                        ) : (
                            <>
                                <p>{t("activity_log.created")}</p>
                                {updated_at && <p className="text-muted-foreground">{updated_at}</p>}
                            </>
                        )}
                    </div>
                </div>
                <div className="w-full space-y-2">
                    <p className="font-semibold capitalize">
                        {t("activity_log.updated_values")}
                    </p>
                    <div className="rounded-md border border-red-800/50 bg-red-950/20 p-3 dark:border-red-700 dark:bg-red-950/30">
                        {hasAttributes ? (
                            <>
                                {Object.entries(changes.attributes ?? {}).map(([key, value], idx) => (
                                    <p key={idx} className="mt-2 text-left first:mt-0">
                                        {formatKey(key)}: {transformValue(value)}
                                    </p>
                                ))}
                            </>
                        ) : (
                            <>
                                <p>{t("activity_log.deleted")}</p>
                                {updated_at && <p className="text-muted-foreground">{updated_at}</p>}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </DialogWrapper>
    );
}
