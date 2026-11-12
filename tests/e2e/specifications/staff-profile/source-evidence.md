# Source evidence — staff-profile

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/staff-profile/page.tsx`
- `components/profiles/change-password-dialog.tsx`
- `components/profiles/change-password-form-schema.ts`
- `components/profiles/change-password-type.ts`
- `components/profiles/company-profile.tsx`
- `components/profiles/profile-avatar.ts`
- `components/profiles/profile-helpers.ts`
- `components/profiles/profile.tsx`
- `components/profiles/reseller-profile.tsx`
- `components/profiles/staff-account-page.tsx`
- `components/profiles/staff-account-type.ts`

## Observed permission checks

- `company-settings.access`

## Observed API templates (not validated endpoints)

- `/auth/change-username`
- `/staff-account`
- `/staff-account/settings`
- `/staff-photo`
- `staff-account`

## Observed form/config field names

- `current_password`
- `current_username`
- `password`
- `password_confirmation`
- `username`

## Matching backend route declarations

- GET `/staff-account` → `staff.account`; `StaffAccountController::show`; `../isp-backend/routes/api.php:134`
- PUT `/staff-account` → `staff.account.update`; `StaffAccountController::update`; `../isp-backend/routes/api.php:135`
- PUT `/staff-account/settings` → `staff.account.settings`; `StaffAccountController::updateSettings`; `../isp-backend/routes/api.php:136`
- GET `/staff-photo` → `staff.photo`; `StaffAccountController::photo`; `../isp-backend/routes/api.php:137`
- POST `/staff-photo` → `staff.photo.upload`; `StaffAccountController::uploadPhoto`; `../isp-backend/routes/api.php:138`
- DELETE `/staff-photo` → `staff.photo.remove`; `StaffAccountController::removePhoto`; `../isp-backend/routes/api.php:139`
- GET `/company/settings` → `company-settings.access`; `CompanyController::getSettings`; `../isp-backend/routes/api.php:546`
- POST `/company/settings` → `company-settings.edit`; `CompanyController::updateSettings`; `../isp-backend/routes/api.php:547`
- POST `/auth/client` → `clients.login`; `AuthController::login`; `../isp-backend/routes/client.php:22`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/CompanyController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/Auth/AuthController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/StaffAccountController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/Auth/AuthController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/CompanyController.php`
- `../isp-backend/app/Http/Requests/ChangePasswordRequest.php`
- `../isp-backend/app/Http/Requests/ChangeUsernameRequest.php`
- `../isp-backend/app/Http/Requests/ClientLoginRequest.php`
- `../isp-backend/app/Http/Requests/ImportCompanyExportRequest.php`
- `../isp-backend/app/Http/Requests/LoginRequest.php`
- `../isp-backend/app/Http/Requests/SignupRequest.php`
- `../isp-backend/app/Http/Requests/StoreCompanyRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanyProfileRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanyRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanySettingsRequest.php`
- `../isp-backend/app/Http/Requests/UpdateStaffAccountRequest.php`
- `../isp-backend/app/Http/Requests/UpdateUserAccountSettingsRequest.php`
- `../isp-backend/app/Http/Requests/UploadStaffAccountPhotoRequest.php`
- `../isp-backend/app/Http/Resources/AuthResource.php`
- `../isp-backend/app/Http/Resources/ClientAuthResource.php`
- `../isp-backend/app/Http/Resources/CompanyCollection.php`
- `../isp-backend/app/Http/Resources/CompanyPublicResource.php`
- `../isp-backend/app/Http/Resources/CompanyResource.php`
- `../isp-backend/app/Http/Resources/StaffAccountResource.php`
