## Summary

The notification bell badge and the dropdown list now stay fresh through React Query. Both the unread count and the recent list refetch when the browser window is focused again, and they poll every 5 minutes while the tab is visible. Polling stops while the tab is hidden.

The list component still only renders rows. The bell loads that data with `useRecentNotifications`, which is active for the whole session so the menu is already current when it opens.

The history page at `/notifications` is unchanged. It still loads when you open that page.

## Files

- `hooks/use-notifications.ts`
- `components/notifications/notification-bell.tsx`
- `tests/unit/notifications/use-notifications.test.tsx`

## Checks

`npx vitest run tests/unit/notifications/use-notifications.test.tsx tests/unit/notifications/notification-bell.test.tsx tests/unit/notifications/notification-table.test.tsx`: 9 passed.

The unread-count and recent queries both pass `refetchOnWindowFocus: true`, `refetchIntervalInBackground: false`, and a 5-minute interval that returns `false` while `document.visibilityState` is `hidden`.

Opened `http://127.0.0.1:3000/dashboard` while already signed in. The bell is in the header. The dev bundle for that page includes `NOTIFICATION_REFRESH_MS = 5 * 60 * 1000` and the recent query is no longer limited to the open menu. Automated clicks landed on the bell button, but the dropdown stayed closed, so the open menu was not rechecked in the browser. The 5-minute poll was not waited out.

## Security

No permission or tenant change. The same two notification endpoints are called. The client still does not send `company_id` or `reseller_id`.

## Git

Uncommitted on `master`. This session changed `hooks/use-notifications.ts`, `components/notifications/notification-bell.tsx`, and added `tests/unit/notifications/use-notifications.test.tsx`.

Left untouched from earlier work:

- `components/notifications/notification-list.tsx` (loading skeletons)
- `components/notifications/notification-bell.tsx` `size="default"` (already in the file; this session only changed the recent-query call)
- `components/notifications/notification-catalog.ts`, `notification-column.tsx`
- `public/lang/en.json`, `public/lang/bn.json`
- `tests/unit/notifications/notification-bell.test.tsx`, `notification-catalog.test.ts`
