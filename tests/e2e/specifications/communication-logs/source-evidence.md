# Source evidence — communication-logs

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/communication-logs/page.tsx`
- `components/communication-logs/communication-log-column.tsx`
- `components/communication-logs/communication-log-filter-schema.ts`
- `components/communication-logs/communication-log-table.tsx`
- `components/communication-logs/communication-log-type.ts`

## Observed permission checks

- `communication-logs.delete`

## Observed API templates (not validated endpoints)

- `communication-logs`

## Observed form/config field names

- `channel`
- `sms_from`
- `sms_to`
- `sms_type`
- `status`

## Matching backend route declarations

- GET `/communication-logs` → `communication-logs.access`; `CommunicationLogController::index`; `../isp-backend/routes/api.php:386`
- GET `/communication-logs/{communicationLog}` → `communication-logs.show`; `CommunicationLogController::show`; `../isp-backend/routes/api.php:387`
- DELETE `/communication-logs/{communicationLog}` → `communication-logs.delete`; `CommunicationLogController::destroy`; `../isp-backend/routes/api.php:388`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/CommunicationLogController.php`
- `../isp-backend/app/Http/Resources/CommunicationLogCollection.php`
- `../isp-backend/app/Http/Resources/CommunicationLogResource.php`
