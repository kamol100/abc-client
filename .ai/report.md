## Summary

The ticket status column is a colored button with the status icon. Opening it lists the four statuses. Choosing one saves without the edit form.

## Frontend

- Users with `tickets.edit` see a status button in the status column. It uses the status color and icon. The menu lists Open, In progress, Resolved, and Closed with the same color and icon.
- The choice sends `PUT /tickets/{id}` with `{ status }` only and refreshes the tickets list.
- A failed save puts the previous status back. The control stays disabled while the request is in flight.
- Users without `tickets.edit` still see the status badge. The client portal table is unchanged.
- English and Bangla strings: `ticket.status.change`, `ticket.status.updated`.

## Checks

- `npx vitest run tests/unit/tickets/ticket-status-select.test.tsx` passed (3 tests).
- `scripts/ai/typecheck` passed.
- `scripts/ai/frontend-check` reached the unit suite. 17 failures are in date picker, pay, maps, column visibility, client account, and reseller filter tests. The ticket status test is not among them.
- Signed in on `vp.isp.test` as vp. The status column shows a colored button with its icon. The menu lists Open, In Progress, Resolved, and Closed. TKT4 changed to In Progress and was set back to Open.

## Unrelated working tree

Invoice print files were already modified and were left alone: `components/invoices/invoice-print-dialog.tsx`, `components/invoices/invoice-receipt.tsx`, `tests/unit/invoices/invoice-receipt.test.tsx`.
