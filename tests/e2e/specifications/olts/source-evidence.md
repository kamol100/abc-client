# Source evidence — olts

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/olts/page.tsx`
- `app/(dashboard)/olts/view/[id]/monitoring/page.tsx`
- `app/(dashboard)/olts/view/[id]/page.tsx`
- `components/olt/olt-access-alert.tsx`
- `components/olt/olt-access-community-field.tsx`
- `components/olt/olt-access-form-schema.ts`
- `components/olt/olt-access.tsx`
- `components/olt/olt-attention.tsx`
- `components/olt/olt-checks-table.tsx`
- `components/olt/olt-clients-table.tsx`
- `components/olt/olt-column.tsx`
- `components/olt/olt-monitoring.tsx`
- `components/olt/olt-poll-button.tsx`
- `components/olt/olt-poll.ts`
- `components/olt/olt-table.tsx`
- `components/olt/olt-test-offer.tsx`
- `components/olt/olt-test-result-view.tsx`
- `components/olt/olt-test-result.ts`
- `components/olt/olt-type.ts`
- `components/olt/olt-view.tsx`
- `components/olt/use-olt-access-test.ts`

## Observed permission checks

- `clients.show`
- `company-settings.access`
- `devices.monitoring`
- `olts.access-remove`
- `olts.access-settings`
- `olts.access-test`
- `olts.clients`
- `olts.poll`
- `olts.show`
- `onus.access`
- `tickets.create`

## Observed API templates (not validated endpoints)

- `/olts/${oltId}/access`
- `/olts/${oltId}/access/detect-community`
- `/olts/${oltId}/access/test`
- `/olts/${oltId}/poll`
- `devices/${deviceId}/checks`
- `devices/${deviceId}/monitoring`
- `olts`
- `olts/${oltId}`
- `olts/${oltId}/clients`

## Observed form/config field names

- `cli_enable_password`
- `cli_password`
- `cli_protocol`
- `cli_username`
- `reset_host_key`
- `search`
- `snmp_community`
- `snmp_v3_auth_pass`
- `snmp_v3_auth_protocol`
- `snmp_v3_priv_pass`
- `snmp_v3_priv_protocol`
- `snmp_v3_user`
- `snmp_version`

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
- GET `/onus` → `onus.access`; `OnuController::index`; `../isp-backend/routes/api.php:306`
- PUT `/onus/{onu}` → `onus.edit`; `OnuController::update`; `../isp-backend/routes/api.php:307`
- GET `/company/settings` → `company-settings.access`; `CompanyController::getSettings`; `../isp-backend/routes/api.php:546`
- POST `/company/settings` → `company-settings.edit`; `CompanyController::updateSettings`; `../isp-backend/routes/api.php:547`
- GET `/tickets` → `tickets.access`; `TicketController::index`; `../isp-backend/routes/api.php:554`
- POST `/tickets` → `tickets.create`; `TicketController::store`; `../isp-backend/routes/api.php:555`
- GET `/tickets/{ticket}` → `tickets.show`; `TicketController::show`; `../isp-backend/routes/api.php:556`
- PUT `/tickets/{ticket}` → `tickets.edit`; `TicketController::update`; `../isp-backend/routes/api.php:557`
- PUT `/ticket-status/{ticket}` → `tickets.status.update`; `TicketController::updateStatus`; `../isp-backend/routes/api.php:558`
- PUT `/ticket-assignee/{ticket}` → `tickets.assignee.update`; `TicketController::updateAssignee`; `../isp-backend/routes/api.php:559`
- DELETE `/tickets/{ticket}` → `tickets.delete`; `TicketController::destroy`; `../isp-backend/routes/api.php:560`
- POST `/tickets/{ticket}/messages` → `tickets.reply`; `TicketController::storeMessage`; `../isp-backend/routes/api.php:628`
- GET `tickets/{ticket}/messages` → `tickets.messages`; `TicketController::getMessages`; `../isp-backend/routes/api.php:629`
- PUT `/clients/{client}/lock` → `clients.lock`; `ClientController::lock`; `../isp-backend/routes/api.php:650`
- GET `/clients/{client}/{period?}` → `clients.graph`; `ClientController::clientGraph`; `../isp-backend/routes/api.php:651`
- GET `/client-router-info/{client}` → `clients.router.info`; `ClientController::routerInfo`; `../isp-backend/routes/api.php:652`
- GET `/client-usage/{client}` → `clients.usage`; `ClientController::usage`; `../isp-backend/routes/api.php:653`
- GET `/client-ping/{client}` → `clients.ping`; `ClientController::pingIp`; `../isp-backend/routes/api.php:654`
- GET `/clients-speed/{client}` → `clients.speed`; `ClientController::getClientUpDownSpeed`; `../isp-backend/routes/api.php:655`
- PUT `/clients-change-package/{client}` → `clients.change.package`; `ClientController::changeClientPackage`; `../isp-backend/routes/api.php:656`
- GET `/clients-history/{client}` → `clients.history`; `HistoryController::clientHistory`; `../isp-backend/routes/api.php:657`
- POST `/olts/{device}/access/detect-community` → `olts.access-detect-community`; `OltAccessController::detectCommunity`; `../isp-backend/routes/api.php:696`
- POST `/auth/client` → `clients.login`; `AuthController::login`; `../isp-backend/routes/client.php:22`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/CompanyController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/Auth/AuthController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ClientController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/DeviceController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/DeviceMonitoringController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/HistoryController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/OltAccessController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/OltController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/OnuController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/TicketController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/Auth/AuthController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/ClientController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/CompanyController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/TicketController.php`
- `../isp-backend/app/Http/Requests/AddClientMapRequest.php`
- `../isp-backend/app/Http/Requests/BtrcClientReportRequest.php`
- `../isp-backend/app/Http/Requests/BtrcResellerReportRequest.php`
- `../isp-backend/app/Http/Requests/ChangePasswordRequest.php`
- `../isp-backend/app/Http/Requests/ChangeUsernameRequest.php`
- `../isp-backend/app/Http/Requests/ClientLoginRequest.php`
- `../isp-backend/app/Http/Requests/ImportCompanyExportRequest.php`
- `../isp-backend/app/Http/Requests/LoginRequest.php`
- `../isp-backend/app/Http/Requests/NewClientReportRequest.php`
- `../isp-backend/app/Http/Requests/NewClientResellerReportRequest.php`
- `../isp-backend/app/Http/Requests/OltAccessRequest.php`
- `../isp-backend/app/Http/Requests/RemoveClientImageRequest.php`
- `../isp-backend/app/Http/Requests/SignupRequest.php`
- `../isp-backend/app/Http/Requests/StoreClientRequest.php`
- `../isp-backend/app/Http/Requests/StoreCompanyRequest.php`
- `../isp-backend/app/Http/Requests/StoreDeviceRequest.php`
- `../isp-backend/app/Http/Requests/StoreTicketRequest.php`
- `../isp-backend/app/Http/Requests/UpdateClientRequest.php`
- `../isp-backend/app/Http/Requests/UpdateClientStatusRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanyProfileRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanyRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanySettingsRequest.php`
- `../isp-backend/app/Http/Requests/UpdateDeviceRequest.php`
- `../isp-backend/app/Http/Requests/UpdateOnuRequest.php`
- `../isp-backend/app/Http/Requests/UpdateTicketAssigneeRequest.php`
- `../isp-backend/app/Http/Requests/UpdateTicketRequest.php`
- `../isp-backend/app/Http/Requests/UpdateTicketStatusRequest.php`
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
- `../isp-backend/app/Http/Resources/CompanyCollection.php`
- `../isp-backend/app/Http/Resources/CompanyPublicResource.php`
- `../isp-backend/app/Http/Resources/CompanyResource.php`
- `../isp-backend/app/Http/Resources/DeviceCollection.php`
- `../isp-backend/app/Http/Resources/DeviceMapResource.php`
- `../isp-backend/app/Http/Resources/DeviceResource.php`
- `../isp-backend/app/Http/Resources/HistoryCollection.php`
- `../isp-backend/app/Http/Resources/OnuResource.php`
- `../isp-backend/app/Http/Resources/OnuSummaryResource.php`
- `../isp-backend/app/Http/Resources/PaginatedCollection.php`
- `../isp-backend/app/Http/Resources/TicketCollection.php`
- `../isp-backend/app/Http/Resources/TicketMessageResource.php`
- `../isp-backend/app/Http/Resources/TicketResource.php`
