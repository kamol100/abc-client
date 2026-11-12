# Source evidence — roles

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/roles/page.tsx`
- `components/roles/role-column.tsx`
- `components/roles/role-form-schema.ts`
- `components/roles/role-form.tsx`
- `components/roles/role-table.tsx`
- `components/roles/role-type.ts`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- `/roles`
- `roles`

## Observed form/config field names

- `name`

## Matching backend route declarations

- GET `/roles` → `roles.access`; `RolesController::index`; `../isp-backend/routes/api.php:167`
- POST `/roles` → `roles.create`; `RolesController::store`; `../isp-backend/routes/api.php:168`
- PUT `/roles/{uuid}` → `roles.edit`; `RolesController::update`; `../isp-backend/routes/api.php:169`
- DELETE `/roles/{id}` → `roles.delete`; `RolesController::destroy`; `../isp-backend/routes/api.php:170`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/RolesController.php`
- `../isp-backend/app/Http/Requests/RoleRequest.php`
- `../isp-backend/app/Http/Resources/RoleCollection.php`
- `../isp-backend/app/Http/Resources/RoleResource.php`
