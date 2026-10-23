## Summary

The staff form Advance section uploads a photo, NID front, and NID back the same way as client images. The record is saved first. On edit, each file is posted as multipart form data to `/staffs/{id}/images/{field}`. Saving other staff details does not send the image fields, so existing files stay in place.

## Files

- `components/form/private-image-fields.tsx` — shared preview, upload, replace, and remove UI
- `components/clients/client-image-fields.tsx` — client wrapper
- `components/staffs/staff-image-fields.tsx` — staff wrapper
- `components/staffs/staff-form-schema.ts` — Advance slot; the text NID field is removed
- `components/staffs/staff-form.tsx` — omits image paths from the staff save payload
- `components/staffs/staff-type.ts` — `photo`, `nid_front`, `nid_back`
- `lib/images/private-image.ts` and `lib/images/proxy-private-image.ts`
- `app/api/staffs/[id]/images/[field]/route.ts` — authenticated image proxy
- `app/api/clients/[id]/images/[field]/route.ts` — uses the same proxy
- `public/lang/en.json` and `public/lang/bn.json`
- `tests/unit/images/private-image.test.ts`
- `tests/unit/staffs/staff-form-schema.test.ts`

## Checks

`scripts/ai/typecheck` passed. The new unit tests passed (5 tests).

`scripts/ai/test` ran the full unit suite: 281 passed, 1 failed. The failure is `tests/unit/clients/reseller-client-filter-schema.test.ts`, which this change does not touch.

`/staffs/create` redirects to the login page. The seeded admin password was rejected, so the Advance section was not opened in the browser.
