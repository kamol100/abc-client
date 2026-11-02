## Summary

The add fund transaction form no longer asks for a transaction type. Every submit sends `transaction_type: "transfer"`, and Transfer To is required.

## Frontend

- `fund-transaction-form-schema.ts` fields are destination fund, amount, and note.
- `fund-transaction-form.tsx` always sets `transaction_type` to `"transfer"` on submit.
- `FundTransactionFormSchema` accepts only `"transfer"` and requires `transfer_by`.
- The transaction list and filter still show deposit, withdraw, expense, and salary rows that already exist.

## Checks

- `npx vitest run tests/unit/fund-transactions/fund-transaction-form.test.ts` passed (9 tests).

## Browser

Signed in at `http://vp.isp.test` as vp. Opened Add on Fund Transactions. The dialog shows Fund, Transfer To, Amount, and Note. Saving empty shows fund required, transfer fund required, and amount must be greater than 0. No transaction was created.

## Security

No tenant or permission change. The form still does not send `company_id`.
