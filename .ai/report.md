## Summary

Staff rows now have a reset-password action after the lock button. It opens a dialog with the staff name and a new-password field, then sends `PUT /staffs/{staff}/password`. The button is shown for `staffs.reset-password` or `staffs.edit`.

## Files

- `components/staffs/staff-column.tsx`
- `components/staffs/staff-form-schema.ts`
- `components/staffs/staff-type.ts`
- `public/lang/en.json`
- `public/lang/bn.json`
- `tests/unit/staffs/staff-account-lock.test.tsx`

## Checks

`npx vitest run tests/unit/staffs/staff-account-lock.test.tsx` passed (9 tests). `scripts/ai/typecheck` passed.

Signed in on `http://vp.isp.test/staffs`. Each row shows Reset password after Lock account. Opening it shows the staff name, a new-password field, Cancel, and Reset password. The dialog was closed without saving, so no live password was changed.

## Git

Uncommitted. Left unrelated work untouched: `app/api/manifest/route.ts`, `components/agents/agent-column.tsx`, `components/bkash-payment/bkash-payment-result-notice.tsx`, and `tests/unit/bkash-payment/bkash-payment-result-notice.test.tsx`. Language files also contain that earlier bKash copy.
