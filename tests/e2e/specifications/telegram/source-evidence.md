# Source evidence — telegram

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/telegram/page.tsx`
- `components/telegram/telegram-column.tsx`
- `components/telegram/telegram-filter-schema.ts`
- `components/telegram/telegram-form-schema.ts`
- `components/telegram/telegram-form.tsx`
- `components/telegram/telegram-table.tsx`
- `components/telegram/telegram-type.ts`

## Observed permission checks

- `company-settings.access`
- `telegram.create`
- `telegram.delete`
- `telegram.edit`

## Observed API templates (not validated endpoints)

- `/dropdown-zones`
- `/telegram`
- `telegram`

## Observed form/config field names

- `name`
- `status`
- `telegram_channel_id`
- `zone_ids`

## Matching backend route declarations

- GET `/telegram` → `telegram.access`; `TelegramController::index`; `../isp-backend/routes/api.php:409`
- POST `/telegram` → `telegram.create`; `TelegramController::store`; `../isp-backend/routes/api.php:410`
- GET `/telegram/{telegram}` → `telegram.show`; `TelegramController::show`; `../isp-backend/routes/api.php:411`
- PUT `/telegram/{telegram}` → `telegram.edit`; `TelegramController::update`; `../isp-backend/routes/api.php:412`
- DELETE `/telegram/{telegram}` → `telegram.delete`; `TelegramController::destroy`; `../isp-backend/routes/api.php:413`
- GET `/company/settings` → `company-settings.access`; `CompanyController::getSettings`; `../isp-backend/routes/api.php:546`
- POST `/company/settings` → `company-settings.edit`; `CompanyController::updateSettings`; `../isp-backend/routes/api.php:547`
- GET `/dropdown-zones` → `dropdown.zones`; `ZoneController::dropdownList`; `../isp-backend/routes/api.php:699`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/CompanyController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/TelegramController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ZoneController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/CompanyController.php`
- `../isp-backend/app/Http/Requests/ImportCompanyExportRequest.php`
- `../isp-backend/app/Http/Requests/StoreCompanyRequest.php`
- `../isp-backend/app/Http/Requests/StoreTelegramRequest.php`
- `../isp-backend/app/Http/Requests/StoreZoneRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanyProfileRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanyRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanySettingsRequest.php`
- `../isp-backend/app/Http/Requests/UpdateTelegramRequest.php`
- `../isp-backend/app/Http/Requests/UpdateZoneRequest.php`
- `../isp-backend/app/Http/Resources/CompanyCollection.php`
- `../isp-backend/app/Http/Resources/CompanyPublicResource.php`
- `../isp-backend/app/Http/Resources/CompanyResource.php`
- `../isp-backend/app/Http/Resources/TelegramCollection.php`
- `../isp-backend/app/Http/Resources/TelegramResource.php`
- `../isp-backend/app/Http/Resources/ZoneCollection.php`
- `../isp-backend/app/Http/Resources/ZoneResource.php`
