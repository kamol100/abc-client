## Summary

Invoice view amounts, quantities, and the client ID now follow the active language. Bangla uses Bengali digits (`২,২৬০৳`, client ID `১৩৪`). Identifiers keep their characters and do not gain grouping commas. English stays `2,260৳` and `134`.

## Cause

`formatInvoiceAmount` always formatted with the English locale, so a Bangla invoice still showed Latin digits.

## Files

- `components/invoices/invoice-view-model.ts`
- `components/invoices/invoice-view-document.tsx`
- `tests/unit/invoices/invoice-view-model.test.ts`
- `tests/unit/invoices/invoice-view-document.test.tsx`

## Checks

`npx vitest run tests/unit/invoices/invoice-view-model.test.ts tests/unit/invoices/invoice-view-document.test.tsx`: 7 passed.

`scripts/ai/typecheck`: passed.

Browser on `http://isp.test/invoices`: switched to Bangla, opened invoice INVW8, and confirmed the bill, unit price, line total, quantity, and summary all use Bengali digits (`৫০০৳`, quantity `১`). Switched the language back to English.

## Git

Uncommitted. Left untouched: `components/client-area/client-account-page.tsx`. `invoice-view-document.tsx` already had unrelated layout edits (customer fields, removed invoice type and total quantity).

## Security

Formatting only. No tenant or auth change.
