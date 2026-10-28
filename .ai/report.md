## Summary

**Send SMS** now opens a confirmation dialog instead of sending. The dialog loads a quote from the new `POST /sms-store/preview` endpoint. It shows recipients, total SMS (segments), total cost, wallet balance, and remaining balance. Insufficient live balance shows a warning and disables **Confirm & Send SMS**. Test mode uses the `warning` theme tokens with a TEST MODE label, shows the cost as not charged, and is never blocked by balance. For invoice due and reminder templates sent before the configured schedule, the dialog shows the scheduled time (formatted in the API's timezone, not the browser's) and an unchecked **Send immediately** checkbox. The choice is sent as `send_now`.

## Files

- `components/sms-sent/sms-send-confirm-dialog.tsx` (new): `MyDialog` with quote summary, insufficient alert, schedule notice
- `components/sms-sent/sms-sent-form.tsx`: submit opens the dialog. Confirm calls the existing `sms-store` mutation once, closes after the result, and resets the form only on success
- `components/sms-sent/sms-sent-type.ts`: `SmsSendQuoteSchema`, `canConfirmSmsSend()`, `send_now` on the payload
- `public/lang/en.json`, `public/lang/bn.json`: `sms_sent.confirm.*`
- `tests/unit/sms-sent/sms-send-confirm-dialog.test.tsx`, `sms-sent-form-confirm.test.tsx` (new), `sms-sent-type.test.ts`

## Checks

- `scripts/ai/typecheck`: passed.
- `scripts/ai/test`: 408 passed, 3 failed in 4 files unrelated to SMS: `clients/reseller-client-table` (cannot resolve `next/server`), `maps/client-map-rows` (no suite), `clients/reseller-client-filter-schema`, `pay/pay-content` (`usePathname` missing from mock). All 14 sms-sent tests pass. They cover sufficient and insufficient balance, live and test mode, schedule shown and hidden, send-now override, no recipients, disabled confirm while submitting, and send-once at the form level.
- Not checked in a browser. The local app requires a login.

## Git

Uncommitted. No unrelated changes in the tree. Backend counterpart is in `isp-backend` (see its `.ai/report.md`).
