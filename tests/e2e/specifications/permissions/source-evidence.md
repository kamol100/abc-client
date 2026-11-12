# Source evidence — permissions

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/permissions/[id]/page.tsx`
- `app/(dashboard)/permissions/page.tsx`
- `components/permissions/permission-entity-form.tsx`
- `components/permissions/permission-form-schema.ts`
- `components/permissions/permission-form.tsx`
- `components/permissions/permission-table.tsx`
- `components/permissions/permission-type.ts`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- `/permission-${action}`
- `permissions`
- `role-permissions/${selectedRoleId ?? 0}`
- `roles`

## Observed form/config field names

- `role_id`

## Matching backend route declarations

- GET `/roles` → `roles.access`; `RolesController::index`; `../isp-backend/routes/api.php:167`
- POST `/roles` → `roles.create`; `RolesController::store`; `../isp-backend/routes/api.php:168`
- PUT `/roles/{uuid}` → `roles.edit`; `RolesController::update`; `../isp-backend/routes/api.php:169`
- DELETE `/roles/{id}` → `roles.delete`; `RolesController::destroy`; `../isp-backend/routes/api.php:170`
- GET `/permissions` → `permissions.access`; `PermissionsController::index`; `../isp-backend/routes/api.php:173`
- POST `/permission-add` → `permissions.add`; `RolePermissionController::add`; `../isp-backend/routes/api.php:176`
- POST `/permission-remove` → `permissions.remove`; `RolePermissionController::remove`; `../isp-backend/routes/api.php:177`
- GET `/role-permissions/{role_id}/{guard_name?}` → `role.permissions`; `RolePermissionController::roleHasPermissions`; `../isp-backend/routes/api.php:687`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/PermissionsController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/RolePermissionController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/RolesController.php`
- `../isp-backend/app/Http/Requests/RolePermissionRequest.php`
- `../isp-backend/app/Http/Requests/RoleRequest.php`
- `../isp-backend/app/Http/Resources/PermissionResource.php`
- `../isp-backend/app/Http/Resources/RoleCollection.php`
- `../isp-backend/app/Http/Resources/RoleResource.php`
