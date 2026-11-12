# Source evidence — users

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/users/page.tsx`
- `components/users/user-filter-schema.ts`
- `components/users/user-form-schema.ts`
- `components/users/user-form.tsx`
- `components/users/user-table.tsx`
- `components/users/user-type.ts`
- `components/users/users-column.tsx`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- `/dropdown-companies`
- `/dropdown-roles`
- `/users`
- `users`

## Observed form/config field names

- `company_id`
- `confirm`
- `email`
- `name`
- `password`
- `roles_id`
- `status`
- `username`

## Matching backend route declarations

- GET `/users` → `users.access`; `UserController::index`; `../isp-backend/routes/api.php:160`
- POST `/users` → `users.create`; `UserController::store`; `../isp-backend/routes/api.php:161`
- GET `/users/{user}` → `users.show`; `UserController::show`; `../isp-backend/routes/api.php:162`
- PUT `/users/{uuid}` → `users.edit`; `UserController::update`; `../isp-backend/routes/api.php:163`
- DELETE `/users/{user}` → `users.delete`; `UserController::destroy`; `../isp-backend/routes/api.php:164`
- GET `/dropdown-roles` → `dropdown.roles`; `RolesController::dropdownList`; `../isp-backend/routes/api.php:685`
- GET `/dropdown-companies` → `dropdown.companies`; `CompanyController::dropdownList`; `../isp-backend/routes/api.php:714`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/CompanyController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/RolesController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/UserController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/CompanyController.php`
- `../isp-backend/app/Http/Requests/ImportCompanyExportRequest.php`
- `../isp-backend/app/Http/Requests/RoleRequest.php`
- `../isp-backend/app/Http/Requests/SignupRequest.php`
- `../isp-backend/app/Http/Requests/StoreCompanyRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanyProfileRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanyRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanySettingsRequest.php`
- `../isp-backend/app/Http/Requests/UserUpdateRequest.php`
- `../isp-backend/app/Http/Resources/CompanyCollection.php`
- `../isp-backend/app/Http/Resources/CompanyPublicResource.php`
- `../isp-backend/app/Http/Resources/CompanyResource.php`
- `../isp-backend/app/Http/Resources/RoleCollection.php`
- `../isp-backend/app/Http/Resources/RoleResource.php`
- `../isp-backend/app/Http/Resources/UserCollection.php`
- `../isp-backend/app/Http/Resources/UserProfileResource.php`
- `../isp-backend/app/Http/Resources/UserResource.php`
