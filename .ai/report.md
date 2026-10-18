## Summary

A new-client count above zero on the dashboard client card opens `/clients` filtered to clients created this month. A zero count stays plain text. Users without `clients.access` do not get the link.

## Files

- `components/dashboard/items/DashboardClientSummaryCard.tsx` — link to `/clients?created_at=this_month`
- `app/(dashboard)/clients/page.tsx` — reads `created_at`
- `components/clients/client-table.tsx` — applies the filter and a “show all clients” notice
- `public/lang/en.json`, `public/lang/bn.json`
- `tests/unit/dashboard/dashboard-client-summary-card.test.tsx`

## Checks

`scripts/ai/frontend-check` passed (typecheck and 253 unit tests).

The browser was on the login page (`/admin`), so the dashboard click and the filtered clients list were not exercised in the UI.
