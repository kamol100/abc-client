# Source evidence — communication-queue

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/communication-queue/page.tsx`
- `components/communication-queue/communication-queue-column.tsx`
- `components/communication-queue/communication-queue-filter-schema.ts`
- `components/communication-queue/communication-queue-resend-all-dialog.tsx`
- `components/communication-queue/communication-queue-resend-button.tsx`
- `components/communication-queue/communication-queue-table.tsx`
- `components/communication-queue/communication-queue-type.ts`

## Observed permission checks

- `communication-queue.resend`
- `communication-queue.resend-all`

## Observed API templates (not validated endpoints)

- `/communication-queue/${smsId}/resend`
- `/communication-queue/resend-all`
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

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/CommunicationQueueController.php`
- `../isp-backend/app/Http/Resources/CommunicationQueueCollection.php`
