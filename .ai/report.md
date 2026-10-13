## Summary

The My Subscription page lists the company's subscription invoices under the plan card. Columns are ID, date, type, note, amount, status, and a pay action. The pay button does not start a payment yet.

## Files changed

- `components/subscription/my-subscription.tsx`: the invoice table and its columns live in this file, under the plan card. Unpaid rows show a pay button with no handler. Paid rows show a dash.
- `public/lang/en.json` and `public/lang/bn.json`: `subscription.invoices` labels.

## Behavior

The table uses the invoice list envelope (`data.data` and `data.data.pagination`). Status labels reuse the invoice status keys. The pay control is present for due and partial invoices and does not call the pay API.

## Tests

`scripts/ai/typecheck` passed.

The subscription page redirected to `/admin` because there is no signed-in session. The table was not exercised in the browser.

## Left untouched

`public/lang/en.json` and `public/lang/bn.json` already contained an uncommitted `common.no_data` key. That key was left as it was.
