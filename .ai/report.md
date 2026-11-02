## Summary

A fund transfer now asks for the sender first and the receiver second. The sender is debited and the receiver is credited.

## Frontend

- Fund Send By is the `transfer_by` dropdown. Its balance is shown under the field and updates when the selection changes.
- Fund Received By is the fund the request is posted to. Admins choose it. Other roles stay locked to the fund on their profile.
- Choosing the same fund for both sides clears the sender. Empty save asks for a sender, a receiver, and an amount greater than 0.
- Deposit, withdraw, expense, and salary rows already in the list are unchanged.

## Checks

- `npx vitest run tests/unit/fund-transactions/fund-transaction-form.test.ts` passed (9 tests).
- `scripts/ai/typecheck` passed.

## Browser

Signed in at `http://vp.isp.test` as vp. Add Fund Transaction shows Fund Send By, Fund Received By, Amount, and Note. Saving empty shows sender required, receiver required, and amount must be greater than 0. Selecting cash shows Current Balance: ৳0 under Fund Send By. No transfer was saved.

## Security

The form still does not send `company_id`. The receiver id is only the fund uuid in the URL. The sender id is `transfer_by`.
