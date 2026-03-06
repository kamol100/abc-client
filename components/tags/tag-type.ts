import { z } from "zod";

export const TagRowSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
}).passthrough();

export type TagRow = z.infer<typeof TagRowSchema>;

export const TagFormSchema = z.object({
    name: z.string({
        required_error: "tag.name.errors.required",
        invalid_type_error: "tag.name.errors.invalid",
    }).min(1, { message: "tag.name.errors.required" }),
});

export type TagFormInput = z.input<typeof TagFormSchema>;
export type TagPayload = z.output<typeof TagFormSchema>;
