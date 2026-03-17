import { z } from "zod";

export const UserStatusSchema = z.coerce.number().pipe(z.union([z.literal(0), z.literal(1)]));

export const USER_STATUS_OPTIONS = [
    { value: 1, label: "common.active" },
    { value: 0, label: "common.inactive" },
] as const;

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
        required_error: "user.name.errors.required",
        invalid_type_error: "user.name.errors.invalid",
    }).min(3, { message: "user.name.errors.min" }),
    username: z.string({
        required_error: "user.username.errors.required",
        invalid_type_error: "user.username.errors.invalid",
    }).min(3, { message: "user.username.errors.min" }),
    email: z.string().email({ message: "user.email.errors.invalid" }).min(3, { message: "user.email.errors.min" }),
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

export type UserDetail = UserRow;

const BaseUserFormSchema = UserCoreSchema.extend({
    roles_id: z.array(z.coerce.number()).min(1, { message: "user.roles.errors.min" }),
});

export const CreateUserFormSchema = BaseUserFormSchema.extend({
    password: z.string({
        required_error: "user.password.errors.required",
        invalid_type_error: "user.password.errors.invalid",
    }).min(8, { message: "user.password.errors.min" }),
    confirm: z.string({
        required_error: "user.confirm_password.errors.required",
        invalid_type_error: "user.confirm_password.errors.invalid",
    }).min(8, { message: "user.confirm_password.errors.min" }),
}).superRefine((data, ctx) => {
    if (data.password !== data.confirm) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "user.confirm_password.errors.not_match",
            path: ["confirm"],
        });
    }
}).transform(({ confirm, ...payload }) => payload);

export const UpdateUserFormSchema = BaseUserFormSchema.extend({
    password: z.string({
        required_error: "user.password.errors.required",
        invalid_type_error: "user.password.errors.invalid",
    }).min(8, { message: "user.password.errors.min" }).optional(),
    confirm: z.string({
        required_error: "user.confirm_password.errors.required",
        invalid_type_error: "user.confirm_password.errors.invalid",
    }).min(8, { message: "user.confirm_password.errors.min" }).optional(),
}).superRefine((data, ctx) => {
    if (data.password || data.confirm) {
        if (!data.password) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "user.password.errors.required",
                path: ["password"],
            });
        }
        if (!data.confirm) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "user.confirm_password.errors.required",
                path: ["confirm"],
            });
        }
        if (data.password && data.confirm && data.password !== data.confirm) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "user.confirm_password.errors.not_match",
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
