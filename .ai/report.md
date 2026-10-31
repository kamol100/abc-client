## Summary

The Send SMS phone field stays in one slot. With no template, or any template other than Custom Other, that slot shows a hint. Custom Other fades in the phone input in the same space, so the rest of the form does not jump.

## Frontend

- `components/sms-sent/sms-sent-form.tsx` — hint and phone field share one grid cell and crossfade with opacity. Visibility uses the existing `isCustomOtherSmsTemplate(templateType)` result. Send, validation, and client-list behavior are unchanged.
- `public/lang/en.json`, `public/lang/bn.json` — `sms_sent.phone_number.hint`
- `tests/unit/sms-sent/sms-sent-form-confirm.test.tsx`

## Checks

`npx vitest run tests/unit/sms-sent/sms-sent-form-confirm.test.tsx` passed (3 tests). `scripts/ai/typecheck` passed.

On `http://vp.isp.test:3000/sms-send`, no template shows the hint, Custom Other shows the phone field (entered `01700000000`, send enabled), and Invoice Due shows the hint again with the client list. The slot stayed at the same position and height (76px) across the switch. Light and dark both use theme tokens. Theme was returned to light.

## Unrelated working tree

Already uncommitted and left as they were: SMS type split (`custom_client` / `custom_other`) in template options, queue and log filters, `sms-sent-type.ts`, and the message box at 8 rows in `sms-sent-form-schema.ts`.
