import { z } from "zod";

export const LoginSchema = z.object({
    username: z.string().min(1, { message: "username_required" }),
    password: z
        .string({
            required_error: "password_required",
        })
        .min(6, { message: "password_required" }),
    host: z.string().optional(),
});

export type Login = z.infer<typeof LoginSchema>;
