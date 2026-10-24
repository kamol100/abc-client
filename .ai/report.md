## Summary

Each client row shows the actions menu, then an eye icon, then a lock icon when that client is locked. The eye opens the same client details page as the View menu item, including the new-tab setting.

## Files

- `components/clients/client-row-actions.tsx`
- `components/clients/client-column.tsx`

## Checks

`scripts/ai/typecheck` passed as the first step of `scripts/ai/frontend-check`. The unit run then failed on two existing tests that this change does not touch: `reseller-client-filter-schema.test.ts` (reseller filter label shape) and `reseller-client-table.test.tsx` (next-auth import). 305 other tests passed.

On `http://vp.isp.test/clients`, every row shows the menu, then the eye. The locked client shows the lock icon after the eye.

## Git

Uncommitted. No unrelated frontend files were changed.
