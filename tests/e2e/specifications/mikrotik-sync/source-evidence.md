# Source evidence — mikrotik-sync

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/mikrotik-sync/import/[id]/page.tsx`
- `app/(dashboard)/mikrotik-sync/page.tsx`
- `components/mikrotik-sync/mikrotik-sync-bulk-dialog.tsx`
- `components/mikrotik-sync/mikrotik-sync-column.tsx`
- `components/mikrotik-sync/mikrotik-sync-filter-schema.ts`
- `components/mikrotik-sync/mikrotik-sync-form-schema.ts`
- `components/mikrotik-sync/mikrotik-sync-form.tsx`
- `components/mikrotik-sync/mikrotik-sync-import-error.tsx`
- `components/mikrotik-sync/mikrotik-sync-import-form.tsx`
- `components/mikrotik-sync/mikrotik-sync-table.tsx`
- `components/mikrotik-sync/mikrotik-sync-type.ts`

## Observed permission checks

- `mikrotik-sync.all-sync`
- `mikrotik-sync.bulk-import`
- `mikrotik-sync.delete`
- `mikrotik-sync.import`
- `mikrotik-sync.individual-sync`
- `mikrotik-sync.load`
- `mikrotik-sync.show`

## Observed API templates (not validated endpoints)

- `/dropdown-networks`
- `/dropdown-resellers`
- `/dropdown-resellers/company`
- `/mikrotik-sync/${id}`
- `/mikrotik-sync/${row.id}/import`
- `/mikrotik-sync/${syncId}/resolve`
- `/mikrotik-sync/bulk-import`
- `mikrotik-sync`

## Observed form/config field names

- `any`
- `client`
- `client_status_mikrotik`
- `disabled`
- `import_as`
- `mikrotik_match`
- `mikrotik_profile`
- `network_id`
- `reseller_id`
- `syncd_status`

## Matching backend route declarations

- POST `/mikrotik-sync` → `sync-clients.sync`; `SyncClientController::mikrotikSync`; `../isp-backend/routes/api.php:521`
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
