import { z } from "zod";

export const ChangePasswordFormSchema = z
  .object({
    current_password: z
      .string({
        required_error: "user_profile.change_password.current_password.errors.required",
        invalid_type_error:
          "user_profile.change_password.current_password.errors.required",
      })
      .min(1, {
        message: "user_profile.change_password.current_password.errors.required",
      }),
    password: z
      .string({
        required_error: "user_profile.change_password.password.errors.required",
        invalid_type_error: "user_profile.change_password.password.errors.required",
      })
      .min(8, { message: "user_profile.change_password.password.errors.min" }),
    password_confirmation: z
      .string({
        required_error:
          "user_profile.change_password.password_confirmation.errors.required",
        invalid_type_error:
          "user_profile.change_password.password_confirmation.errors.required",
      })
      .min(1, {
        message: "user_profile.change_password.password_confirmation.errors.required",
      }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.password_confirmation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "user_profile.change_password.password_confirmation.errors.mismatch",
        path: ["password_confirmation"],
      });
    }
  });

export type ChangePasswordFormInput = z.input<typeof ChangePasswordFormSchema>;
export type ChangePasswordPayload = z.output<typeof ChangePasswordFormSchema>;

export const CHANGE_PASSWORD_DEFAULTS: ChangePasswordFormInput = {
  current_password: "",
  password: "",
  password_confirmation: "",
};
