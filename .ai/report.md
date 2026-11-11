## Summary

The wallet transactions table now calls `wallets/{id}/wallet-transactions`, which is the `wallets.transactions` route.

## Frontend

- `TransactionsTable` no longer requests `wallets/{id}/transactions`. That URL belongs to `wallet-transactions.by-wallet`.

## Checks

- Backend test `lists transactions for a specific wallet` passed, including the `wallets.transactions` response.
- The signed-in wallet screen was not opened in the browser.
