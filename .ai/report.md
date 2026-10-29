## Summary

The create-client PPPoE ID label now shows the next ownership-scoped SID after the required mark, for example `PPPoE ID * SID:8` when the last company SID is 7. Edit and import forms stay unchanged.

## Files

- `components/clients/client-form.tsx`
- `components/clients/client-form-schema.ts`
- `components/label.tsx`
- `components/form-wrapper/form-builder-type.ts`
- `public/lang/en.json`
- `public/lang/bn.json`
- `tests/unit/clients/client-form-schema.test.ts`

## Checks

- `npx vitest run tests/unit/clients/client-form-schema.test.ts`: 5 passed.
- `npx tsc --noEmit`: passed.
- Browser: signed in on `http://vp.isp.test/clients/create`. The PPPoE ID label rendered `PPPoE ID * SID:8`.

## Git

Uncommitted. The SID preview depends on `GET /api/v1/client-next-sid` in `isp-backend`.
