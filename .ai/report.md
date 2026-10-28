## Summary

Send SMS has a Live / Test choice above the form. Live is selected by default and is what gets submitted unless the user picks Test. Test mode tells the API `mode: "test"`, shows that no SMS will be sent and no charge applies, and uses a different success message. Simulated rows in Communication Logs show a Test badge instead of Sent.

## Files

- `components/sms-sent/sms-sent-form.tsx` — mode cards, notice, button, and toast
- `components/sms-sent/sms-sent-type.ts` — `mode` on the payload, default `live`
- `components/communication-logs/communication-log-column.tsx` — Test badge
- `components/communication-logs/communication-log-filter-schema.ts` — simulated status filter
- `public/lang/en.json`
- `public/lang/bn.json`
- `tests/unit/sms-sent/sms-sent-type.test.ts`
- `tests/unit/sms-sent/sms-send-mode-selector.test.tsx`

## Checks

`scripts/ai/typecheck` passed.

`npx vitest run tests/unit/sms-sent` passed (4 tests). The full `scripts/ai/test` run finished with 398 passed and 4 failed in unrelated files: `reseller-client-table`, `reseller-client-filter-schema`, `client-map-rows`, and `pay-content`.

## Git

Uncommitted. Earlier Send SMS filter and table edits in `components/sms-sent/` were already in the tree and were left in place.
