## Summary

`/settings/dashboard` lets a user show or hide dashboard items with the existing company settings switches. A missing setting stays visible. A switch is shown only when the user has that item's dashboard card permission.

## Files changed

- `app/(dashboard)/settings/dashboard/page.tsx`
- `components/dashboard/dashboard-visibility.ts`
- `components/dashboard/dashboard-overview.tsx`
- `components/dashboard/use-dashboard-data.ts`
- `components/settings/settings-form.tsx`
- `components/settings/settings-form-schema.ts`
- `components/settings/settings-type.ts`
- `hooks/use-menu-items.ts`
- `public/lang/en.json`
- `public/lang/bn.json`
- `tests/unit/dashboard/dashboard-visibility.test.ts`

## Behavior

The page uses `SettingsForm` and `POST /company/settings`, the same path as General, SMS, Map, and Telegram. The menu entry is under Settings and requires `company-settings.access`.

Each card switch is tied to its `dashboard-card.*` permission. Top Due Invoices and Zone-wise Top Due have no card permission, so those two switches are always listed. Turning a switch off saves `0` and hides that item. `null`, missing, `1`, and `true` keep it visible. Permission is still required before the setting is applied.

A new dashboard item is one entry in `DASHBOARD_VISIBILITY_ITEMS`, plus the matching settings key, schema field, and translation labels.

## Tests

`npx vitest run tests/unit/dashboard/dashboard-visibility.test.ts` passed (6 tests).

`scripts/ai/test` passed (20 files, 79 tests).

`scripts/ai/typecheck` passed.

The signed-in settings page was not exercised. `http://127.0.0.1:3000/settings/dashboard` redirects to `/admin?callbackUrl=/settings/dashboard`, and the login form stayed on its pre-hydration skeleton, so the switches were not clicked.

## Left untouched

`dashboard.metrics.client` in `en.json` was already `Clients` in the working tree and was left as-is. The older `/setting/dashboard` page was not changed.
