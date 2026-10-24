## Summary

General settings now includes Expense ID Prefix next to Payment ID Prefix. An empty value displays and saves as `EXP`. The expenses table shows the generated id in the first column. Older rows without an id show an em dash.

## Files

- `components/settings/settings-form-schema.ts`
- `components/settings/settings-type.ts`
- `components/expenses/expense-column.tsx`
- `components/expenses/expense-type.ts`
- `public/lang/en.json`
- `public/lang/bn.json`
- `tests/unit/settings/expense-id-prefix.test.ts`

## Checks

`scripts/ai/typecheck` passed.

`npx vitest run tests/unit/settings/expense-id-prefix.test.ts`: 3 tests passed.

`scripts/ai/test` still fails in two existing files that this change does not touch: `tests/unit/clients/reseller-client-filter-schema.test.ts` and `tests/unit/clients/reseller-client-table.test.tsx`.

Signed in on `http://vp.isp.test/settings/general`, the general form lists Invoice Prefix, Payment ID Prefix, and Expense ID Prefix. The edit action on that field was not completed, and the prefix was not saved against the live company.

## Git

This work is uncommitted.

Unrelated working-tree changes were left as they were: `components/payments/payment-column.tsx` and `components/payments/payment-type.ts`.
