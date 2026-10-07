## Summary

The dashboard shows a Reseller Overview card beside the client card when the user has `dashboard-card.reseller`.

## Files changed

- `components/dashboard/items/DashboardResellerSummaryCard.tsx`
- `components/dashboard/dashboard-overview.tsx`
- `components/dashboard/use-dashboard-data.ts`
- `components/dashboard/dashboard-type.ts`
- `components/dashboard/dashboard-constants.ts`
- `public/lang/en.json`
- `public/lang/bn.json`
- `tests/unit/dashboard/dashboard-reseller-summary-card.test.tsx`

## Behavior

The card reads `GET dashboard-reseller-count`. The header is `Total Resellers(count)` with `Client` and the client total. The rows are active clients, inactive clients, and resellers created this month. Loading and error states use the same metric card as the client overview.

The card stays hidden until `dashboard-card.reseller` exists on the user's permission list.

## Tests

`npx vitest run tests/unit/dashboard/dashboard-reseller-summary-card.test.tsx` passed (4 tests).

`scripts/ai/typecheck` passed.

The signed-in dashboard was not opened. No app server was running, and the new permission is not in the database until `update:permission` runs.

## Left untouched

Unrelated working-tree changes in `components/invoices/invoice-receipt.tsx` and `components/invoices/invoice-type.ts` were not edited. Existing `client_id` translation lines in `en.json` and `bn.json` were left in place.
