## Summary

The reseller advance section now uploads a profile photo (`avatar`), NID front, and NID back with the same private image fields used by clients and staff. Images are sent only after the reseller exists. Create shows a save-first message. Edit previews the stored file, and replace or remove updates that one field.

The text National ID field is gone from the form, the view, and both language files. Create and update omit image paths so a normal save does not clear stored files.

## Files

- `components/resellers/reseller-form-schema.ts`
- `components/resellers/reseller-form.tsx`
- `components/resellers/reseller-image-fields.tsx`
- `components/resellers/reseller-type.ts`
- `components/resellers/reseller-basic-view.tsx`
- `components/form/private-image-fields.tsx`
- `lib/images/private-image.ts`
- `lib/images/proxy-private-image.ts`
- `app/api/resellers/[id]/images/[field]/route.ts`
- `public/lang/en.json`
- `public/lang/bn.json`
- `tests/unit/resellers/reseller-form-schema.test.ts`
- `tests/unit/images/private-image.test.ts`

## Checks

`npx vitest run` on the reseller form schema, reseller form, private image, and staff form schema tests passed (18 tests). `scripts/ai/typecheck` passed.

`http://vp.isp.test/resellers/create` redirected to the admin login, so the upload controls were not clicked in the browser. The form schema test covers the slot, field names, and removal of the old NID text field.

## Git

Uncommitted.
