## Summary

The client billing-type filter now sends `billing_type` and the filter bar wraps onto two rows so the new dropdown can be used.

## Cause

The dropdown name was `billing_type ` with a trailing space, so the request key never matched the API filter. With five fields in one fixed-height row, that dropdown also sat under the table and could not be clicked.

## Frontend

- Field name is `billing_type`. Options stay Auto, Manual, and No invoice this month.
- Client and reseller-client tables use `filter_row: 2`.

## Browser

On `http://vp.isp.test/clients`, signed in as vp:

- No invoice this month returned only vp0007.
- Manual returned vp0006, vp0003, vp0002, and vp0001.
- Reset restored the full list, including the client named no-invoice. That record is not stored as `no_invoice_this_month`.

## Checks

- `npx vitest run tests/unit/clients/client-filter-schema.test.ts` passed.

## Unrelated

Left untouched: settings auto-inactive time files, language files, `types/app.ts`, and the pre-existing reseller filter schema test (it expects a reseller label the schema does not have).
