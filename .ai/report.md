## Summary

The MikroTik sync filter bar now includes a reseller dropdown. Choosing a reseller sends `reseller_id` and the list shows only that reseller's rows.

## Frontend

- `components/mikrotik-sync/mikrotik-sync-filter-schema.ts` adds a clearable dropdown named `reseller_id`. Options come from `/dropdown-resellers/company`.
- `components/mikrotik-sync/mikrotik-sync-table.tsx` lays the filters out on two rows so the extra field fits.
- `public/lang/en.json` and `public/lang/bn.json` add `mikrotik_sync.filters.reseller.placeholder`.
- `tests/unit/mikrotik-sync/mikrotik-sync-filter-schema.test.ts` checks the dropdown contract.

The list query still uses `mikrotik-sync`. No `company_id` is sent. `reseller_id` is a filter value, not an authorization input.

## Checks

- `scripts/ai/typecheck`: passed.
- `npx vitest run tests/unit/mikrotik-sync/mikrotik-sync-filter-schema.test.ts`: 1 passed.
- `public/lang/en.json` and `public/lang/bn.json` parse as JSON.
- `npm run lint` was not run. This repo's ESLint config is already known to fail under Next 16.
- Browser: `http://localhost:3000/mikrotik-sync` redirects to `/admin` login. The dropdown was not exercised in a signed-in session.

## Remaining

- The reseller options require the existing `dropdown.resellers` permission, the same gate used by the client reseller filter and the bulk import dialog.
- The matching API filter is `ExactColumn('reseller_id')` in the backend `MikrotikSync` filter pipeline.
