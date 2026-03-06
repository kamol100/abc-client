import { z } from "zod";

export const HistoryRecordSchema = z.record(z.unknown());

export const HistoryRowSchema = z
    .object({
        id: z.union([z.string(), z.coerce.number()]),
        description: z.string().nullable().optional(),
        staff: z.string().nullable().optional(),
        old_data: HistoryRecordSchema.nullable().optional(),
        new_data: HistoryRecordSchema.nullable().optional(),
        created_at: z.string().nullable().optional(),
    })
    .passthrough();

export const HistoryFormSchema = z.object({
    description: z.string().optional(),
    staff_id: z.string().optional(),
    created_at: z.string().optional(),
});

export type HistoryRow = z.infer<typeof HistoryRowSchema>;
export type HistoryFormInput = z.input<typeof HistoryFormSchema>;
export type HistoryPayload = z.output<typeof HistoryFormSchema>;
