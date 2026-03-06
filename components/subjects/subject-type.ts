import { z } from "zod";

export const SubjectRowSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
}).passthrough();

export type SubjectRow = z.infer<typeof SubjectRowSchema>;

export const SubjectFormSchema = z.object({
    name: z.string({
        required_error: "subject.name.errors.required",
        invalid_type_error: "subject.name.errors.invalid",
    }).min(1, { message: "subject.name.errors.min" }),
});

export type SubjectFormInput = z.input<typeof SubjectFormSchema>;
export type SubjectPayload = z.output<typeof SubjectFormSchema>;
