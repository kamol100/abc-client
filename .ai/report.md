## Summary

The client dashboard now has an invoice payment card. When the logged-in client has a due invoice, the due amount is shown at the top of the card. The bKash button at the bottom opens the same invoice review used on the public pay page, and Pay with bKash starts the existing bKash checkout.

## Files

- `app/(client-dashboard)/client/dashboard/client-dashboard-content.tsx`
- `components/client-area/dashboard/ClientDashboardPaymentCard.tsx`
- `components/client-area/dashboard/use-client-dashboard-data.ts`
- `components/client-area/dashboard/client-dashboard-type.ts`
- `components/pay/pay-invoice.tsx`
- `public/lang/en.json`
- `public/lang/bn.json`
- `tests/unit/client-area/client-dashboard-payment-card.test.tsx`

## Checks

`npx vitest run tests/unit/client-area/client-dashboard-payment-card.test.tsx` passed (3 tests). `scripts/ai/typecheck` passed.

`http://localhost:3000/client/dashboard` redirected to the client login, so the card and bKash redirect were not clicked in the browser. The unit test covers the due amount, the disabled empty state, and opening the payment dialog.

## Git

Uncommitted.
