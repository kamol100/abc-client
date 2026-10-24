## Summary

The staff table has a lock action before Edit. An active account shows an open lock labeled "Lock account". An inactive account shows a closed lock labeled "Unlock account". The button calls `PUT /staffs/{id}/status`, shows a spinner while the request runs, then updates the row and shows a success or error toast.

The staff login form shows "Your account is locked. Please contact your administrator." when NextAuth returns the `account_locked` code.

Users who cannot edit staff do not see the button. Status changes do not use a confirmation dialog; the existing client and payment-gateway status actions do not either.

## Files

- `components/staffs/staff-column.tsx`
- `components/my-button.tsx`
- `components/login/login-form.tsx`
- `auth/auth.ts`
- `public/lang/en.json`
- `public/lang/bn.json`
- `tests/unit/staffs/staff-account-lock.test.tsx`
- `tests/unit/auth/login-form.test.tsx`

## Checks

`scripts/ai/typecheck` passed.

`npx vitest run tests/unit/staffs/staff-account-lock.test.tsx tests/unit/auth/login-form.test.tsx`: 13 tests passed.

Signed in on `http://vp.isp.test/staffs`, locking Vp-Staff changed the badge to Inactive and showed "Staff account locked". The action label became "Unlock account". Unlocking restored Active. The other staff rows stayed active.

## Git

Uncommitted. No unrelated frontend files were changed.
