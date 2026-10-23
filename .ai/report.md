## Summary

The bulk invoice payment dialog now selects the signed-in user's assigned fund. Staff and other non-admin roles cannot change that fund, and they cannot submit a payment when no fund is assigned. Admin and Super Admin can still choose any fund.

## Files

- `components/invoices/payment-fund-access.ts`
- `components/invoices/bulk-invoice-pay-dialog.tsx`
- `types/app.ts`
- `public/lang/en.json`
- `public/lang/bn.json`
- `tests/unit/invoices/payment-fund-access.test.ts`
- `tests/unit/invoices/bulk-invoice-pay-dialog.test.tsx`

The assigned fund comes from `profile.staff.fund` on the existing `/user-settings` payload. Admin and Super Admin are read from `settings.roles`.

## Checks

`scripts/ai/typecheck` passed. `npx vitest run tests/unit/invoices/payment-fund-access.test.ts tests/unit/invoices/bulk-invoice-pay-dialog.test.tsx` passed (11 tests).

The clients page at `http://localhost:3000/clients` redirects to login, so the dialog was not opened in the browser. The component test renders the dialog and checks the four role cases.

These files were already modified and were left unchanged: `components/clients/client-billing-payment-cell.tsx`, `components/invoices/lazy-bulk-invoice-pay-dialog.tsx`, `tests/unit/clients/client-billing-payment-cell.test.tsx`.
