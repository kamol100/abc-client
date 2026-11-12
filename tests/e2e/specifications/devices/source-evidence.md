# Source evidence — devices

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/devices/page.tsx`
- `components/device/device-actions-cell.tsx`
- `components/device/device-column.tsx`
- `components/device/device-filter-schema.ts`
- `components/device/device-form-schema.ts`
- `components/device/device-form.tsx`
- `components/device/device-status-cell.tsx`
- `components/device/device-table.tsx`
- `components/device/device-type.ts`

## Observed permission checks

- `devices.create`
- `devices.delete`
- `devices.edit`
- `olts.access-settings`
- `olts.access-test`

## Observed API templates (not validated endpoints)

- `/devices`
- `/dropdown-device-types`
- `/dropdown-devices`
- `/dropdown-networks`
- `/dropdown-zones`
- `devices`
- `dropdown-device-types`

## Observed form/config field names

- `cli_password`
- `cli_protocol`
- `cli_username`
- `device_id`
- `device_ip`
- `device_order`
- `device_type_id`
- `fiber_code`
- `input_port`
- `latitude`
- `longitude`
- `monitor_enabled`
- `name`
- `network_id`
- `note`
- `snmp_community`
- `status`
- `total_port`
- `zone_id`

## Matching backend route declarations

- GET `/devices` → `devices.access`; `DeviceController::index`; `../isp-backend/routes/api.php:288`
- GET `/devices/{device}` → `devices.show`; `DeviceController::show`; `../isp-backend/routes/api.php:289`
- POST `/devices` → `devices.create`; `DeviceController::store`; `../isp-backend/routes/api.php:290`
- PUT `/devices/{device}` → `devices.edit`; `DeviceController::update`; `../isp-backend/routes/api.php:291`
- DELETE `/devices/{device}` → `devices.delete`; `DeviceController::destroy`; `../isp-backend/routes/api.php:292`
- POST `/devices/{device}/ping` → `devices.ping`; `DeviceMonitoringController::ping`; `../isp-backend/routes/api.php:295`
- GET `/devices/{device}/monitoring` → `devices.monitoring`; `DeviceMonitoringController::monitoring`; `../isp-backend/routes/api.php:296`
- GET `/devices/{device}/checks` → `devices.history`; `DeviceMonitoringController::checks`; `../isp-backend/routes/api.php:297`
- GET `/olts` → `olts.access`; `OltController::index`; `../isp-backend/routes/api.php:298`
- GET `/olts/{device}` → `olts.show`; `OltController::show`; `../isp-backend/routes/api.php:299`
- GET `/olts/{device}/clients` → `olts.clients`; `OltController::clients`; `../isp-backend/routes/api.php:300`
- DELETE `/olts/{device}/access` → `olts.access-remove`; `OltAccessController::destroy`; `../isp-backend/routes/api.php:303`
- POST `/olts/{device}/access/test` → `olts.access-test`; `OltAccessController::test`; `../isp-backend/routes/api.php:304`
- POST `/olts/{device}/poll` → `olts.poll`; `OltController::poll`; `../isp-backend/routes/api.php:305`
- GET `/dropdown-device-types` → `device.type.dropdown`; `DeviceTypeController::dropdownList`; `../isp-backend/routes/api.php:693`
- GET `/dropdown-devices` → `device.dropdown`; `DeviceController::dropdownList`; `../isp-backend/routes/api.php:694`
- POST `/olts/{device}/access/detect-community` → `olts.access-detect-community`; `OltAccessController::detectCommunity`; `../isp-backend/routes/api.php:696`
- GET `/dropdown-networks` → `dropdown.networks`; `NetworksController::dropdownList`; `../isp-backend/routes/api.php:697`
- GET `/dropdown-zones` → `dropdown.zones`; `ZoneController::dropdownList`; `../isp-backend/routes/api.php:699`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/DeviceController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/DeviceMonitoringController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/DeviceTypeController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/NetworksController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/OltAccessController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/OltController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ZoneController.php`
- `../isp-backend/app/Http/Requests/NetworkRequest.php`
- `../isp-backend/app/Http/Requests/OltAccessRequest.php`
- `../isp-backend/app/Http/Requests/StoreDeviceRequest.php`
- `../isp-backend/app/Http/Requests/StoreDeviceTypeRequest.php`
- `../isp-backend/app/Http/Requests/StoreZoneRequest.php`
- `../isp-backend/app/Http/Requests/UpdateDeviceRequest.php`
- `../isp-backend/app/Http/Requests/UpdateDeviceTypeRequest.php`
- `../isp-backend/app/Http/Requests/UpdateZoneRequest.php`
- `../isp-backend/app/Http/Resources/DeviceCollection.php`
- `../isp-backend/app/Http/Resources/DeviceResource.php`
- `../isp-backend/app/Http/Resources/DeviceTypeCollection.php`
- `../isp-backend/app/Http/Resources/DeviceTypeResource.php`
- `../isp-backend/app/Http/Resources/NetworkCollection.php`
- `../isp-backend/app/Http/Resources/NetworkResource.php`
- `../isp-backend/app/Http/Resources/PaginatedCollection.php`
- `../isp-backend/app/Http/Resources/ZoneCollection.php`
- `../isp-backend/app/Http/Resources/ZoneResource.php`
