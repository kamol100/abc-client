## Summary

After a successful `invoices/bulk-pay` response, `BulkInvoicePayDialog` closes and opens the existing `InvoicePrintDialog` for the invoices the API returned as paid or partial. The dialog is not opened on error, because `useApiMutation` only calls `onSuccess` for a successful response. It is also not opened when no returned invoice is paid or partial.

The print dialog gets the invoice objects from the pay response (updated status, `amount_paid`, lines, client), so it does no extra fetch. The response `id` is the UUID, so `toPaidInvoices` (in `invoice-type.ts`) maps it to `uuid` and parses with the lenient `InvoiceRowSchema`. The strict `InvoiceDetailSchema` was dropping invoices (e.g. line `amount > 0`), so the print dialog never opened.

The `clients` and `invoices` list refresh now runs when the print dialog closes (or right away if there is nothing to print). Before, it ran on payment success, and `InvoiceTable` swaps its rows for a skeleton while fetching. That unmounted the row, the pay dialog and the print dialog, so the print dialog never appeared.

## Files Changed

- `components/invoices/bulk-invoice-pay-dialog.tsx`
- `components/invoices/invoice-row-actions.tsx`
- `components/invoices/invoice-type.ts`
- `tests/unit/invoices/paid-invoices.test.ts`

`invoice-row-actions.tsx` used to mount the pay dialog only while it was open, which would also have unmounted the print dialog. It now mounts once the due list is loaded, with a `key` built from the due UUIDs so the selection state resets when the list changes.

## Tests

`scripts/ai/typecheck` exit 0. `scripts/ai/test` completed. `vitest run tests/unit/invoices` passed 4 tests. Not checked in a browser.

## Risks

- If the list refetch after payment removes the row or client that hosts the dialog (for example under a "due only" filter), the print dialog unmounts with it.
- With a partial payment, only invoices that are no longer `due` are printed.
- `Invoices::whereIn(...)` in the backend returns every requested UUID, so the status filter on the client is what excludes untouched invoices.
