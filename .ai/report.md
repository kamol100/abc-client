## Summary

The Telegram create and edit dialog now shows a Notifications section under the existing fields. Events are grouped (client, fund transaction, invoice, expense, ticket, network, package, vendor) with checkboxes. Choices stay in the dialog only and are not saved or sent to the API.

## Frontend

- `components/telegram/telegram-form.tsx` renders the section after name, channel, zones, and status. Dialog width is `3xl`.
- `components/telegram/telegram-form-schema.ts` lists the same keys as `SETTINGS_SWITCH_KEYS` lines 56–80.
- Copy added in `public/lang/en.json` and `public/lang/bn.json` under `telegram.notifications`.

## Checks

- `scripts/ai/typecheck` passed.
- English and Bengali `telegram` keys match.

## Browser

Signed in at `http://vp.isp.test/admin` as `vp`. Opened Communication → Telegram → Add.

- Existing fields stay on top. Notifications sit below them.
- All 25 event checkboxes are present. Client → Create toggles on.
- Narrow viewport stacks each group in one column. Cancel and Save stay usable.
- Dialog was closed without saving.

## Unrelated working tree

None.
