# Source evidence — onus

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/onus/page.tsx`
- `components/onu/onu-actions-cell.tsx`
- `components/onu/onu-bind-dialog.tsx`
- `components/onu/onu-column.tsx`
- `components/onu/onu-filter-schema.ts`
- `components/onu/onu-freshness.ts`
- `components/onu/onu-power.ts`
- `components/onu/onu-reboot-dialog.tsx`
- `components/onu/onu-status-badge.tsx`
- `components/onu/onu-table.tsx`
- `components/onu/onu-type.ts`

## Observed permission checks

- `clients.show`
- `olts.show`
- `onus.edit`
- `onus.reboot`

## Observed API templates (not validated endpoints)

- `/dropdown-clients`
- `/dropdown-devices?category=olt`
- `/onus/${onu.id}`
- `/onus/${onu.id}/reboot`
- `onus`

## Observed form/config field names

- `client_id`
- `low_power`
- `olt`
- `search`
- `status`
- `unbound`

## Matching backend route declarations

- GET `/clients` → `clients.access`; `ClientController::index`; `../isp-backend/routes/api.php:215`
- GET `/client-next-sid` → `clients.next-sid`; `ClientController::nextSid`; `../isp-backend/routes/api.php:216`
- GET `/client-maps` → `clients.map`; `ClientController::getClientMaps`; `../isp-backend/routes/api.php:217`
- GET `/clients/{client}` → `clients.show`; `ClientController::show`; `../isp-backend/routes/api.php:218`
- GET `/clients/{client}/sms-status` → `clients.sms-status`; `ClientController::smsStatus`; `../isp-backend/routes/api.php:219`
- POST `/clients` → `clients.create`; `ClientController::store`; `../isp-backend/routes/api.php:220`
- PUT `/clients/{client}` → `clients.edit`; `ClientController::update`; `../isp-backend/routes/api.php:221`
- POST `/clients/{client}/add-client-map` → `clients.map.add`; `ClientController::addClientMap`; `../isp-backend/routes/api.php:222`
- PUT `/client-status/{client}` → `clients.status`; `ClientController::updateClientStatus`; `../isp-backend/routes/api.php:232`
- DELETE `/clients/{client}` → `clients.delete`; `ClientController::destroy`; `../isp-backend/routes/api.php:233`
- GET `/clients/{client}/netactive` → `clients.active`; `ClientController::mikrotikActive`; `../isp-backend/routes/api.php:237`
- GET `/olts` → `olts.access`; `OltController::index`; `../isp-backend/routes/api.php:298`
- GET `/olts/{device}` → `olts.show`; `OltController::show`; `../isp-backend/routes/api.php:299`
- GET `/olts/{device}/clients` → `olts.clients`; `OltController::clients`; `../isp-backend/routes/api.php:300`
- DELETE `/olts/{device}/access` → `olts.access-remove`; `OltAccessController::destroy`; `../isp-backend/routes/api.php:303`
- POST `/olts/{device}/access/test` → `olts.access-test`; `OltAccessController::test`; `../isp-backend/routes/api.php:304`
- POST `/olts/{device}/poll` → `olts.poll`; `OltController::poll`; `../isp-backend/routes/api.php:305`
- GET `/onus` → `onus.access`; `OnuController::index`; `../isp-backend/routes/api.php:306`
- PUT `/onus/{onu}` → `onus.edit`; `OnuController::update`; `../isp-backend/routes/api.php:307`
- PUT `/clients/{client}/lock` → `clients.lock`; `ClientController::lock`; `../isp-backend/routes/api.php:650`
- GET `/clients/{client}/{period?}` → `clients.graph`; `ClientController::clientGraph`; `../isp-backend/routes/api.php:651`
- GET `/client-router-info/{client}` → `clients.router.info`; `ClientController::routerInfo`; `../isp-backend/routes/api.php:652`
- GET `/client-usage/{client}` → `clients.usage`; `ClientController::usage`; `../isp-backend/routes/api.php:653`
- GET `/client-ping/{client}` → `clients.ping`; `ClientController::pingIp`; `../isp-backend/routes/api.php:654`
- GET `/clients-speed/{client}` → `clients.speed`; `ClientController::getClientUpDownSpeed`; `../isp-backend/routes/api.php:655`
- PUT `/clients-change-package/{client}` → `clients.change.package`; `ClientController::changeClientPackage`; `../isp-backend/routes/api.php:656`
- GET `/clients-history/{client}` → `clients.history`; `HistoryController::clientHistory`; `../isp-backend/routes/api.php:657`
- POST `/olts/{device}/access/detect-community` → `olts.access-detect-community`; `OltAccessController::detectCommunity`; `../isp-backend/routes/api.php:696`
- GET `/dropdown-clients` → `dropdown.clients`; `ClientController::dropdownList`; `../isp-backend/routes/api.php:706`
- POST `/auth/client` → `clients.login`; `AuthController::login`; `../isp-backend/routes/client.php:22`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/Auth/AuthController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ClientController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/HistoryController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/OltAccessController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/OltController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/OnuController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/Auth/AuthController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/ClientController.php`
- `../isp-backend/app/Http/Requests/AddClientMapRequest.php`
- `../isp-backend/app/Http/Requests/BtrcClientReportRequest.php`
- `../isp-backend/app/Http/Requests/BtrcResellerReportRequest.php`
- `../isp-backend/app/Http/Requests/ChangePasswordRequest.php`
- `../isp-backend/app/Http/Requests/ChangeUsernameRequest.php`
- `../isp-backend/app/Http/Requests/ClientLoginRequest.php`
- `../isp-backend/app/Http/Requests/LoginRequest.php`
- `../isp-backend/app/Http/Requests/NewClientReportRequest.php`
- `../isp-backend/app/Http/Requests/NewClientResellerReportRequest.php`
- `../isp-backend/app/Http/Requests/OltAccessRequest.php`
- `../isp-backend/app/Http/Requests/RemoveClientImageRequest.php`
- `../isp-backend/app/Http/Requests/SignupRequest.php`
- `../isp-backend/app/Http/Requests/StoreClientRequest.php`
- `../isp-backend/app/Http/Requests/UpdateClientRequest.php`
- `../isp-backend/app/Http/Requests/UpdateClientStatusRequest.php`
- `../isp-backend/app/Http/Requests/UpdateOnuRequest.php`
- `../isp-backend/app/Http/Requests/UploadClientImageRequest.php`
- `../isp-backend/app/Http/Requests/UploadClientPhotoRequest.php`
- `../isp-backend/app/Http/Resources/AuthResource.php`
- `../isp-backend/app/Http/Resources/ClientAccountResource.php`
- `../isp-backend/app/Http/Resources/ClientAuthResource.php`
- `../isp-backend/app/Http/Resources/ClientCollection.php`
- `../isp-backend/app/Http/Resources/ClientDropdownResource.php`
- `../isp-backend/app/Http/Resources/ClientPaymentResource.php`
- `../isp-backend/app/Http/Resources/ClientProfileResource.php`
- `../isp-backend/app/Http/Resources/ClientResource.php`
- `../isp-backend/app/Http/Resources/DeviceMapResource.php`
- `../isp-backend/app/Http/Resources/HistoryCollection.php`
- `../isp-backend/app/Http/Resources/OnuResource.php`
- `../isp-backend/app/Http/Resources/OnuSummaryResource.php`
- `../isp-backend/app/Http/Resources/PaginatedCollection.php`
