import { z } from "zod";
import i18n from "i18next";

export const UserStatusSchema = z.coerce.number().pipe(z.union([z.literal(0), z.literal(1)]));

export const USER_STATUS_OPTIONS = [
    { value: 1, label: "Active" },
    { value: 0, label: "Inactive" },
] as const;

export function getUserStatusLabel(status: 0 | 1): string {
    return status === 1 ? "Active" : "Inactive";
}

export const RoleSchema = z.object({
    name: z.string(),
    id: z.number(),
});

export type Role = z.infer<typeof RoleSchema>;

export const CompanySchema = z.object({
    name: z.string(),
    domain: z.string(),
    id: z.number(),
});

export type Company = z.infer<typeof CompanySchema>;

const UserCoreSchema = z.object({
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
    }).email({ message: i18n.t("email_invalid") }).min(1, { message: i18n.t("email_required") }),
    phone: z.string().optional(),
    status: UserStatusSchema.default(1),
});

export const UserRowSchema = UserCoreSchema.extend({
    id: z.coerce.number(),
    roles: z.array(RoleSchema).optional(),
    company: CompanySchema.optional(),
    domain: z.string().nullable().optional(),
    joined_at: z.union([z.string(), z.date()]).optional(),
}).passthrough();

export type UserRow = z.infer<typeof UserRowSchema>;

const BaseUserFormSchema = UserCoreSchema.extend({
    roles_id: z.array(z.coerce.number(), {
        required_error: i18n.t("role_required"),
        invalid_type_error: i18n.t("role_required"),
    }).min(1, { message: i18n.t("role_required") }),
    joined_at: z.date().optional(),
    contract_period: z.object({
        from: z.date(),
        to: z.date().optional(),
    }).optional(),
});

export const CreateUserFormSchema = BaseUserFormSchema.extend({
    password: z.string({
        required_error: i18n.t("password_required"),
        invalid_type_error: i18n.t("password_required"),
    }).min(8, { message: i18n.t("password_min_8") }),
    confirm: z.string().min(8, { message: i18n.t("password_min_8") }),
}).superRefine((data, ctx) => {
    if (data.password !== data.confirm) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: i18n.t("confirm_password_not_match"),
            path: ["confirm"],
        });
    }
}).transform(({ confirm, ...payload }) => payload);

export const UpdateUserFormSchema = BaseUserFormSchema.extend({
    password: z.string().min(8, { message: i18n.t("password_min_8") }).optional(),
    confirm: z.string().min(8, { message: i18n.t("password_min_8") }).optional(),
}).superRefine((data, ctx) => {
    if (data.password || data.confirm) {
        if (!data.password) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: i18n.t("password_required"),
                path: ["password"],
            });
        }
        if (!data.confirm) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: i18n.t("confirm_password_required"),
                path: ["confirm"],
            });
        }
        if (data.password && data.confirm && data.password !== data.confirm) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: i18n.t("confirm_password_not_match"),
                path: ["confirm"],
            });
        }
    }
}).transform(({ confirm, ...payload }) => payload);

export function getUserFormSchema(mode: "create" | "edit") {
    return mode === "create" ? CreateUserFormSchema : UpdateUserFormSchema;
}

export type CreateUserFormInput = z.input<typeof CreateUserFormSchema>;
export type CreateUserPayload = z.output<typeof CreateUserFormSchema>;
export type UpdateUserFormInput = z.input<typeof UpdateUserFormSchema>;
export type UpdateUserPayload = z.output<typeof UpdateUserFormSchema>;
export type UserFormInput = CreateUserFormInput | UpdateUserFormInput;
export type UserApiPayload = CreateUserPayload | UpdateUserPayload;

export const UserSchema = CreateUserFormSchema;
export type User = z.infer<typeof UserSchema>;