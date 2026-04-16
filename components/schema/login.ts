import { z } from "zod";

export const LoginSchema = z.object({
    api: z.string(),
    username: z.string().min(1, { message: "login.username.errors.required" }),
    password: z
        .string({
            required_error: "login.password.errors.required",
        })
        .min(6, { message: "login.password.errors.required" }),
    host: z.string().optional(),
});

export type Login = z.infer<typeof LoginSchema>;
