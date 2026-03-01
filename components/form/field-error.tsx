"use client";

import { useFormContext } from "react-hook-form";

function getNestedError(errors: Record<string, unknown>, name: string): { message?: string } | undefined {
    const parts = name.split(".");
    let current: unknown = errors;
    for (const part of parts) {
        if (current == null || typeof current !== "object") return undefined;
        current = (current as Record<string, unknown>)[part];
    }
    return current as { message?: string } | undefined;
}

export default function FieldError({ name }: { name: string }) {
    const { formState: { errors } } = useFormContext();
    const error = getNestedError(errors as Record<string, unknown>, name);
    if (!error?.message) return null;
    return <p className="text-sm text-destructive mt-1">{error.message}</p>;
}
