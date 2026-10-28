## Summary

Choosing an **Invoice due** or **Invoice due reminder** template limits the Send SMS client table to clients who have an invoice with status `due`. Other templates still list every client with a phone. The list note explains the narrower set, and changing the template clears the previous selection.

## Cause

The table loaded `GET /sms-clients` with only the search, network, zone, and status filters. The send for those two template types already queues only due invoices, so the table included clients who would not receive the SMS.

## Files

- `components/sms-sent/sms-sent-form.tsx`
- `components/sms-sent/sms-sent-type.ts`
- `public/lang/en.json`, `public/lang/bn.json`
- `tests/unit/sms-sent/sms-sent-type.test.ts`

## Checks

- `scripts/ai/typecheck`: passed.
- `vitest run tests/unit/sms-sent/sms-sent-type.test.ts`: 5 passed.
- Browser: not rechecked. The client table appears only after the template details load, and the last signed-in check left the template dropdown on its loading indicator.

## Git

Uncommitted. Earlier uncommitted Send SMS due-amount work is still in `sms-sent-column.tsx`, `sms-sent-type.ts`, and `tests/unit/sms-sent/sms-sent-column.test.tsx`. Backend filter coverage is in `isp-backend`.
