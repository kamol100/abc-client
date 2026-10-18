## Summary

Reports now includes Reseller Clients at `/reports/reseller-clients`. The page reuses the client table and its filters, and adds a Reseller dropdown. Clearing that dropdown, or leaving it empty, requests every reseller in the company.

## Files

- `hooks/use-menu-items.ts` — item after Product Out, permission `resellers.clients.report`
- `app/(dashboard)/reports/reseller-clients/page.tsx`
- `components/clients/client-table.tsx` — `variant="reseller-clients"` calls `resellers/clients`
- `components/clients/reseller-client-filter-schema.ts`
- `public/lang/en.json`, `public/lang/bn.json`
- `tests/unit/clients/reseller-client-filter-schema.test.ts`
- `tests/unit/clients/reseller-client-table.test.tsx`

The default `/clients` table still uses `GET /clients`, the create button, and the activity counts.

## Checks

`scripts/ai/frontend-check` passed (typecheck and 256 unit tests). ESLint was not run.

The signed-in app opened `/reports/reseller-clients` with the title Reseller Clients. The table stayed on its loading skeleton, and `/clients` did the same in that session, so the live rows and reseller dropdown were not exercised. The menu item stays hidden until the `resellers.clients.report` permission exists for that user.
