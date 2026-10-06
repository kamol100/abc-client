## Summary

<<<<<<< Updated upstream
Removed the reseller invoice page, its table, the Invoice menu item, and the reseller list Due and Paid columns. Those columns only summed reseller bills. Client invoice listing, payment, and printing are unchanged.

## Files changed

- `hooks/use-menu-items.ts`
- `components/invoices/invoice-row-actions.tsx`
- `components/resellers/reseller-column.tsx`
- `components/resellers/reseller-type.ts`
- `public/lang/en.json`
- `public/lang/bn.json`

## Files deleted

- `app/(dashboard)/reseller-invoices/page.tsx`
- `components/reseller-invoice/reseller-invoice-table.tsx`
- `components/reseller-invoice/reseller-invoice-column.tsx`
- `components/reseller-invoice/reseller-invoice-type.ts`

## Menu and permissions

Removed the Invoice submenu item "Reseller Invoice" (`/reseller-invoices`, permission `reseller-invoices.access`).

Removed translation keys `reseller_invoice` and `menu.reseller_invoice`, plus `reseller.table.due` and `reseller.table.paid`.

## Tests

`scripts/ai/frontend-check`: typecheck passed, then Vitest 16 files / 60 tests passed. ESLint was not run; the repo lint script does not succeed.

The local Next route types under `.next/types` still named `/reseller-invoices` and were updated so `tsc` could pass. They are generated and not part of the source diff.

## Browser

`/invoices` redirected to the login page. The seeded `admin` / `password` login was rejected by the running app, so the invoice menu and reseller table were not opened while signed in.

## Retained on purpose

Client invoice columns, pay, print, and edit/delete actions. `InvoiceRowActions` no longer has a reseller-invoice flag; edit and delete follow the same invoice permissions as before.
=======
`DisplayCount` appends `/-` after currency amounts by default. `currencySuffix={false}` hides it. Plain counts are unchanged. `hideCurrency` still defaults to hiding `BDT`.

## Files changed

- `components/display-count.tsx`
- `tests/unit/components/display-count.test.tsx`

Earlier reseller client-count edits remain uncommitted in `components/resellers/reseller-column.tsx` and `components/resellers/reseller-type.ts`.

## Tests

`scripts/ai/test`: 15 files, 57 tests, passed. `scripts/ai/typecheck` passed. ESLint was not run.

## Not verified

The wallet amount was not checked in the browser. `/resellers` redirects to login.
>>>>>>> Stashed changes
