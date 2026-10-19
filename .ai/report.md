## Summary

Communication now has a Telegram Zone page at `/communication/telegram-zone`. Staff can list, filter, create, edit, activate, deactivate, and delete zone notification destinations. Zones use the existing multi-select dropdown.

## Files

- `app/(dashboard)/communication/telegram-zone/page.tsx`
- `components/telegram-zones/telegram-zone-type.ts`
- `components/telegram-zones/telegram-zone-form-schema.ts`
- `components/telegram-zones/telegram-zone-form.tsx`
- `components/telegram-zones/telegram-zone-column.tsx`
- `components/telegram-zones/telegram-zone-table.tsx`
- `components/telegram-zones/telegram-zone-filter-schema.ts`
- `hooks/use-menu-items.ts`
- `public/lang/en.json`, `public/lang/bn.json`

The menu item sits under Communication and uses `telegram-zones.access`. Create, edit, and delete follow `telegram-zones.create`, `telegram-zones.edit`, and `telegram-zones.delete`.

## Checks

`scripts/ai/typecheck` passed. `scripts/ai/test` ran 267 tests. Two existing failures remain and are outside this change: `tests/unit/clients/reseller-client-filter-schema.test.ts` and `tests/unit/clients/client-billing-payment-cell.test.tsx`.

The page was not exercised in a browser. No dev server is running, and the screen needs a signed-in session plus the new API migration.
