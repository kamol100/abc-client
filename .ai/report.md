## Summary

The admin navbar has a notification bell. It polls the unread count every 60 seconds, pauses while the tab is hidden, and opens the latest 10. `/notifications` is a filterable history table. Settings → Notifications toggles each category and event through the existing company settings save. Copy is translated from the stored event id in English and Bangla. The client portal navbar does not show the bell.

## Files

- `components/notifications/notification-catalog.ts`, `notification-bell.tsx`, `notification-list.tsx`, `notification-table.tsx`, `notification-column.tsx`, `notification-filter-schema.ts`
- `hooks/use-notifications.ts`
- `components/settings/notification-settings.tsx`
- `app/(dashboard)/notifications/page.tsx`, `app/(dashboard)/settings/notifications/page.tsx`
- `app/(dashboard)/top-navbar.tsx`, `dashboard-breadcrumb.tsx`, `hooks/use-menu-items.ts`
- `lib/helper/helper.ts` (`formatRelativeTime`)
- `app/actions.ts` and `hooks/use-api-mutation.ts` accept `PATCH`
- `public/lang/en.json`, `public/lang/bn.json`
- `tests/unit/notifications/`

## Checks

`scripts/ai/typecheck`: passed.

`npx vitest run tests/unit/notifications`: 11 passed. Covers the bell badge `99+`, dropdown empty, loading, and error states, mark read and mark all, history list params, settings payload, subject links, relative time in English and Bangla, and a translation key for every event.

`scripts/ai/test` (full unit suite): 443 passed, 4 failed, plus 2 suites that did not run. The failures are in files this change does not modify:

- `tests/unit/client-area/client-account-page.test.tsx` (NID text not rendered)
- `tests/unit/clients/reseller-client-filter-schema.test.ts` (reseller dropdown label)
- `tests/unit/pay/pay-content.test.tsx` (`usePathname` missing from a local `next/navigation` mock)
- `tests/unit/clients/reseller-client-table.test.tsx` (next-auth cannot resolve `next/server`)
- `tests/unit/maps/client-map-rows.test.ts` (no test suite in the file)

ESLint was not run. `npm run lint` does not succeed on this repo.

## Security

The UI only hides the settings item behind `company-settings.access`. The API decides who receives a row and who can read it. This frontend does not send `company_id` or `reseller_id`. Tenant isolation is not verified from this repo.

`invalidateNotifications()` is the hook a future Echo listener should call. The browser still must not read the Sanctum token. That token remains exposed through the NextAuth session and `localStorage` (pre-existing).

## Git

Uncommitted on `master`. The working tree changes are the notification UI. No unrelated dirty files.
