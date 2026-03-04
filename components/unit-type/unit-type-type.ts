import { z } from "zod";
import i18n from "@/i18n";

export const UnitTypeRowSchema = z.object({
    id: z.coerce.number(),
    name: z.string(),
    deletable: z.number().optional(),
}).passthrough();

export type UnitTypeRow = z.infer<typeof UnitTypeRowSchema>;

export const UnitTypeFormSchema = z.object({
    name: z.string({
        required_error: i18n.t("unit_type.name.errors.required"),
        invalid_type_error: i18n.t("unit_type.name.errors.invalid"),
    }).min(2, { message: i18n.t("unit_type.name.errors.min") }),
});

export type UnitTypeFormInput = z.input<typeof UnitTypeFormSchema>;
export type UnitTypePayload = z.output<typeof UnitTypeFormSchema>;
