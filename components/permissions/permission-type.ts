import { z } from "zod";

export const RoleRefSchema = z
  .object({
    id: z.coerce.number(),
    name: z.string(),
    guard_name: z.string().nullable().optional(),
  })
  .passthrough();

export const PermissionRowSchema = z
  .object({
    id: z.coerce.number().optional(),
    name: z.string(),
  })
  .passthrough();

export const PermissionSelectionSchema = z.array(z.string());

export const PermissionFormSchema = z.object({
  role_id: z
    .number({
      required_error: "permission.role.errors.required",
      invalid_type_error: "permission.role.errors.required",
    })
    .min(1, { message: "permission.role.errors.required" }),
  guard_name: z.string().nullable().optional(),
  permission: PermissionSelectionSchema.default([]),
});

export type RoleRef = z.infer<typeof RoleRefSchema>;
export type PermissionRow = z.infer<typeof PermissionRowSchema>;
export type PermissionFormInput = z.input<typeof PermissionFormSchema>;
export type PermissionPayload = z.output<typeof PermissionFormSchema>;

