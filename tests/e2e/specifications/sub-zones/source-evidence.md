# Source evidence — sub-zones

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/sub-zones/page.tsx`
- `components/sub-zones/sub-zone-form-schema.ts`
- `components/sub-zones/sub-zone-form.tsx`
- `components/sub-zones/sub-zone-table.tsx`
- `components/sub-zones/sub-zone-type.ts`
- `components/sub-zones/sub-zones-column.tsx`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- `/dropdown-networks`
- `/dropdown-zones`
- `/sub-zones`
- `sub-zones`

## Observed form/config field names

- `location`
- `name`
- `network_id`
- `note`
- `ports`
- `zone_id`

## Matching backend route declarations

- GET `/sub-zones` → `sub-zones.access`; `SubZoneController::index`; `../isp-backend/routes/api.php:207`
- GET `/sub-zones/{subZone}` → `sub-zones.show`; `SubZoneController::show`; `../isp-backend/routes/api.php:208`
- POST `/sub-zones` → `sub-zones.create`; `SubZoneController::store`; `../isp-backend/routes/api.php:209`
- PUT `/sub-zones/{subZone}` → `sub-zones.edit`; `SubZoneController::update`; `../isp-backend/routes/api.php:210`
- DELETE `/sub-zones/{subZone}` → `sub-zones.delete`; `SubZoneController::destroy`; `../isp-backend/routes/api.php:211`
- GET `/dropdown-networks` → `dropdown.networks`; `NetworksController::dropdownList`; `../isp-backend/routes/api.php:697`
- GET `/dropdown-zones` → `dropdown.zones`; `ZoneController::dropdownList`; `../isp-backend/routes/api.php:699`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/NetworksController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/SubZoneController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ZoneController.php`
- `../isp-backend/app/Http/Requests/NetworkRequest.php`
- `../isp-backend/app/Http/Requests/StoreSubZoneRequest.php`
- `../isp-backend/app/Http/Requests/StoreZoneRequest.php`
- `../isp-backend/app/Http/Requests/UpdateSubZoneRequest.php`
- `../isp-backend/app/Http/Requests/UpdateZoneRequest.php`
- `../isp-backend/app/Http/Resources/NetworkCollection.php`
- `../isp-backend/app/Http/Resources/NetworkResource.php`
- `../isp-backend/app/Http/Resources/SubZoneCollection.php`
- `../isp-backend/app/Http/Resources/SubZoneResource.php`
- `../isp-backend/app/Http/Resources/ZoneCollection.php`
- `../isp-backend/app/Http/Resources/ZoneResource.php`
