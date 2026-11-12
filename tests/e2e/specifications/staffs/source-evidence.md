# Source evidence — staffs

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/staffs/create/page.tsx`
- `app/(dashboard)/staffs/edit/[id]/page.tsx`
- `app/(dashboard)/staffs/page.tsx`
- `components/staffs/staff-column.tsx`
- `components/staffs/staff-form-schema.ts`
- `components/staffs/staff-form.tsx`
- `components/staffs/staff-image-fields.tsx`
- `components/staffs/staff-table.tsx`
- `components/staffs/staff-type.ts`

## Observed permission checks

- `impersonate.staff`
- `staffs.edit`
- `staffs.reset-password`
- `staffs.status`

## Observed API templates (not validated endpoints)

- `/dropdown-roles`
- `/dropdown-zones`
- `/staffs`
- `/staffs/${staffId}/password`
- `/staffs/${staffId}/status`
- `staffs`

## Observed form/config field names

- `common.advance_information`
- `common.basic_information`
- `common.salary_information`
- `date_of_birth`
- `deductions_label`
- `deductions_value`
- `designation`
- `email`
- `father_name`
- `gender`
- `items_label`
- `items_value`
- `job_experience`
- `join_date`
- `marital_status`
- `mother_name`
- `name`
- `nid_back`
- `nid_front`
- `password`
- `permanent_address`
- `phone`
- `photo`
- `present_address`
- `roles_id`
- `salary_day`
- `salary_deductions`
- `salary_generation_type`
- `salary_items`
- `social_media_address`
- `staff_images`
- `status`
- `username`
- `zone_ids`

## Matching backend route declarations

- GET `/status` → `impersonate.status`; `ImpersonationController::status`; `../isp-backend/routes/api.php:148`
- POST `/staff/{staff}` → `impersonate.staff`; `ImpersonationController::impersonateStaff`; `../isp-backend/routes/api.php:155`
- POST `/{user}` → `impersonate.start`; `ImpersonationController::impersonate`; `../isp-backend/routes/api.php:156`
- GET `/staffs` → `staffs.access`; `StaffController::index`; `../isp-backend/routes/api.php:431`
- POST `/staffs` → `staffs.create`; `StaffController::store`; `../isp-backend/routes/api.php:432`
- GET `/staffs/{staff}` → `staffs.show`; `StaffController::show`; `../isp-backend/routes/api.php:433`
- PUT `/staffs/{staff}` → `staffs.edit`; `StaffController::update`; `../isp-backend/routes/api.php:434`
- PUT `/staffs/{staff}/status` → `staffs.status`; `StaffController::updateStatus`; `../isp-backend/routes/api.php:435`
- PUT `/staffs/{staff}/password` → `staffs.reset-password`; `StaffController::resetPassword`; `../isp-backend/routes/api.php:436`
- DELETE `/staffs/{staff}` → `staffs.delete`; `StaffController::destroy`; `../isp-backend/routes/api.php:446`
- GET `/impersonate-company-users` → `impersonate.company.users`; `ImpersonationController::impersonateCompanyUser`; `../isp-backend/routes/api.php:624`
- GET `/impersonate-reseller-users` → `impersonate.reseller.users`; `ImpersonationController::impersonateResellerUser`; `../isp-backend/routes/api.php:625`
- GET `/dropdown-roles` → `dropdown.roles`; `RolesController::dropdownList`; `../isp-backend/routes/api.php:685`
- GET `/dropdown-zones` → `dropdown.zones`; `ZoneController::dropdownList`; `../isp-backend/routes/api.php:699`
- PUT `/staffs/item-per-page/{staff}` → `staff.pagination.length`; `StaffController::setPaginationLength`; `../isp-backend/routes/api.php:739`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/ImpersonationController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/RolesController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/StaffController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ZoneController.php`
- `../isp-backend/app/Http/Requests/RemoveStaffImageRequest.php`
- `../isp-backend/app/Http/Requests/ResetStaffPasswordRequest.php`
- `../isp-backend/app/Http/Requests/RoleRequest.php`
- `../isp-backend/app/Http/Requests/StoreStaffRequest.php`
- `../isp-backend/app/Http/Requests/StoreZoneRequest.php`
- `../isp-backend/app/Http/Requests/UpdateStaffRequest.php`
- `../isp-backend/app/Http/Requests/UpdateStaffStatusRequest.php`
- `../isp-backend/app/Http/Requests/UpdateZoneRequest.php`
- `../isp-backend/app/Http/Requests/UploadStaffImageRequest.php`
- `../isp-backend/app/Http/Resources/AuthResource.php`
- `../isp-backend/app/Http/Resources/CompanyResource.php`
- `../isp-backend/app/Http/Resources/ImpersonationResource.php`
- `../isp-backend/app/Http/Resources/ResellerResource.php`
- `../isp-backend/app/Http/Resources/RoleCollection.php`
- `../isp-backend/app/Http/Resources/RoleResource.php`
- `../isp-backend/app/Http/Resources/StaffCollection.php`
- `../isp-backend/app/Http/Resources/StaffResource.php`
- `../isp-backend/app/Http/Resources/ZoneCollection.php`
- `../isp-backend/app/Http/Resources/ZoneResource.php`
