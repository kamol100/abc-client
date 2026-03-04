import { z } from "zod";

export const RoleRowSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
}).passthrough();

export type RoleRow = z.infer<typeof RoleRowSchema>;

export const RoleFormSchema = z.object({
    name: z.string({
        required_error: "role.name.errors.required",
        invalid_type_error: "role.name.errors.required",
    }).min(2, { message: "role.name.errors.min" }),
});

export type RoleFormInput = z.input<typeof RoleFormSchema>;
export type RolePayload = z.output<typeof RoleFormSchema>;
