import { z } from "zod";

export const ActivityLogChangesSchema = z.object({
    old: z.record(z.unknown()).optional(),
    attributes: z.record(z.unknown()).optional(),
});

export type ActivityLogChanges = z.infer<typeof ActivityLogChangesSchema>;

export const ActivityLogRowSchema = z.object({
    id: z.coerce.number(),
    company: z.string().optional(),
    reseller: z.string().optional(),
    subject: z.string(),
    description: z.string(),
    updated_at: z.string(),
    changes: ActivityLogChangesSchema.optional(),
}).passthrough();

export type ActivityLogRow = z.infer<typeof ActivityLogRowSchema>;
