"use client";

import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { FormLoader } from "@/components/loader";
import MyButton from "@/components/my-button";

type FormLoadStateProps = {
    isLoading: boolean;
    failed: boolean;
    /** Shape of the skeleton, so it takes the same space as the fields that replace it. */
    grids: number;
    fieldCount: number;
    onCancel: () => void;
    onRetry: () => void;
    children: ReactNode;
};

/**
 * What an edit form shows while its record is being fetched: a skeleton while loading,
 * a retry message when the fetch failed, and the fields once the record is there.
 */
export function FormLoadState({
    isLoading,
    failed,
    grids,
    fieldCount,
    onCancel,
    onRetry,
    children,
}: FormLoadStateProps) {
    const { t } = useTranslation();

    if (isLoading) {
        return <FormLoader grids={grids} fieldCount={fieldCount || 4} />;
    }

    if (failed) {
        return (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="text-sm font-medium text-destructive">
                    {t("common.failed_to_load_data")}
                </p>
                <div className="flex gap-2">
                    <MyButton action="cancel" onClick={onCancel}>
                        {t("common.cancel")}
                    </MyButton>
                    <MyButton onClick={onRetry}>
                        {t("common.refresh")}
                    </MyButton>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
