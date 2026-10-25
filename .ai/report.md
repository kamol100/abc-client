## Summary

Client invoice history was empty because the page sent the client UUID as `client_id`. That filter matches the integer client key, so the query returned no rows. The page now sends `client_uuid`, which is the filter the invoice API uses for a public client id. The status badge also uses the app translator, so labels such as Due render.

## Files

- `components/invoices/client-invoice-params.ts`
- `components/invoices/client-invoice-table.tsx`
- `components/invoices/client-invoice-columns.tsx`
- `tests/unit/invoices/client-invoice-params.test.ts`

## Checks

`npx vitest run tests/unit/invoices/client-invoice-params.test.ts` passed (2 tests). `scripts/ai/typecheck` passed.

`scripts/ai/test` still fails on two existing client tests (`reseller-client-filter-schema.test.ts` and `reseller-client-table.test.tsx`). Those files were not part of this change.

On `http://vp.isp.test/invoices/client/a2f269c6-56ec-4f92-a92c-1570d8372019`, the table shows INV5 for 10-Oct-26, amount ৳1,400, status Due, and the title count is 1. The same invoice is the only row on that client's detail page.

## Git

Uncommitted. No other working-tree changes.
