# Source evidence — vendors

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/vendors/page.tsx`
- `components/vendors/vendor-filter-schema.ts`
- `components/vendors/vendor-form-schema.ts`
- `components/vendors/vendor-form.tsx`
- `components/vendors/vendor-table.tsx`
- `components/vendors/vendor-type.ts`
- `components/vendors/vendors-column.tsx`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- `/vendors`
- `vendors`

## Observed form/config field names

- `address`
- `email`
- `name`
- `phone`

## Matching backend route declarations

- GET `/vendors` → `vendors.access`; `VendorController::index`; `../isp-backend/routes/api.php:341`
- POST `/vendors` → `vendors.create`; `VendorController::store`; `../isp-backend/routes/api.php:342`
- GET `/vendors/{vendor}` → `vendors.show`; `VendorController::show`; `../isp-backend/routes/api.php:343`
- PUT `/vendors/{vendor}` → `vendors.edit`; `VendorController::update`; `../isp-backend/routes/api.php:344`
- DELETE `/vendors/{vendor}` → `vendors.delete`; `VendorController::destroy`; `../isp-backend/routes/api.php:345`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/VendorController.php`
- `../isp-backend/app/Http/Requests/StoreVendorRequest.php`
- `../isp-backend/app/Http/Requests/UpdateVendorRequest.php`
- `../isp-backend/app/Http/Resources/VendorCollection.php`
- `../isp-backend/app/Http/Resources/VendorResource.php`
