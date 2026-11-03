## Summary

Reports has a New client page at `/reports/new-clients`, directly after Product Out and before BTRC. Two cards download PDFs. The date range defaults to the first day of the current month through today.

## Frontend

- Menu permission is `reports.access`, same as BTRC.
- Client card defaults to All Clients with Resellers. Zone and status show only for Own Clients. Reseller card defaults to All Resellers. All values are omitted from the query. `date_from` and `date_to` are always sent as `Y-m-d` via date-fns.
- Both cards open the PDF in a new tab. The proxy sends `Content-Disposition: inline`.
- Breadcrumb label uses `menu.reports.new_client.title`.

## Checks

- `scripts/ai/typecheck` passed.
- `npx vitest run tests/unit/reports/new-client-report.test.tsx tests/unit/menu/menu-items.test.ts` passed (15 tests).

## Browser

Signed-in session at `http://vp.isp.test/reports/new-clients` (user `vp`).

- Desktop: two cards, date range `11/01/2026 - 11/03/2026`, Client Report default All Clients with Resellers, Reseller Report default All Resellers.
- Own Clients reveals Client Status (All Clients) and Zone (All Zones).
- Sidebar order is Product Out, New client, BTRC. Breadcrumb is Dashboard / New client.
- Mobile width shows the same two cards stacked, with the reports icon in the bottom bar.
- Download called `/api/reports/new-clients/clients?date_from=2026-11-01&date_to=2026-11-03&scope=with_resellers` and the API returned 403 `Insufficient permission!`. The role does not have `reports.new-clients.report` or `reports.new-client-resellers.report` yet. Those names are in the seeder and `UpdatePermission` only. `update:permission` was not run, because that command also deletes permission rows missing from its list.

## Unrelated working tree

Left in place: untracked `tests/unit/settings/payment-deadline.test.ts`.
