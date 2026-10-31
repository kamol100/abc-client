## Summary

The Telegram Zone screen is now Telegram at `/telegram`. The communication menu item, breadcrumb, English copy, and Bengali copy use that name. Create, edit, zone linking, channel id, status, and delete still call the same kind of API, now at `/telegram` with permissions `telegram.*`.

`/settings/telegram` is the company bot settings page and was not changed.

## Frontend

- Page: `app/(dashboard)/telegram/page.tsx`
- Components: `components/telegram/`
- Menu: Communication → Telegram, permission `telegram.access`
- Removed: `/communication/telegram-zone`

## Checks

- `scripts/ai/typecheck` passed
- `npx vitest run tests/unit/menu/menu-items.test.ts tests/unit/menu/menu-path-active.test.ts` passed (12 tests)
- `npm run build` passed. The route list includes `/telegram` and does not include `/communication/telegram-zone`. `/settings/telegram` is still present.
- English and Bengali translation keys still match.

## Browser

An unauthenticated visit to `http://127.0.0.1:3456/telegram` redirects to `/admin?callbackUrl=%2Ftelegram`. Logged-in create, edit, and delete were not exercised; there is no staff session in this browser.

## Unrelated working tree

None.
