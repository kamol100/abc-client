# Source evidence — communication-queue

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/communication-queue/page.tsx`
- `components/communication-queue/communication-queue-column.tsx`
- `components/communication-queue/communication-queue-delete-button.tsx`
- `components/communication-queue/communication-queue-delete-reason-dialog.tsx`
- `components/communication-queue/communication-queue-filter-schema.ts`
- `components/communication-queue/communication-queue-bulk-dialog.tsx`
- `components/communication-queue/communication-queue-resend-button.tsx`
- `components/communication-queue/communication-queue-stop-button.tsx`
- `components/communication-queue/communication-queue-table.tsx`
- `components/communication-queue/communication-queue-type.ts`

## Observed permission checks

- `communication-queue.resend`
- `communication-queue.resend-all`
- `communication-queue.stop`
- `communication-queue.stop-all`
- `communication-queue.delete`
- `communication-queue.delete-all`

## Observed API templates (not validated endpoints)

- `/communication-queue/${smsId}/resend`
- `/communication-queue/resend-all`
- `/communication-queue/${smsId}/stop`
- `/communication-queue/stop-all`
- `/communication-queue/${smsId}` (DELETE)
- `/communication-queue/delete-all`
- `communication-queue`

## Observed form/config field names

- `sms_from`
- `sms_to`
- `sms_type`
- `status`

## Matching backend route declarations

- GET `/communication-queue` → `communication-queue.access`; `CommunicationQueueController::index`; `../isp-backend/routes/api.php:391`
- POST `/communication-queue/{communicationQueue}/resend` → `communication-queue.resend`; `CommunicationQueueController::resend`; `../isp-backend/routes/api.php:392`
- POST `/communication-queue/resend-all` → `communication-queue.resend-all`; `CommunicationQueueController::resendAll`; `../isp-backend/routes/api.php:393`
- POST `/communication-queue/{communicationQueue}/stop` → `communication-queue.stop`; `CommunicationQueueController::stop`; `../isp-backend/routes/api.php`
- POST `/communication-queue/stop-all` → `communication-queue.stop-all`; `CommunicationQueueController::stopAll`; `../isp-backend/routes/api.php`
- DELETE `/communication-queue/{communicationQueue}` → `communication-queue.delete`; `CommunicationQueueController::destroy`; `../isp-backend/routes/api.php`
- POST `/communication-queue/delete-all` → `communication-queue.delete-all`; `CommunicationQueueController::destroyAll`; `../isp-backend/routes/api.php`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/CommunicationQueueController.php`
- `../isp-backend/app/Http/Resources/CommunicationQueueCollection.php`
