## Summary

The dashboard top bar now shows the signed-in user's wallet balance in a theme-tinted button, placed before the language switcher. It uses the existing `my-wallet` balance and opens My Wallets. Users without the `wallets.my` permission do not see it.

## Files

- `components/wallets/my-wallet.tsx` — `WalletBalanceButton`
- `app/(dashboard)/top-navbar.tsx` — button before `LanguageSwitcher`

## Checks

`scripts/ai/typecheck` passed. The local app is running, but login with the e2e test account was rejected, so the navbar was not checked in a signed-in session.

## Left untouched

bKash icon work already in the working tree: `components/bkash-payment/bkash-icon.tsx`, `components/pay/pay-invoice.tsx`, `components/subscription/subscription-pay-dialog.tsx`, `components/wallets/reseller-recharge.tsx`, `components/wallets/wallet-transaction.tsx`, and `public/images/logos/bkash.svg`.
