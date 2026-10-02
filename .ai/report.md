## Summary

The package table shows `buying_price` only when the signed-in user is a reseller (`profile.reseller`). Company users keep the price column and do not see buying price.

## Files Changed

- `components/packages/package-column.tsx` — `useProfile()`; `buying_price` is included only when `!!profile?.reseller`
- `tests/unit/packages/package-column.test.tsx` — reseller shows the column; a company user does not

## Tests

`scripts/ai/typecheck` — exit 0.

`scripts/ai/test` — exit 0 (Vitest: 4 files, 9 tests).

ESLint was not run. `npm run lint` is already broken in this repo. `/packages` redirected the browser to `/admin` because that session is not logged in, so the column was not confirmed on the page.

## Security

The column is hidden in the UI. The packages API still returns `buying_price`. This does not change tenant or reseller scope.

## Risks

A reseller whose profile has not loaded yet (`profile.reseller` empty) will not see the column until profile data is present.

## Git Diff

Branch `master`, ahead of `origin/master` by 1. Unrelated working-tree changes remain: client payment-term defaults, form `disabled` / dropdown defaults, and the package edit price lock (`components/clients/`, `components/form-wrapper/`, `components/form/textarea-field.tsx`, `components/packages/package-form.tsx`, `components/packages/package-form-schema.ts`, `tests/unit/clients/`, `tests/unit/packages/package-form-schema.test.ts`).
