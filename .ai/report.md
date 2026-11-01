## Summary

Telegram zones are optional. A channel can be saved with no zones, and an existing channel can be cleared by sending an empty `zone_ids` list.

## Frontend

- `telegram-form-schema.ts` no longer marks Zones as mandatory.
- `TelegramFormSchema` accepts a missing or empty `zone_ids` and submits `[]`.

## Checks

- `scripts/ai/typecheck` passed.

## Browser

Signed in at `http://vp.isp.test/telegram` as `vp`. Add Telegram shows Zones without a required mark. Name, Telegram channel ID, and Status still show one. The dialog was closed without saving.

## Unrelated working tree

Earlier telegram settings and notification-event edits on `telegram-settings` remain. A full `vitest run` also failed in maps, reseller client filters, client account, and pay tests that this change does not touch.
