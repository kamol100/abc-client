# Source evidence — activity-logs

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/activity-logs/page.tsx`
- `components/activity-logs/activity-log-actions-cell.tsx`
- `components/activity-logs/activity-log-changes-dialog.tsx`
- `components/activity-logs/activity-log-column.tsx`
- `components/activity-logs/activity-log-filter-schema.ts`
- `components/activity-logs/activity-log-table.tsx`
- `components/activity-logs/activity-log-type.ts`

## Observed permission checks

- `activity-logs.delete`

## Observed API templates (not validated endpoints)

- `activity-logs`

## Observed form/config field names

- `description`
- `log_name`

## Matching backend route declarations

- GET `/activity-logs` → `activity-logs.access`; `ActivityLogsController::index`; `../isp-backend/routes/api.php:500`
- DELETE `/activity-logs/{id}` → `activity-logs.delete`; `ActivityLogsController::destroy`; `../isp-backend/routes/api.php:501`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/ActivityLogsController.php`
- `../isp-backend/app/Http/Resources/ActivityLogsCollection.php`
