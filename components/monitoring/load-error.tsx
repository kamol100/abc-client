"use client";

import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";

/** Error state for the monitoring pages: the API message (403, 404…) and a retry button. */
export default function LoadError({
    error,
    onRetry,
    loading,
}: {
    error?: Error | null;
    onRetry: () => void;
    loading?: boolean;
}) {
    const { t } = useTranslation();

    return (
        <div
            role="alert"
            className="flex flex-col items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-10 text-center"
        >
            <p className="text-sm font-medium text-destructive">{t("common.failed_to_load_data")}</p>
            {error?.message && <p className="text-xs text-muted-foreground">{t(error.message)}</p>}
            <MyButton type="button" onClick={onRetry} loading={loading}>
                {t("common.refresh")}
            </MyButton>
        </div>
    );
}
