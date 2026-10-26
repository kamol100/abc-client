## Summary

bKash always sent the browser back to `/pay` because the callback URL only kept the client id. The return page is now an allowlisted key (`pay`, `client-dashboard`, `client-invoices`) on the callback query, with the same key stored in `sessionStorage` before leaving for bKash. After the execute call succeeds, the callback replaces the location with that page and `?payment=success`. Cancelled, failed, and unverified payments stay on the callback and do not show the success banner.

## Files

- `components/bkash-payment/use-bkash-payment.ts`
- `components/bkash-payment/bkash-payment-result-notice.tsx`
- `components/pay/pay-invoice.tsx`
- `components/pay/pay-content.tsx`
- `app/(public)/pay/bkash-callback/page.tsx`
- `app/(client-dashboard)/client/dashboard/client-dashboard-content.tsx`
- `components/client-area/invoices/client-invoices-table.tsx`
- `public/lang/en.json`
- `public/lang/bn.json`
- `tests/unit/bkash-payment/`
- `tests/unit/pay/pay-content.test.tsx`

## Checks

`npx vitest run tests/unit/bkash-payment tests/unit/pay/pay-content.test.tsx` passed (19 tests). `scripts/ai/typecheck` passed.

Signed in on `http://vp.isp.test` and checked the pages in the browser. `/pay?payment=success` shows the success message once. `/client/dashboard?payment=success` and `/client/invoices?payment=success` show it once. Opening the dashboard from the invoices success URL clears the message. A cancelled callback with `return=client-invoices` shows Payment Cancelled and Back to invoices, then lands on `/client/invoices` with no success message. An unverified `status=success` callback stays on the callback with Payment Failed.

A live bKash charge was not started. The signed-in account can open the client portal, but invoice and profile data return “Failed to load data”, so the pay button on that dashboard was not exercised. Refreshing a URL that still has `?payment=success` shows the banner again.

## Git

Uncommitted. Left existing client-invoice payment dialog work untouched: `ClientDashboardPaymentCard.tsx`, `use-client-dashboard-data.ts`, `client-invoice-row-actions.tsx`, `client-invoice-payment-dialog.tsx`, `use-client-invoice-payment.ts`, and `tests/unit/client-area/client-invoice-row-actions.test.tsx`.
