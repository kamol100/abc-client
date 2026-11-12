# Source evidence — client-packages

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/client-packages/page.tsx`
- `app/(dashboard)/client-packages/view/[id]/page.tsx`
- `components/packages/package-column.tsx`
- `components/packages/package-form-schema.ts`
- `components/packages/package-form.tsx`
- `components/packages/package-row-actions.tsx`
- `components/packages/package-table.tsx`
- `components/packages/package-type.ts`
- `components/packages/package-view.tsx`

## Observed permission checks

- `packages.access`
- `packages.create`
- `packages.delete`
- `packages.edit`
- `packages.show`

## Observed API templates (not validated endpoints)

- `/dropdown-networks`
- `/packages`
- `packages`
- `packages/${packageId}`

## Observed form/config field names

- `bandwidth`
- `mikrotik_profile`
- `name`
- `network_id`
- `note`

## Matching backend route declarations

- GET `/packages` → `packages.access`; `PackagesController::index`; `../isp-backend/routes/api.php:193`
- GET `/packages/{packages_id}` → `packages.show`; `PackagesController::show`; `../isp-backend/routes/api.php:194`
- POST `/packages` → `packages.create`; `PackagesController::store`; `../isp-backend/routes/api.php:195`
- PUT `/packages/{packages}` → `packages.edit`; `PackagesController::update`; `../isp-backend/routes/api.php:196`
- DELETE `/packages/{packages_id}` → `packages.delete`; `PackagesController::destroy`; `../isp-backend/routes/api.php:197`
- GET `/dropdown-networks` → `dropdown.networks`; `NetworksController::dropdownList`; `../isp-backend/routes/api.php:697`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/NetworksController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/PackagesController.php`
- `../isp-backend/app/Http/Requests/NetworkRequest.php`
- `../isp-backend/app/Http/Requests/StorePackagesRequest.php`
- `../isp-backend/app/Http/Requests/UpdatePackagesRequest.php`
- `../isp-backend/app/Http/Resources/NetworkCollection.php`
- `../isp-backend/app/Http/Resources/NetworkResource.php`
- `../isp-backend/app/Http/Resources/PackagesCollection.php`
- `../isp-backend/app/Http/Resources/PackagesResource.php`
