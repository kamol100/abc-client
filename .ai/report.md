## Summary

The staff impersonate button is hidden on the signed-in user's own staff row.

## Frontend

- `components/staffs/staff-column.tsx` compares the row with the current profile. A match on the linked user uuid or the staff uuid removes the button.
- The API still rejects impersonating yourself if that request is sent.

## Checks

- `scripts/ai/typecheck` passed.
- `npx vitest run tests/unit/staffs/staff-impersonate.test.tsx tests/unit/staffs/staff-account-lock.test.tsx` passed (15 tests).

## Browser

Not rechecked. On `vp.isp.test` the button is still absent for every row because `impersonate.staff` is not in the permission catalog yet, so the own-row case cannot be exercised in the browser.

## Security

Hiding the button is only the UI. `ImpersonationService` still returns 403 for self-impersonation.
