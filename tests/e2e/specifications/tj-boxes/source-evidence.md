# Source evidence — tj-boxes

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/tj-boxes/page.tsx`
- `components/tj-box/tj-box-column.tsx`
- `components/tj-box/tj-box-filter-schema.ts`
- `components/tj-box/tj-box-form-schema.ts`
- `components/tj-box/tj-box-form.tsx`
- `components/tj-box/tj-box-table.tsx`
- `components/tj-box/tj-box-type.ts`

## Observed permission checks

- `tj-boxes.create`
- `tj-boxes.delete`
- `tj-boxes.edit`

## Observed API templates (not validated endpoints)

- `/dropdown-devices`
- `/dropdown-zones`
- `/tj-boxes`
- `tj-boxes`

## Observed form/config field names

- `address`
- `device_id`
- `name`
- `status`
- `tj_box_location`
- `zone_id`

## Matching backend route declarations

- GET `/tj-boxes` → `tj-boxes.access`; `TjBoxController::index`; `../isp-backend/routes/api.php:479`
- GET `/tj-boxes-map` → `tj-boxes.map`; `TjBoxController::map`; `../isp-backend/routes/api.php:480`
- POST `/tj-boxes` → `tj-boxes.create`; `TjBoxController::store`; `../isp-backend/routes/api.php:481`
- GET `/tj-boxes/{tjBox}` → `tj-boxes.show`; `TjBoxController::show`; `../isp-backend/routes/api.php:482`
- PUT `/tj-boxes/{tjBox}` → `tj-boxes.edit`; `TjBoxController::update`; `../isp-backend/routes/api.php:483`
- DELETE `/tj-boxes/{tjBox}` → `tj-boxes.delete`; `TjBoxController::destroy`; `../isp-backend/routes/api.php:484`
- GET `/dropdown-devices` → `device.dropdown`; `DeviceController::dropdownList`; `../isp-backend/routes/api.php:694`
- GET `/dropdown-zones` → `dropdown.zones`; `ZoneController::dropdownList`; `../isp-backend/routes/api.php:699`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/DeviceController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/TjBoxController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ZoneController.php`
- `../isp-backend/app/Http/Requests/StoreDeviceRequest.php`
- `../isp-backend/app/Http/Requests/StoreTjBoxRequest.php`
- `../isp-backend/app/Http/Requests/StoreZoneRequest.php`
- `../isp-backend/app/Http/Requests/UpdateDeviceRequest.php`
- `../isp-backend/app/Http/Requests/UpdateTjBoxRequest.php`
- `../isp-backend/app/Http/Requests/UpdateZoneRequest.php`
- `../isp-backend/app/Http/Resources/DeviceCollection.php`
- `../isp-backend/app/Http/Resources/DeviceResource.php`
- `../isp-backend/app/Http/Resources/TjBoxCollection.php`
- `../isp-backend/app/Http/Resources/TjBoxResource.php`
- `../isp-backend/app/Http/Resources/ZoneCollection.php`
- `../isp-backend/app/Http/Resources/ZoneResource.php`
