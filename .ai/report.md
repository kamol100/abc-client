## Summary

The clients list due amount now has the same pay button as the client view. It opens the existing bulk invoice payment dialog for that row, and the dialog module stays unloaded until Pay is clicked.

## Files

- `components/clients/client-billing-payment-cell.tsx`
- `components/clients/client-row-actions.tsx`
- `components/invoices/lazy-bulk-invoice-pay-dialog.tsx`
- `tests/unit/clients/client-billing-payment-cell.test.tsx`

## Checks

`scripts/ai/typecheck` passed. `scripts/ai/test` ran 267 tests: the new billing cell tests passed. One existing failure remains in `tests/unit/clients/reseller-client-filter-schema.test.ts` and is outside this change.

The clients page loaded in the browser. The bulk payment chunk was not requested while the table was still on its loading skeleton, so the pay click could not be exercised against live rows.
