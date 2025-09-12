
import { z } from "zod";

import i18n from "i18next";

export const UserSchema = z.object({
    name: z.string({
        required_error: i18n.t("name_required"),
        invalid_type_error: i18n.t("name_required"),
    }).min(1, { message: i18n.t("name_required") }),
    username: z.string({
        required_error: i18n.t("username_required"),
        invalid_type_error: i18n.t("username_required"),
    }).min(1, { message: i18n.t("username_required") }),
    email: z.string({
        required_error: i18n.t("email_required"),
        invalid_type_error: i18n.t("email_required"),
    }).min(1, { message: i18n.t("email_required") }),
    // company: z.object({
    //     name: z.string(),
    //     domain: z.string(),
    //     id: z.number(),
    // }),
    domain: z.nullable(z.string()).optional(),
    phone: z.string().optional(),
    status: z.coerce.number().default(1),
    roles: z.array(z.object({
        name: z.string(),
        id: z.number(),
    })).optional(),
    roles_id: z.coerce.number({
        required_error: i18n.t("role_required"),
        invalid_type_error: i18n.t("role_required"),
    }).min(1, { message: i18n.t("role_required") }),
    password: z
        .string({
            required_error: i18n.t("password_required"),
            invalid_type_error: i18n.t("password_required"),
        })
        .min(8, { message: i18n.t("password_required") }).optional(),
    confirm: z.string().min(8, { message: i18n.t("password_not_match") }).optional(),
}).refine((data) => data.password === data.confirm, {
    message: "confirm_password_not_match",
    path: ["confirm"],
});

export type User = z.infer<typeof UserSchema>;