## Summary

The product list shows the new sequence id, and General settings includes a Product ID Prefix that defaults to `PRO`.

## Files

- `components/products/product-column.tsx` — Product ID column
- `components/products/product-type.ts` — `product_code`
- `components/settings/settings-form-schema.ts`
- `components/settings/settings-type.ts`
- `public/lang/en.json`, `public/lang/bn.json`
- `tests/unit/settings/expense-id-prefix.test.ts`

## Checks

`npx vitest run tests/unit/settings/expense-id-prefix.test.ts` passed (5 tests).

Signed in at `http://vp.isp.test:3000/admin` as vp. General settings shows Product ID Prefix `PRO` beside Invoice `INV`, Payment `PAY`, and Expense `EXP`. Edit opened with `PRO`; saving left `PRO` in place.

`/products` shows a Product ID column between SL and Product Name. The table body is “No results” for this account, so no `PRO1` row was on screen. The live database migration has not been applied, so stored product codes will appear after that migration runs.

## Security

The prefix is company settings meta. No tenant or permission change.

## Git

Uncommitted on `master`.
