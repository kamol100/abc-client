## Summary

The subscription invoice pay button opens a dialog. One unpaid invoice is shown selected. Several unpaid invoices are listed with checkboxes, and the total follows the selection. The user pays that total from the company wallet or with bKash.

## Files

- `components/subscription/subscription-pay-dialog.tsx`
- `components/subscription/my-subscription.tsx`
- `public/lang/en.json`
- `public/lang/bn.json`

## Behavior

- Payable invoices and the owner wallet come from `GET my-subscription/invoices/payable`.
- Wallet pay posts the selected invoice ids to `my-subscription/invoices/pay/wallet`. If the available balance is below the total, the dialog shows the balance and the required amount and the pay button stays disabled.
- bKash posts the same ids to `my-subscription/invoices/pay/bkash` and redirects to `bkashURL`. The return to `/subscription` runs `my-subscription/invoices/pay/bkash/execute` once. Success, failure, cancel, and pending each show a notice, then the subscription and invoice queries refresh.
- Copy is in `subscription.payment` in both language files.

## Checks

`scripts/ai/typecheck` passed.

## Browser

`http://127.0.0.1:3000/subscription` redirects to `/admin?callbackUrl=%2Fsubscription`. There is no signed-in session, so the dialog was not opened in the browser.

## Left untouched

No unrelated working-tree changes.
