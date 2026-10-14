import { z } from "zod";
import { ClientRowSchema } from "@/components/clients/client-type";

const ArchivedResellerSchema = z.object({
    id: z.number(),
    name: z.string(),
}).passthrough();

export const ArchivedClientRowSchema = ClientRowSchema.extend({
    deleted_at: z.string().nullable().optional(),
    reseller_id: z.number().nullable().optional(),
    reseller: ArchivedResellerSchema.nullable().optional(),
});

export type ArchivedClientRow = z.infer<typeof ArchivedClientRowSchema>;

export const ArchivedClientRestoreSchema = z.object({
    mode: z.enum(["own", "reseller"], {
        required_error: "archived_client.mode.errors.required",
        invalid_type_error: "archived_client.mode.errors.required",
    }),
    reseller_id: z.number().nullable().optional(),
}).superRefine((value, context) => {
    if (value.mode === "reseller" && (value.reseller_id === null || value.reseller_id === undefined)) {
        context.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["reseller_id"],
            message: "archived_client.reseller.errors.required",
        });
    }
});

export type ArchivedClientRestoreInput = z.input<typeof ArchivedClientRestoreSchema>;
