## Summary

The user form no longer asks for roles. Username stays on create and edit, and the edit form can change it.

## Frontend

- Removed the roles dropdown from `UserFormSchema` for both create and edit.
- Dropped `roles_id` from the create and update Zod schemas so the form can submit without a role.
- Username remains required and is shown on both modes. Password and confirm stay create-only.

## Checks

- `npx vitest run tests/unit/users/user-form-schema.test.ts`: 2 passed.
- `scripts/ai/typecheck` passed.
- Browser: Add User and Edit User on `http://app.isp.test/users` have no roles field. Edit opens with the current username filled, and the field accepts a new value. The dialog was cancelled so the live user was not saved.

## Unrelated working tree

Left as found: password field visibility work (`components/form/password-field.tsx`, `input-field.tsx`, login and reset forms, form builder, company column, lang files, `tests/unit/form/password-visibility.test.tsx`).
