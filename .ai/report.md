## Summary

Editing a staff no longer opens the salary section with a blank allowance or deduction row. Saved rows that have an empty label and an empty or zero amount are left out of the form, so those fields do not fail validation. Add Item and Add Deduction still create a row when the user asks for one.

## Files

- `components/staffs/staff-form-schema.ts` — salary arrays start empty and skip blank saved rows
- `components/form-wrapper/form-builder-type.ts` — `omitBlankItems` on field arrays
- `components/form-wrapper/form-field-defaults.ts` — drop blank field-array rows
- `components/form-wrapper/form-builder.tsx` — apply that filter while filling the edit form
- `tests/unit/staffs/staff-form-schema.test.ts`
- `tests/unit/form/field-array-items.test.ts`

## Checks

`node_modules/.bin/vitest run tests/unit/staffs/staff-form-schema.test.ts tests/unit/form/field-array-items.test.ts` passed (5 tests).

`scripts/ai/typecheck` passed.

A full `scripts/ai/test` run still fails `tests/unit/clients/reseller-client-filter-schema.test.ts` and cannot load `tests/unit/clients/reseller-client-table.test.tsx` (`next/server`). Those files were not part of this change.

In the browser, signed in on `http://vp.isp.test/staffs/edit/a30c61d0-f8c4-43bd-b20d-e801f8021fe3`:

- Salary Information showed Salary & Allowance and Salary Deductions with Add Item and Add Deduction only. No label or value inputs, and no validation errors.
- Add Item created one label and value row. Removing it returned the section to the empty state. The form was not saved.

## Git

This work is uncommitted.
