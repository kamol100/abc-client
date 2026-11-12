# Source evidence — zones

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/zones/page.tsx`
- `components/zones/zone-form-schema.ts`
- `components/zones/zone-form.tsx`
- `components/zones/zone-table.tsx`
- `components/zones/zone-type.ts`
- `components/zones/zones-column.tsx`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- `/zones`
- `zones`

## Observed form/config field names

- `lat`
- `lon`
- `name`

## Matching backend route declarations

- GET `/zones` → `zones.access`; `ZoneController::index`; `../isp-backend/routes/api.php:200`
- GET `/zones/{zone}` → `zones.show`; `ZoneController::show`; `../isp-backend/routes/api.php:201`
- POST `/zones` → `zones.create`; `ZoneController::store`; `../isp-backend/routes/api.php:202`
- PUT `/zones/{zone}` → `zones.edit`; `ZoneController::update`; `../isp-backend/routes/api.php:203`
- DELETE `/zones/{zone}` → `zones.delete`; `ZoneController::destroy`; `../isp-backend/routes/api.php:204`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/ZoneController.php`
- `../isp-backend/app/Http/Requests/StoreZoneRequest.php`
- `../isp-backend/app/Http/Requests/UpdateZoneRequest.php`
- `../isp-backend/app/Http/Resources/ZoneCollection.php`
- `../isp-backend/app/Http/Resources/ZoneResource.php`
