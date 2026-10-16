## Summary

The client Advance section now has Client Photo, NID Front Side, and NID Back Side uploads. Each file is sent on its own after the client exists. A new client shows a disabled placeholder until it is saved. Existing images load through an authenticated Next.js proxy, so NID files are not public URLs. Normal client save omits `photo`, `nid_front`, and `nid_back`, so an unrelated update does not clear them.

## Files

- `components/clients/client-image-fields.tsx` — upload, preview, replace, and confirmed remove
- `components/clients/client-form.tsx` — slot plus payload omit
- `components/clients/client-form-schema.ts` — Advance slot and field names
- `components/form-wrapper/accordion-form-builder.tsx` — `sectionSlots`
- `components/form-wrapper/form-builder-type.ts` — `slot` field type
- `components/form-wrapper/form-builder.tsx`, `form-field-defaults.ts`, `form-wrapper.tsx` — slots stay out of text validation
- `app/api/clients/[id]/images/[field]/route.ts` — authenticated image proxy
- `public/lang/en.json`, `public/lang/bn.json` — `client.images`

## Checks

`scripts/ai/typecheck` passed.

Signed-in create form at `/clients/create`: Advance shows the three placeholders and “Save the client before uploading images.” Light and dark both use theme tokens. At 390px the cards stack and the page does not overflow sideways. Upload, replace, remove, and an existing-client preview were not exercised in the browser. The clients table did not render row actions in that session. Those paths are covered by the backend Pest tests.

## Assumptions

A client must be saved before an image can be uploaded. Allowed types are JPG, PNG, and WebP, up to 2MB. Preview URLs are `/api/clients/{id}/images/{field}`.
