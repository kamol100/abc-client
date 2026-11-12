# Source evidence — unit-types

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/unit-types/page.tsx`
- `components/unit-type/unit-type-column.tsx`
- `components/unit-type/unit-type-form-schema.ts`
- `components/unit-type/unit-type-form.tsx`
- `components/unit-type/unit-type-table.tsx`
- `components/unit-type/unit-type-type.ts`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- `/unit-types`
- `unit-types`

## Observed form/config field names

- `name`

## Matching backend route declarations

- GET `/unit-types` → `unit-types.access`; `UnitTypeController::index`; `../isp-backend/routes/api.php:379`
- POST `/unit-types` → `unit-types.create`; `UnitTypeController::store`; `../isp-backend/routes/api.php:380`
- GET `/unit-types/{unitType}` → `unit-types.show`; `UnitTypeController::show`; `../isp-backend/routes/api.php:381`
- PUT `/unit-types/{unitType}` → `unit-types.edit`; `UnitTypeController::update`; `../isp-backend/routes/api.php:382`
- DELETE `/unit-types/{unitType}` → `unit-types.delete`; `UnitTypeController::destroy`; `../isp-backend/routes/api.php:383`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/UnitTypeController.php`
- `../isp-backend/app/Http/Requests/StoreUnitTypeRequest.php`
- `../isp-backend/app/Http/Requests/UpdateUnitTypeRequest.php`
- `../isp-backend/app/Http/Resources/UnitTypeCollection.php`
- `../isp-backend/app/Http/Resources/UnitTypeResource.php`
