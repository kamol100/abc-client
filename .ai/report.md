## Summary

The dashboard shows an invoice collection card for the logged-in staff when today, this month, or last month is greater than zero. The title is “Invoice collection by:” plus the staff name. A long name truncates with an ellipsis. Today, This month, and Last month sit at the bottom of the card, the same way the other summary cards do. Each amount ends in `/-`.

## Frontend

- The card loads `GET /dashboard-staff-invoice-collection` only when the session profile has a staff record.
- Amounts come from payments whose `collect_by` is that staff id.
- English and Bangla: `dashboard.cards.invoice_collection_by`. The period labels reuse the existing dashboard metric keys.

## Checks

- `npx vitest run tests/unit/dashboard/dashboard-staff-invoice-collection-card.test.tsx` passed.
- `scripts/ai/typecheck` passed.
- On `vp.isp.test` the collection card is hidden. Staff vp has no invoice payments in today, this month, or last month. The other summary cards stay in place, with their period rows at the bottom of each card.

## Unrelated working tree

`hooks/use-menu-items.ts` was already modified and was left alone.
