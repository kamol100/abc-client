## Summary

Unread rows in the notification dropdown now use a stronger gray (`bg-foreground/10`) so they stand apart from read rows, which stay on the menu background.

## Files

- `components/notifications/notification-list.tsx`

## Checks

Opened `http://vp.isp.test:3000/dashboard` while signed in as vp. The bell menu showed one unread row (“Ticket status changed”) with computed background `rgba(9, 9, 11, 0.1)` and three read rows with a transparent background. The unread row is a visible gray band; the read rows are white.

Dark mode was not left on. A temporary `dark` class made the unread wash `rgba(250, 250, 250, 0.1)`; the page class was restored to `light`.

## Security

No permission or tenant change. No API calls were added.

## Git

Uncommitted on `master`. The only source change is `components/notifications/notification-list.tsx`.
