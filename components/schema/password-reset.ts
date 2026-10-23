import { z } from "zod";

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "password_reset.email.errors.required" })
    .email({ message: "password_reset.email.errors.invalid" }),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8, { message: "password_reset.password.errors.min" }),
    password_confirmation: z
      .string()
      .min(1, { message: "password_reset.password.errors.confirm_required" }),
  })
  .refine((values) => values.password === values.password_confirmation, {
    message: "password_reset.password.errors.mismatch",
    path: ["password_confirmation"],
  });

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
