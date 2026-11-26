"use client";

import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import { cn } from "@/lib/utils";

type FormFooterProps = {
    /** A full-page form keeps the footer under a scrolling body; a dialog form sticks it to the bottom. */
    fullPage: boolean;
    className?: string;
    /** Replaces the "Save" label, and drops the save icon. */
    submitTitle?: string;
    isSaving: boolean;
    onCancel: () => void;
};

/** The Cancel and Save buttons at the bottom of a form. */
export function FormFooter({ fullPage, className, submitTitle, isSaving, onCancel }: FormFooterProps) {
    const { t } = useTranslation();

    return (
        <div
            className={cn(
                "flex items-center gap-3 pt-4 mt-4 border-t border-border",
                // A full-page footer sits on the themed page canvas, so it stays transparent;
                // a dialog or drawer footer sticks over scrolling fields and needs the panel colour.
                fullPage ? "shrink-0" : "sticky bottom-0 bg-background",
                className
            )}
        >
            <MyButton
                action="cancel"
                type="button"
                title={t("common.cancel")}
                size="default"
                onClick={onCancel}
            />
            <MyButton
                action="save"
                title={submitTitle ?? t("common.save")}
                icon={submitTitle ? false : undefined}
                size="default"
                type="submit"
                variant="default"
                loading={isSaving}
            />
        </div>
    );
}
