## Summary

Each reseller row can switch into that reseller’s scope. The action uses the same impersonation request as the sidebar switcher: `POST /impersonate/{user}` with `reseller_id`. It shows for company and super-admin users who have `impersonate.start`, and only when the reseller has a login user. Switch-back from the reseller was not changed. Leaving that scope is blocked by permissions on the impersonated user.

## Files

- `hooks/use-start-impersonation.ts`
- `components/resellers/reseller-row-actions.tsx`
- `components/tenant-switcher.tsx`
- `public/lang/en.json`
- `public/lang/bn.json`
- `tests/unit/resellers/reseller-switch-scope.test.tsx`

## Checks

`npx vitest run tests/unit/resellers/reseller-switch-scope.test.tsx` passed (6 tests). `scripts/ai/typecheck` passed.

On `http://vp.isp.test/resellers`, the row menu shows Switch to reseller. Choosing it opened the dashboard as vp-reseller, with the sidebar marked Impersonating. Switch-back was not completed.

## Git

Uncommitted. Unrelated working-tree changes remain in the client lock files: `components/clients/client-lock-dialog.tsx`, `components/clients/client-row-actions.tsx`, `components/clients/client-view.tsx`, and `tests/unit/clients/client-view-ping-button.test.tsx`.
