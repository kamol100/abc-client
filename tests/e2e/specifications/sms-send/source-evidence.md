# Source evidence — sms-send

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/sms-send/page.tsx`
- `components/sms-sent/sms-send-confirm-dialog.tsx`
- `components/sms-sent/sms-sent-column.tsx`
- `components/sms-sent/sms-sent-filter-schema.ts`
- `components/sms-sent/sms-sent-form-schema.ts`
- `components/sms-sent/sms-sent-form.tsx`
- `components/sms-sent/sms-sent-table.tsx`
- `components/sms-sent/sms-sent-type.ts`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- `/dropdown-networks`
- `/dropdown-sms-templates`
- `/dropdown-zones`
- `sms-clients`
- `sms-rate`
- `sms-store`
- `sms-store/preview`

## Observed form/config field names

- `any`
- `network_id`
- `phone`
- `sms_body`
- `sms_template_id`
- `status`
- `zone_id`

## Matching backend route declarations

- POST `/sms-store` → `sms-store.store`; `SmsSendController::store`; `../isp-backend/routes/api.php:416`
- POST `/sms-store/preview` → `sms-store.preview`; `SmsSendController::preview`; `../isp-backend/routes/api.php:417`
- GET `/sms-rate` → `sms-store.rate`; `SmsSendController::rate`; `../isp-backend/routes/api.php:418`
- GET `/sms-clients` → `sms.clients`; `SmsSendController::SmsClient`; `../isp-backend/routes/api.php:649`
- GET `/dropdown-networks` → `dropdown.networks`; `NetworksController::dropdownList`; `../isp-backend/routes/api.php:697`
- GET `/dropdown-zones` → `dropdown.zones`; `ZoneController::dropdownList`; `../isp-backend/routes/api.php:699`
- GET `/dropdown-sms-templates` → `dropdown.sms.templates`; `SmsTemplateController::dropdownList`; `../isp-backend/routes/api.php:709`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/NetworksController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/SmsSendController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/SmsTemplateController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ZoneController.php`
- `../isp-backend/app/Http/Requests/NetworkRequest.php`
- `../isp-backend/app/Http/Requests/StoreSmsTemplateRequest.php`
- `../isp-backend/app/Http/Requests/StoreZoneRequest.php`
- `../isp-backend/app/Http/Requests/UpdateSmsTemplateRequest.php`
- `../isp-backend/app/Http/Requests/UpdateZoneRequest.php`
- `../isp-backend/app/Http/Resources/ClientSmsCollection.php`
- `../isp-backend/app/Http/Resources/NetworkCollection.php`
- `../isp-backend/app/Http/Resources/NetworkResource.php`
- `../isp-backend/app/Http/Resources/SingleSmsTemplateResource.php`
- `../isp-backend/app/Http/Resources/SmsTemplateCollection.php`
- `../isp-backend/app/Http/Resources/SmsTemplateResource.php`
- `../isp-backend/app/Http/Resources/ZoneCollection.php`
- `../isp-backend/app/Http/Resources/ZoneResource.php`
