# Source evidence — mikrotik-packages

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/mikrotik-packages/page.tsx`
- `components/mikrotik-packages/mikrotik-package-column.tsx`
- `components/mikrotik-packages/mikrotik-package-filter-schema.ts`
- `components/mikrotik-packages/mikrotik-package-form-schema.ts`
- `components/mikrotik-packages/mikrotik-package-form.tsx`
- `components/mikrotik-packages/mikrotik-package-type.ts`
- `components/mikrotik-packages/mikrotik-packages-table.tsx`
- `components/mikrotik-packages/mikrotik-packages-toolbar-actions.tsx`

## Observed permission checks

- `mikrotik-packages.create`
- `mikrotik-packages.delete`
- `mikrotik-packages.edit`

## Observed API templates (not validated endpoints)

- `/dropdown-networks`
- `mikrotik-packages`

## Observed form/config field names

- `name`
- `network_id`

## Matching backend route declarations

- GET `/mikrotik-packages` → `mikrotik-packages.access`; `MikrotikPackageController::index`; `../isp-backend/routes/api.php:187`
- POST `/mikrotik-packages` → `mikrotik-packages.create`; `MikrotikPackageController::store`; `../isp-backend/routes/api.php:188`
- PUT `/mikrotik-packages/{id}` → `mikrotik-packages.edit`; `MikrotikPackageController::update`; `../isp-backend/routes/api.php:189`
- DELETE `/mikrotik-packages/{id}` → `mikrotik-packages.delete`; `MikrotikPackageController::destroy`; `../isp-backend/routes/api.php:190`
- GET `/dropdown-networks` → `dropdown.networks`; `NetworksController::dropdownList`; `../isp-backend/routes/api.php:697`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/MikrotikPackageController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/NetworksController.php`
- `../isp-backend/app/Http/Requests/NetworkRequest.php`
- `../isp-backend/app/Http/Resources/NetworkCollection.php`
- `../isp-backend/app/Http/Resources/NetworkResource.php`
