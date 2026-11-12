# Source evidence — sms-templates

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/sms-templates/page.tsx`
- `components/sms-templates/sms-template-column.tsx`
- `components/sms-templates/sms-template-form-schema.ts`
- `components/sms-templates/sms-template-form.tsx`
- `components/sms-templates/sms-template-table.tsx`
- `components/sms-templates/sms-template-type.ts`

## Observed permission checks

- `sms-templates.create`
- `sms-templates.delete`
- `sms-templates.edit`

## Observed API templates (not validated endpoints)

- `/sms-templates`
- `sms-templates`

## Observed form/config field names

- `message`
- `name`
- `template_type`

## Matching backend route declarations

- GET `/sms-templates` → `sms-templates.access`; `SmsTemplateController::index`; `../isp-backend/routes/api.php:396`
- POST `/sms-templates` → `sms-templates.create`; `SmsTemplateController::store`; `../isp-backend/routes/api.php:397`
- GET `/sms-templates/{smsTemplate}` → `sms-templates.show`; `SmsTemplateController::show`; `../isp-backend/routes/api.php:398`
- PUT `/sms-templates/{smsTemplate}` → `sms-templates.edit`; `SmsTemplateController::update`; `../isp-backend/routes/api.php:399`
- DELETE `/sms-templates/{smsTemplate}` → `sms-templates.delete`; `SmsTemplateController::destroy`; `../isp-backend/routes/api.php:400`
- GET `/sms-template/{id}` → `sms-templates.id-show`; `SmsTemplateController::showById`; `../isp-backend/routes/api.php:710`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/SmsTemplateController.php`
- `../isp-backend/app/Http/Requests/StoreSmsTemplateRequest.php`
- `../isp-backend/app/Http/Requests/UpdateSmsTemplateRequest.php`
- `../isp-backend/app/Http/Resources/SingleSmsTemplateResource.php`
- `../isp-backend/app/Http/Resources/SmsTemplateCollection.php`
- `../isp-backend/app/Http/Resources/SmsTemplateResource.php`
