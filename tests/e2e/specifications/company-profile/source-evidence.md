# Source evidence — company-profile

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/company-profile/[id]/page.tsx`
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

- GET `/resellers/company/{reseller}` → `company-profile.access`; `ResellerController::company`; `../isp-backend/routes/api.php:250`
- GET `/company/settings` → `company-settings.access`; `CompanyController::getSettings`; `../isp-backend/routes/api.php:546`
- POST `/company/settings` → `company-settings.edit`; `CompanyController::updateSettings`; `../isp-backend/routes/api.php:547`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/CompanyController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ResellerController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/CompanyController.php`
- `../isp-backend/app/Http/Requests/ImportCompanyExportRequest.php`
- `../isp-backend/app/Http/Requests/ImportResellerExportRequest.php`
- `../isp-backend/app/Http/Requests/RemoveResellerImageRequest.php`
- `../isp-backend/app/Http/Requests/StoreCompanyRequest.php`
- `../isp-backend/app/Http/Requests/StoreResellerRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanyProfileRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanyRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanySettingsRequest.php`
- `../isp-backend/app/Http/Requests/UpdateResellerRequest.php`
- `../isp-backend/app/Http/Requests/UploadResellerImageRequest.php`
- `../isp-backend/app/Http/Resources/ClientCollection.php`
- `../isp-backend/app/Http/Resources/CompanyCollection.php`
- `../isp-backend/app/Http/Resources/CompanyPublicResource.php`
- `../isp-backend/app/Http/Resources/CompanyResource.php`
- `../isp-backend/app/Http/Resources/PackagesResource.php`
- `../isp-backend/app/Http/Resources/ResellerCollection.php`
- `../isp-backend/app/Http/Resources/ResellerCompanyResource.php`
- `../isp-backend/app/Http/Resources/ResellerResource.php`
