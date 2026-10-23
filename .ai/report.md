## Summary

The clients list loads online status once per page instead of once per row. Refetching the list no longer replaces the table with a skeleton. Client details mounts invoices, payments, tickets, and history from the route id, and each section waits until it is near the viewport. The speed widget polls every 15 seconds and pauses while the tab is hidden. Embedded invoices ask the API to skip report totals and line items. Server-paged tables render every row returned for the page.

## Files

- `components/clients/client-table.tsx`
- `components/clients/client-online-status-cell.tsx`
- `components/clients/client-column.tsx`
- `components/clients/client-view.tsx`
- `components/clients/client-view-skeleton.tsx`
- `components/clients/client-speed-widget.tsx`
- `components/invoices/invoice-table.tsx`
- `components/payments/payment-table.tsx`
- `components/tickets/ticket-table.tsx`
- `components/data-table/data-table.tsx`
- `hooks/use-in-view.ts` — render the section when `IntersectionObserver` is missing

## Checks

`scripts/ai/typecheck` passed.

`node_modules/.bin/vitest run tests/unit/clients/client-view-ping-button.test.tsx tests/unit/clients/client-router-info.test.tsx tests/unit/clients/client-billing-payment-cell.test.tsx` passed (11 tests).

A full `scripts/ai/test` run still fails `tests/unit/clients/reseller-client-filter-schema.test.ts` and cannot load `tests/unit/clients/reseller-client-table.test.tsx` (`next/server`). Those files were not part of this change.

In the browser, signed in as Super Admin on `http://app.isp.test/clients`:

- The list showed 10 rows at 10 per page, page buttons, a Pay action, and online cells with router IPs.
- Nginx recorded one `GET /api/v1/client-online-status?uuids=...` (10 ids, HTTP 200) and one `GET /api/v1/client-activity` (HTTP 200) for that page load.
- Opening a client showed the header, invoices (`include_reports=0`, HTTP 200), payments, tickets with reply counts, and, after scrolling, history with the staff name.
- `GET /api/v1/clients-speed/{uuid}` repeated every 15 seconds.

## Git

Branch `improve`. This work is uncommitted. No unrelated frontend changes were in the tree.
