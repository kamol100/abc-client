# Source evidence — settings-general

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/settings/general/page.tsx`
- `components/settings/dashboard-form-schema.ts`
- `components/settings/dashboard.tsx`
- `components/settings/invoice-print-settings.tsx`
- `components/settings/notification-settings.tsx`
- `components/settings/setting-zod-schema.ts`
- `components/settings/settings-form-schema.ts`
- `components/settings/settings-form.tsx`
- `components/settings/settings-type.ts`
- `components/settings/table-form-schema.ts`
- `components/settings/table.tsx`
- `components/settings/themes.tsx`

## Observed permission checks

- `company-settings.edit`

## Observed API templates (not validated endpoints)

- `/company/settings`
- `/invoice-print-settings`
- `invoice-print-settings`

## Observed form/config field names

- `Mahi`
- `mahi`
- `show_dashboard_header`
- `show_table_header`

## Matching backend route declarations

- GET `/company/settings` → `company-settings.access`; `CompanyController::getSettings`; `../isp-backend/routes/api.php:546`
- POST `/company/settings` → `company-settings.edit`; `CompanyController::updateSettings`; `../isp-backend/routes/api.php:547`
- GET `/invoice-print-settings` → `invoice-print-settings.access`; `InvoicePrintSettingsController::show`; `../isp-backend/routes/api.php:548`
- PUT `/invoice-print-settings` → `invoice-print-settings.update`; `InvoicePrintSettingsController::update`; `../isp-backend/routes/api.php:549`
- GET `/user-permissions/{user_uuid}` → `company.user.permissions`; `RolePermissionController::companyAdminUserPermission`; `../isp-backend/routes/api.php:689`
- PUT `/company-upload-image/{company}` → `company.upload.image`; `CompanyController::uploadImage`; `../isp-backend/routes/api.php:751`
- DELETE `/company-remove-image/{company}` → `company.remove.image`; `CompanyController::removeImage`; `../isp-backend/routes/api.php:752`
- GET `/v1/company-data` → `company.index`; `ClientCompanyController::index`; `../isp-backend/routes/api.php:787`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/CompanyController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/InvoicePrintSettingsController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/RolePermissionController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/CompanyController.php`
- `../isp-backend/app/Http/Requests/ImportCompanyExportRequest.php`
- `../isp-backend/app/Http/Requests/RolePermissionRequest.php`
- `../isp-backend/app/Http/Requests/StoreCompanyRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanyProfileRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanyRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanySettingsRequest.php`
- `../isp-backend/app/Http/Requests/UpdateInvoicePrintSettingsRequest.php`
- `../isp-backend/app/Http/Resources/CompanyCollection.php`
- `../isp-backend/app/Http/Resources/CompanyPublicResource.php`
- `../isp-backend/app/Http/Resources/CompanyResource.php`
