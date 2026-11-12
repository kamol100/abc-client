# Source evidence — tj-box-maps

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/tj-box-maps/page.tsx`
- `components/maps/client-maps-canvas.tsx`
- `components/maps/client-maps-filter-schema.ts`
- `components/maps/client-maps.tsx`
- `components/maps/map-utils.ts`
- `components/maps/maps-type.ts`
- `components/maps/tj-box-maps-canvas.tsx`
- `components/maps/tj-box-maps-filter-schema.ts`
- `components/maps/tj-box-maps-table.tsx`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- `/dropdown-devices`
- `/dropdown-networks`
- `/dropdown-zones`
- `client-maps`
- `tj-boxes-map`

## Observed form/config field names

- `address`
- `device_id`
- `name`
- `network_id`
- `status`
- `zone_id`

## Matching backend route declarations

- GET `/client-maps` → `clients.map`; `ClientController::getClientMaps`; `../isp-backend/routes/api.php:217`
- GET `/tj-boxes-map` → `tj-boxes.map`; `TjBoxController::map`; `../isp-backend/routes/api.php:480`
- GET `/dropdown-devices` → `device.dropdown`; `DeviceController::dropdownList`; `../isp-backend/routes/api.php:694`
- GET `/dropdown-networks` → `dropdown.networks`; `NetworksController::dropdownList`; `../isp-backend/routes/api.php:697`
- GET `/dropdown-zones` → `dropdown.zones`; `ZoneController::dropdownList`; `../isp-backend/routes/api.php:699`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/ClientController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/DeviceController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/NetworksController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/TjBoxController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ZoneController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/ClientController.php`
- `../isp-backend/app/Http/Requests/AddClientMapRequest.php`
- `../isp-backend/app/Http/Requests/BtrcClientReportRequest.php`
- `../isp-backend/app/Http/Requests/BtrcResellerReportRequest.php`
- `../isp-backend/app/Http/Requests/NetworkRequest.php`
- `../isp-backend/app/Http/Requests/NewClientReportRequest.php`
- `../isp-backend/app/Http/Requests/NewClientResellerReportRequest.php`
- `../isp-backend/app/Http/Requests/RemoveClientImageRequest.php`
- `../isp-backend/app/Http/Requests/StoreClientRequest.php`
- `../isp-backend/app/Http/Requests/StoreDeviceRequest.php`
- `../isp-backend/app/Http/Requests/StoreTjBoxRequest.php`
- `../isp-backend/app/Http/Requests/StoreZoneRequest.php`
- `../isp-backend/app/Http/Requests/UpdateClientRequest.php`
- `../isp-backend/app/Http/Requests/UpdateClientStatusRequest.php`
- `../isp-backend/app/Http/Requests/UpdateDeviceRequest.php`
- `../isp-backend/app/Http/Requests/UpdateTjBoxRequest.php`
- `../isp-backend/app/Http/Requests/UpdateZoneRequest.php`
- `../isp-backend/app/Http/Requests/UploadClientImageRequest.php`
- `../isp-backend/app/Http/Requests/UploadClientPhotoRequest.php`
- `../isp-backend/app/Http/Resources/ClientAccountResource.php`
- `../isp-backend/app/Http/Resources/ClientCollection.php`
- `../isp-backend/app/Http/Resources/ClientDropdownResource.php`
- `../isp-backend/app/Http/Resources/ClientPaymentResource.php`
- `../isp-backend/app/Http/Resources/ClientProfileResource.php`
- `../isp-backend/app/Http/Resources/ClientResource.php`
- `../isp-backend/app/Http/Resources/DeviceCollection.php`
- `../isp-backend/app/Http/Resources/DeviceMapResource.php`
- `../isp-backend/app/Http/Resources/DeviceResource.php`
- `../isp-backend/app/Http/Resources/NetworkCollection.php`
- `../isp-backend/app/Http/Resources/NetworkResource.php`
- `../isp-backend/app/Http/Resources/TjBoxCollection.php`
- `../isp-backend/app/Http/Resources/TjBoxResource.php`
- `../isp-backend/app/Http/Resources/ZoneCollection.php`
- `../isp-backend/app/Http/Resources/ZoneResource.php`
