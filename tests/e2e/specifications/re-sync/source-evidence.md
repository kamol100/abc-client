# Source evidence — re-sync

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/re-sync/page.tsx`
- `components/re-sync/re-sync-column.tsx`
- `components/re-sync/re-sync-filter-schema.ts`
- `components/re-sync/re-sync-form-schema.ts`
- `components/re-sync/re-sync-form.tsx`
- `components/re-sync/re-sync-table.tsx`
- `components/re-sync/re-sync-type.ts`

## Observed permission checks

- `client-sync.all-sync`
- `client-sync.delete`
- `client-sync.individual-sync`
- `client-sync.load`

## Observed API templates (not validated endpoints)

- `/client-individual-sync/${syncId}`
- `/dropdown-networks`
- `client-sync`

## Observed form/config field names

- `app_profile`
- `client`
- `client_in_app`
- `client_status_mikrotik`
- `mikrotik_match`
- `mikrotik_profile`
- `network_id`

## Matching backend route declarations

- GET `/client-sync` → `client-sync.access`; `ClientSyncController::index`; `../isp-backend/routes/api.php:527`
- POST `/client-sync` → `client-sync.load`; `ClientSyncController::load`; `../isp-backend/routes/api.php:528`
- PUT `/client-individual-sync/{uuid}` → `client-sync.individual-sync`; `ClientSyncController::individualSync`; `../isp-backend/routes/api.php:529`
- POST `/client-all-sync` → `client-sync.all-sync`; `ClientSyncController::allSync`; `../isp-backend/routes/api.php:530`
- DELETE `/client-sync/{uuid}` → `client-sync.delete`; `ClientSyncController::destroy`; `../isp-backend/routes/api.php:531`
- GET `/dropdown-networks` → `dropdown.networks`; `NetworksController::dropdownList`; `../isp-backend/routes/api.php:697`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/ClientSyncController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/NetworksController.php`
- `../isp-backend/app/Http/Requests/NetworkRequest.php`
- `../isp-backend/app/Http/Resources/ClientSyncCollection.php`
- `../isp-backend/app/Http/Resources/NetworkCollection.php`
- `../isp-backend/app/Http/Resources/NetworkResource.php`
