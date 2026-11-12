# Source evidence — import-client

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/import-client/import/[id]/page.tsx`
- `app/(dashboard)/import-client/page.tsx`
- `components/import-client/import-client-bulk-dialog.tsx`
- `components/import-client/import-client-column.tsx`
- `components/import-client/import-client-filter-schema.ts`
- `components/import-client/import-client-form-schema.ts`
- `components/import-client/import-client-form.tsx`
- `components/import-client/import-client-sync-form.tsx`
- `components/import-client/import-client-table.tsx`
- `components/import-client/import-client-type.ts`

## Observed permission checks

- `sync-clients.delete`
- `sync-clients.import`
- `sync-clients.show`
- `sync-clients.sync`

## Observed API templates (not validated endpoints)

- `/dropdown-networks`
- `/dropdown-resellers`
- `/mikrotik-sync`
- `/sync-client/${id}`
- `/sync-client/${syncClient.id}`
- `/sync-clients/bulk-import`
- `sync-clients`

## Observed form/config field names

- `disabled`
- `import_as`
- `mikrotik_profile`
- `name`
- `password`
- `profile`
- `reseller_id`
- `service`
- `syncd_status`

## Matching backend route declarations

- GET `/sync-clients` → `sync-clients.access`; `SyncClientController::index`; `../isp-backend/routes/api.php:519`
- POST `/sync-clients/bulk-import` → `sync-clients.bulk-import`; `SyncClientController::bulkImport`; `../isp-backend/routes/api.php:520`
- POST `/mikrotik-sync` → `sync-clients.sync`; `SyncClientController::mikrotikSync`; `../isp-backend/routes/api.php:521`
- GET `/sync-client/{syncClient}` → `sync-clients.show`; `SyncClientController::show`; `../isp-backend/routes/api.php:522`
- POST `/sync-client/{syncClient}` → `sync-clients.import`; `SyncClientController::import`; `../isp-backend/routes/api.php:523`
- DELETE `/sync-client/{syncClient}` → `sync-clients.delete`; `SyncClientController::destroy`; `../isp-backend/routes/api.php:524`
- GET `/mikrotik-sync` → `mikrotik-sync.access`; `MikrotikSyncController::index`; `../isp-backend/routes/api.php:534`
- POST `/mikrotik-sync/load` → `mikrotik-sync.load`; `MikrotikSyncController::load`; `../isp-backend/routes/api.php:535`
- POST `/mikrotik-sync/resolve-all` → `mikrotik-sync.all-sync`; `MikrotikSyncController::resolveAll`; `../isp-backend/routes/api.php:536`
- POST `/mikrotik-sync/bulk-import` → `mikrotik-sync.bulk-import`; `MikrotikSyncController::bulkImport`; `../isp-backend/routes/api.php:537`
- GET `/mikrotik-sync/{mikrotikSync}` → `mikrotik-sync.show`; `MikrotikSyncController::show`; `../isp-backend/routes/api.php:538`
- PUT `/mikrotik-sync/{mikrotikSync}/resolve` → `mikrotik-sync.individual-sync`; `MikrotikSyncController::resolveOne`; `../isp-backend/routes/api.php:539`
- POST `/mikrotik-sync/{mikrotikSync}/import` → `mikrotik-sync.import`; `MikrotikSyncController::import`; `../isp-backend/routes/api.php:540`
- DELETE `/mikrotik-sync/{mikrotikSync}` → `mikrotik-sync.delete`; `MikrotikSyncController::destroy`; `../isp-backend/routes/api.php:541`
- GET `/dropdown-networks` → `dropdown.networks`; `NetworksController::dropdownList`; `../isp-backend/routes/api.php:697`
- GET `/dropdown-resellers/{id?}` → `dropdown.resellers`; `ResellerController::dropdownList`; `../isp-backend/routes/api.php:698`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/MikrotikSyncController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/NetworksController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ResellerController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/SyncClientController.php`
- `../isp-backend/app/Http/Requests/BulkImportMikrotikSyncRequest.php`
- `../isp-backend/app/Http/Requests/BulkImportSyncClientRequest.php`
- `../isp-backend/app/Http/Requests/ImportMikrotikSyncRequest.php`
- `../isp-backend/app/Http/Requests/ImportResellerExportRequest.php`
- `../isp-backend/app/Http/Requests/LoadMikrotikSyncRequest.php`
- `../isp-backend/app/Http/Requests/NetworkRequest.php`
- `../isp-backend/app/Http/Requests/RemoveResellerImageRequest.php`
- `../isp-backend/app/Http/Requests/ResolveMikrotikSyncRequest.php`
- `../isp-backend/app/Http/Requests/StoreResellerRequest.php`
- `../isp-backend/app/Http/Requests/UpdateResellerRequest.php`
- `../isp-backend/app/Http/Requests/UpdateSyncClientRequest.php`
- `../isp-backend/app/Http/Requests/UploadResellerImageRequest.php`
- `../isp-backend/app/Http/Resources/ClientCollection.php`
- `../isp-backend/app/Http/Resources/MikrotikSyncCollection.php`
- `../isp-backend/app/Http/Resources/MikrotikSyncResource.php`
- `../isp-backend/app/Http/Resources/NetworkCollection.php`
- `../isp-backend/app/Http/Resources/NetworkResource.php`
- `../isp-backend/app/Http/Resources/PackagesResource.php`
- `../isp-backend/app/Http/Resources/ResellerCollection.php`
- `../isp-backend/app/Http/Resources/ResellerCompanyResource.php`
- `../isp-backend/app/Http/Resources/ResellerResource.php`
- `../isp-backend/app/Http/Resources/SyncClientCollection.php`
- `../isp-backend/app/Http/Resources/SyncClientResource.php`
