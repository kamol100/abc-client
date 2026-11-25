"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";

/**
 * Creates the form: React Hook Form, validated by the Zod schema on every change.
 * `data` is only read once, when the form mounts.
 */
export function useEntityForm(schema: z.ZodType, data?: Record<string, unknown>) {
    return useForm<FieldValues>({
        // The schema's own input and output types are not known here, so it is passed untyped.
        resolver: zodResolver(
            schema as unknown as Parameters<
                typeof zodResolver<FieldValues, unknown, FieldValues>
            >[0]
        ),
        mode: "onChange",
        defaultValues: data as Record<string, unknown>,
    });
}
