# Source evidence — reseller-profile

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/reseller-profile/[id]/page.tsx`
- `components/company-profile/company-profile-form-schema.ts`
- `components/company-profile/company-profile-form.tsx`
- `components/company-profile/company-profile-logo-upload.tsx`
- `components/company-profile/company-profile-type.ts`
- `components/company-profile/company-profile.tsx`

## Observed permission checks

- `company-settings.access`
- `company-settings.edit`

## Observed API templates (not validated endpoints)

- None extracted; inspect page, shared components and dynamic configuration.

## Observed form/config field names

- `address`
- `email`
- `name`
- `phone`
- `support_phone`

## Matching backend route declarations

- GET `/company/settings` → `company-settings.access`; `CompanyController::getSettings`; `../isp-backend/routes/api.php:546`
- POST `/company/settings` → `company-settings.edit`; `CompanyController::updateSettings`; `../isp-backend/routes/api.php:547`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/CompanyController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/CompanyController.php`
- `../isp-backend/app/Http/Requests/ImportCompanyExportRequest.php`
- `../isp-backend/app/Http/Requests/StoreCompanyRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanyProfileRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanyRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanySettingsRequest.php`
- `../isp-backend/app/Http/Resources/CompanyCollection.php`
- `../isp-backend/app/Http/Resources/CompanyPublicResource.php`
- `../isp-backend/app/Http/Resources/CompanyResource.php`
