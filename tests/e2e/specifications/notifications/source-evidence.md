# Source evidence — notifications

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/notifications/page.tsx`
- `components/notifications/notification-bell.tsx`
- `components/notifications/notification-catalog.ts`
- `components/notifications/notification-column.tsx`
- `components/notifications/notification-filter-schema.ts`
- `components/notifications/notification-list.tsx`
- `components/notifications/notification-table.tsx`

## Observed permission checks

- `notifications.access`

## Observed API templates (not validated endpoints)

- `notifications`

## Observed form/config field names

- `category`
- `status`

## Matching backend route declarations

- GET `/notifications` → `notifications.index`; `NotificationController::index`; `../isp-backend/routes/api.php:672`
- GET `/notifications/recent` → `notifications.recent`; `NotificationController::recent`; `../isp-backend/routes/api.php:673`
- GET `/notifications/unread-count` → `notifications.unread-count`; `NotificationController::unreadCount`; `../isp-backend/routes/api.php:674`
- PATCH `/notifications/read-all` → `notifications.read-all`; `NotificationController::markAllRead`; `../isp-backend/routes/api.php:675`
- PATCH `/notifications/{notification}/read` → `notifications.read`; `NotificationController::markRead`; `../isp-backend/routes/api.php:676`
- PATCH `/notifications/{notification}/unread` → `notifications.unread`; `NotificationController::markUnread`; `../isp-backend/routes/api.php:677`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/NotificationController.php`
- `../isp-backend/app/Http/Requests/ListNotificationsRequest.php`
- `../isp-backend/app/Http/Resources/NotificationCollection.php`
- `../isp-backend/app/Http/Resources/NotificationResource.php`
