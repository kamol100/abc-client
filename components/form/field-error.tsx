"use client";

import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

function getNestedError(errors: Record<string, unknown>, name: string): { message?: string } | undefined {
    const parts = name.split(".");
    let current: unknown = errors;
    for (const part of parts) {
        if (current == null || typeof current !== "object") return undefined;
        current = (current as Record<string, unknown>)[part];
    }
    return current as { message?: string } | undefined;
}

export default function FieldError({
    name,
    errorMessageEllipsis = false,
    reserveSpace = false,
}: {
    name: string;
    errorMessageEllipsis?: boolean;
    /** When true, always reserves space for one line of error so layout (e.g. grid rows) does not shift when error appears */
    reserveSpace?: boolean;
}) {
    const { formState: { errors } } = useFormContext();
    const { t } = useTranslation();
    const error = getNestedError(errors as Record<string, unknown>, name) as { message?: string };
    const message = error?.message;
    if (reserveSpace) {
        return (
            <div className="min-h-[1.25rem]">
                {message ? (
                    <p
                        className={cn("text-sm text-destructive mt-1", errorMessageEllipsis && "line-clamp-1")}
                        title={t(message)}
                    >
                        {t(message)}
                    </p>
                ) : null}
            </div>
        );
    }
    if (!message) return null;
    return (
        <p
            className={cn("text-sm text-destructive mt-1", errorMessageEllipsis && "line-clamp-1")}
            title={t(message)}
        >
            {t(message)}
        </p>
    );
}
