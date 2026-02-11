---
name: user-schema-single-source-truth
overview: Refactor `components/schema/user.ts` into a composable, strictly-typed Zod+TypeScript module that exports shared schemas, mode-specific form validation, inferred types (form input, API payload, table row), and enum/option helpers. Then update `user-form.tsx` and `users-column.tsx` to consume those exports without redefining types or using `any`.
todos:
  - id: schema-refactor
    content: Refactor `components/schema/user.ts` into composable schemas (core/row/form) + export inferred types and status options/helpers.
    status: completed
  - id: user-form-consume
    content: Update `components/users/user-form.tsx` to use `getUserFormSchema(mode)` and typed `data` prop based on exported `UserRow`.
    status: completed
  - id: users-column-consume
    content: Update `components/users/users-column.tsx` to use `UserRow`/`Role` exports, remove `any`, and render status/domain via schema helpers.
    status: completed
  - id: supporting-typing
    content: If necessary for TS, adjust `components/users/user-table.tsx` to type/cast fetched `users` as `UserRow[]` once (no redefinitions).
    status: completed
isProject: false
---

## What’s broken today (why refactor)

- The current `UserSchema` is a *form-ish* shape, but table columns expect fields that aren’t in the schema (e.g. `company`, `Role` type) and work around this with `any`.

```6:52:components/schema/user.ts
export const UserSchema = z.object({
    name: z.string({
        required_error: i18n.t("name_required"),
        invalid_type_error: i18n.t("name_required"),
    }).min(1, { message: i18n.t("name_required") }),
    // ...
    status: z.coerce.number().default(1),
    roles: z.array(z.object({
        name: z.string(),
        id: z.number(),
    })).optional(),
    roles_id: z.array(z.coerce.number(), {
        required_error: i18n.t("role_required"),
        invalid_type_error: i18n.t("role_required"),
    }).min(1, { message: i18n.t("role_required") }),
    password: z.string({
        required_error: i18n.t("password_required"),
        invalid_type_error: i18n.t("password_required"),
    }).min(8, { message: i18n.t("password_required") }).optional(),
    confirm: z.string().min(8, { message: i18n.t("password_not_match") }).optional(),
    // ...
}).refine((data) => data.password === data.confirm, {
    message: "confirm_password_not_match",
    path: ["confirm"],
});
```

```21:66:components/users/users-column.tsx
{
  accessorKey: "roles",
  // ...
  cell: ({ row }) => {
    const user = row.original;
    return (
      <span>
        {user.roles?.map((role: Role) => role.name).join(", ")}
      </span>
    );
  },
},
{
  accessorKey: "company",
  cell: ({ row }) => <span>{row.original.company?.name}</span>,
},
{
  accessorKey: "domain",
  cell: ({ row }) => <span>{row.original.company.domain}</span>,
},
{
  accessorKey: "status",
  cell: ({ row }) => {
    const user: any = row.original;
    const status = user.status;
    // ...
  },
},
```

- Form validation is not truly mode-aware: password/confirm are optional in the schema, but the UI hides/shows them based on `mode`. That makes “create user” validation weaker than intended.

## Target design (single source of truth)

Refactor `components/schema/user.ts` into small composable building blocks and explicit “form vs payload vs table row” outputs.

### 1. Add strongly typed enums/options

- Export `UserStatusSchema` as a coercing Zod schema that ultimately narrows to `0 | 1`.
- Export `USER_STATUS_OPTIONS` as `readonly` options (for shadcn/react-select) and `getUserStatusLabel(status)`.

### 2. Extract shared schemas (composable)

In `components/schema/user.ts`:

- `RoleSchema` + `export type Role = z.infer<typeof RoleSchema>`
- `CompanySchema` + `export type Company = z.infer<typeof CompanySchema>`
- `UserCoreSchema` (shared identity fields): `name`, `username`, `email` (strengthen with `.email()`), `phone?`, `status`.

### 3. Define table row schema/type (table-only)

- `UserRowSchema = UserCoreSchema.extend({ id: z.coerce.number(), roles: z.array(RoleSchema).optional(), company: CompanySchema.optional(), domain: z.string().nullable().optional(), joined_at: z.union([z.string(), z.date()]).optional() }).passthrough()`
- Export `export type UserRow = z.infer<typeof UserRowSchema>`
  - Keeps columns type-safe without requiring form-only fields (`password`, `confirm`, `roles_id`).

### 4. Define form schemas (form-only) and make them mode-aware

- `CreateUserFormSchema`:
  - Includes `UserCoreSchema` + `roles_id: number[] (min 1)` + `password` + `confirm` + optional date fields.
  - Uses `superRefine` to enforce password/confirm match.
  - Uses a final `.transform(({ confirm, ...payload }) => payload)` so submit values are already the API payload shape.
- `UpdateUserFormSchema`:
  - Same as create, but `password`/`confirm` optional; if one is provided, require the other and enforce match.
  - Also `.transform` to strip `confirm`.
- Export `getUserFormSchema(mode)` that returns the correct schema.

### 5. Export the requested inferred types

From `components/schema/user.ts` export:

- **Zod schemas**: `CreateUserFormSchema`, `UpdateUserFormSchema`, `getUserFormSchema`, `UserRowSchema`.
- **Types**:
  - `CreateUserFormInput = z.input<typeof CreateUserFormSchema>` (what RHF inputs may look like)
  - `CreateUserPayload = z.output<typeof CreateUserFormSchema>` (post-transform)
  - `UpdateUserFormInput`, `UpdateUserPayload`
  - `UserFormInput = CreateUserFormInput | UpdateUserFormInput`
  - `UserApiPayload = CreateUserPayload | UpdateUserPayload`
  - `UserRow`

This cleanly separates:

- **Form input** (pre-parse/coercion)
- **API payload** (post-parse + `confirm` removed)
- **Table row data** (list/display)

## Consumer updates (no type redefinition)

### 6. Update `components/users/user-form.tsx`

- Replace `UserSchema` import with `getUserFormSchema` (mode-aware).
- Type `Props` using exports:
  - `mode?: "create" | "edit"` stays.
  - `data?: UserRow` (so edit form is typed correctly).

### 7. Update `components/users/users-column.tsx`

- Replace `User` with `UserRow` and import `Role`, `USER_STATUS_OPTIONS`/`getUserStatusLabel`.
- Remove `any` in status cell; render label via helper.
- Make the “Domain” cell robust to both shapes without lying to the type system:
  - Use `row.original.domain ?? row.original.company?.domain ?? ""`.

### 8. Minimal supporting typing adjustments (only if needed for TS)

- If TypeScript complains in `user-table.tsx` about `users` being `unknown`, cast it once:
  - `const users = (data?.data?.data ?? []) as UserRow[];`

## Verification

- Ensure `users-column.tsx` compiles with **no `any**` and no implicit globals (`Role`).
- Ensure create/edit schema enforces the correct password rules.
- Ensure `user-form.tsx` only consumes exported schema/types; no duplicated `User` type.

## Key design decisions (brief)

- **Mode-specific schemas** prevent weak validation on create and keep edit flexible.
- **Transform-to-payload** ensures the same schema drives validation and the API payload type (and strips `confirm` automatically).
- **Separate `UserRow**` avoids mixing table-only relational fields (`company`, `roles`) with form-only fields (`roles_id`, `confirm`).
- **Exported options/helpers** centralize enum labels (status) for both form and table rendering.

