## Summary

Invoice rows that include a client now link the client name to the client details page.

## Frontend

- `components/invoices/invoice-column.tsx` renders the client name as a link to `/clients/view/{uuid}` when the invoice has a client uuid and the user has `clients.show`.
- The link follows the existing `client_view_open_on_new_tab` setting. Without the client, or without permission, the cell stays plain text.
- Imports in that file use the `@/` alias.

## Checks

- `scripts/ai/typecheck` passed.
- `npx vitest run tests/unit/invoices/invoice-column.test.tsx` passed (4 tests).

## Browser

Signed in at `http://vp.isp.test` as `vp`. On Invoices, client names are links. Opening Karim Hossain went to `/clients/view/a2f269c6-2191-46c1-9e83-50d986bbeb73` and the page title was Client Details with that client loaded.

## Security

The link uses the client uuid already returned on the invoice. `clients.show` only shows the link. The client show route remains the authorization check. No `company_id` is sent.

## Unrelated working tree

Left untouched: fund transaction form and table, fund column, client view pay button order, `public/lang/en.json`, `public/lang/bn.json`, `types/app.ts`, and `tests/unit/fund-transactions/`.
