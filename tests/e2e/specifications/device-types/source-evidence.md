# Source evidence — device-types

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/device-types/page.tsx`
- `components/device-type/device-type-column.tsx`
- `components/device-type/device-type-form-schema.ts`
- `components/device-type/device-type-form.tsx`
- `components/device-type/device-type-table.tsx`
- `components/device-type/device-type-type.ts`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- `/device-types`
- `device-types`

## Observed form/config field names

- `name`
- `note`

## Matching backend route declarations

- GET `/device-types` → `device-types.access`; `DeviceTypeController::index`; `../isp-backend/routes/api.php:281`
- POST `/device-types` → `device-types.create`; `DeviceTypeController::store`; `../isp-backend/routes/api.php:282`
- GET `/device-types/{deviceType}` → `device-types.show`; `DeviceTypeController::show`; `../isp-backend/routes/api.php:283`
- PUT `/device-types/{deviceType}` → `device-types.edit`; `DeviceTypeController::update`; `../isp-backend/routes/api.php:284`
- DELETE `/device-types/{deviceType}` → `device-types.delete`; `DeviceTypeController::destroy`; `../isp-backend/routes/api.php:285`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/DeviceTypeController.php`
- `../isp-backend/app/Http/Requests/StoreDeviceTypeRequest.php`
- `../isp-backend/app/Http/Requests/UpdateDeviceTypeRequest.php`
- `../isp-backend/app/Http/Resources/DeviceTypeCollection.php`
- `../isp-backend/app/Http/Resources/DeviceTypeResource.php`
