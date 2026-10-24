## Summary

Admin and Super Admin users get a Lock Client or Unlock Client item in the client row menu. The label and icon follow `is_locked`. Confirming sends one request to `PUT /clients/{uuid}/lock` and refreshes the client lists. Other roles do not see the item.

## Files

- `components/clients/client-row-actions.tsx`
- `components/clients/client-type.ts`
- `public/lang/en.json`
- `public/lang/bn.json`

## Checks

`scripts/ai/typecheck` passed. `en.json` and `bn.json` both parse.

The clients page at `http://vp.isp.test/clients` loaded while signed in. The row-menu click was not completed, so the new item was not exercised in the browser. The lock API is covered by the backend tests. The menu will fail until the backend migration has run.

## Git

Uncommitted. No unrelated frontend files were changed.
