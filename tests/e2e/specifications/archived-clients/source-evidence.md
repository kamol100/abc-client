# Source evidence — archived-clients

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/archived-clients/page.tsx`
- `components/archived-clients/archived-client-column.tsx`
- `components/archived-clients/archived-client-table.tsx`
- `components/archived-clients/archived-client-type.ts`

## Observed permission checks

- `archived-clients.delete`
- `archived-clients.restore`

## Observed API templates (not validated endpoints)

- `/archived-clients/${clientId}`
- `/archived-clients/${clientId}/restore`
- `/dropdown-resellers/company`
- `archived-clients`
- `dropdown-resellers/company`

## Observed form/config field names

- `mode`
- `reseller_id`

## Matching backend route declarations

- GET `/archived-clients` → `archived-clients.access`; `ArchivedClientController::index`; `../isp-backend/routes/api.php:234`
- POST `/archived-clients/{uuid}/restore` → `archived-clients.restore`; `ArchivedClientController::restore`; `../isp-backend/routes/api.php:235`
- DELETE `/archived-clients/{uuid}` → `archived-clients.delete`; `ArchivedClientController::destroy`; `../isp-backend/routes/api.php:236`
- GET `/dropdown-resellers/{id?}` → `dropdown.resellers`; `ResellerController::dropdownList`; `../isp-backend/routes/api.php:698`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/ArchivedClientController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ResellerController.php`
- `../isp-backend/app/Http/Requests/ImportResellerExportRequest.php`
- `../isp-backend/app/Http/Requests/RemoveResellerImageRequest.php`
- `../isp-backend/app/Http/Requests/RestoreArchivedClientRequest.php`
- `../isp-backend/app/Http/Requests/StoreResellerRequest.php`
- `../isp-backend/app/Http/Requests/UpdateResellerRequest.php`
- `../isp-backend/app/Http/Requests/UploadResellerImageRequest.php`
- `../isp-backend/app/Http/Resources/ClientCollection.php`
- `../isp-backend/app/Http/Resources/PackagesResource.php`
- `../isp-backend/app/Http/Resources/ResellerCollection.php`
- `../isp-backend/app/Http/Resources/ResellerCompanyResource.php`
- `../isp-backend/app/Http/Resources/ResellerResource.php`
