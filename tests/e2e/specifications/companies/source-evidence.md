# Source evidence — companies

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/companies/page.tsx`
- `components/companies/companies-column.tsx`
- `components/companies/company-form-schema.ts`
- `components/companies/company-form.tsx`
- `components/companies/company-import-dialog.tsx`
- `components/companies/company-table.tsx`
- `components/companies/company-type.ts`

## Observed permission checks

- `companies.delete`
- `companies.edit`

## Observed API templates (not validated endpoints)

- `/dropdown-subscription-plans`
- `companies`
- `companies/export-files`
- `companies/import`

## Observed form/config field names

- `address`
- `confirm`
- `domain`
- `email`
- `name`
- `password`
- `phone`
- `status`
- `subscription_plan_id`
- `username`

## Matching backend route declarations

- GET `/companies` → `companies.access`; `CompanyController::index`; `../isp-backend/routes/api.php:510`
- GET `/companies/export-files` → `companies.export-files`; `CompanyController::exportFiles`; `../isp-backend/routes/api.php:511`
- POST `/companies/import` → `companies.import`; `CompanyController::importFromExport`; `../isp-backend/routes/api.php:512`
- POST `/companies` → `companies.create`; `CompanyController::store`; `../isp-backend/routes/api.php:513`
- GET `/companies/{company}` → `companies.show`; `CompanyController::show`; `../isp-backend/routes/api.php:514`
- PUT `/companies/{company}` → `companies.edit`; `CompanyController::update`; `../isp-backend/routes/api.php:515`
- DELETE `/companies/{company}` → `companies.delete`; `CompanyController::destroy`; `../isp-backend/routes/api.php:516`
- GET `/dropdown-subscription-plans` → `dropdown.subscription-plans`; `SubscriptionPlanController::dropdownList`; `../isp-backend/routes/api.php:715`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/CompanyController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/SubscriptionPlanController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/CompanyController.php`
- `../isp-backend/app/Http/Requests/ImportCompanyExportRequest.php`
- `../isp-backend/app/Http/Requests/StoreCompanyRequest.php`
- `../isp-backend/app/Http/Requests/SubscriptionPlanRequest.php`
- `../isp-backend/app/Http/Requests/SyncPlanFeaturesRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanyProfileRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanyRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanySettingsRequest.php`
- `../isp-backend/app/Http/Resources/CompanyCollection.php`
- `../isp-backend/app/Http/Resources/CompanyPublicResource.php`
- `../isp-backend/app/Http/Resources/CompanyResource.php`
- `../isp-backend/app/Http/Resources/SubscriptionPlanCollection.php`
- `../isp-backend/app/Http/Resources/SubscriptionPlanResource.php`
