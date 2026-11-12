# Source evidence — payments

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/payments/page.tsx`
- `components/payments/payment-column.tsx`
- `components/payments/payment-filter-schema.ts`
- `components/payments/payment-table.tsx`
- `components/payments/payment-type.ts`

## Observed permission checks

- `clients.show`

## Observed API templates (not validated endpoints)

- `/dropdown-clients`
- `/dropdown-funds`
- `/dropdown-staffs`
- `/dropdown-zones`
- `payments`

## Observed form/config field names

- `client_id`
- `fund_id`
- `payment_date`
- `staff_id`
- `track_id`
- `zone_id`

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
- GET `/payments` → `payments.access`; `PaymentsController::index`; `../isp-backend/routes/api.php:312`
- GET `/payments/{payment}` → `payments.show`; `PaymentsController::show`; `../isp-backend/routes/api.php:313`
- POST `/payments` → `payments.create`; `PaymentsController::store`; `../isp-backend/routes/api.php:314`
- PUT `/payments/{payment}` → `payments.edit`; `PaymentsController::update`; `../isp-backend/routes/api.php:315`
- DELETE `/payments/{payment}` → `payments.delete`; `PaymentsController::destroy`; `../isp-backend/routes/api.php:316`
- PUT `/clients/{client}/lock` → `clients.lock`; `ClientController::lock`; `../isp-backend/routes/api.php:650`
- GET `/clients/{client}/{period?}` → `clients.graph`; `ClientController::clientGraph`; `../isp-backend/routes/api.php:651`
- GET `/client-router-info/{client}` → `clients.router.info`; `ClientController::routerInfo`; `../isp-backend/routes/api.php:652`
- GET `/client-usage/{client}` → `clients.usage`; `ClientController::usage`; `../isp-backend/routes/api.php:653`
- GET `/client-ping/{client}` → `clients.ping`; `ClientController::pingIp`; `../isp-backend/routes/api.php:654`
- GET `/clients-speed/{client}` → `clients.speed`; `ClientController::getClientUpDownSpeed`; `../isp-backend/routes/api.php:655`
- PUT `/clients-change-package/{client}` → `clients.change.package`; `ClientController::changeClientPackage`; `../isp-backend/routes/api.php:656`
- GET `/clients-history/{client}` → `clients.history`; `HistoryController::clientHistory`; `../isp-backend/routes/api.php:657`
- GET `/dropdown-zones` → `dropdown.zones`; `ZoneController::dropdownList`; `../isp-backend/routes/api.php:699`
- GET `/dropdown-funds` → `dropdown.funds`; `FundController::dropdownList`; `../isp-backend/routes/api.php:704`
- GET `/dropdown-clients` → `dropdown.clients`; `ClientController::dropdownList`; `../isp-backend/routes/api.php:706`
- GET `/dropdown-staffs` → `dropdown.staffs`; `StaffController::dropdownList`; `../isp-backend/routes/api.php:707`
- POST `/auth/client` → `clients.login`; `AuthController::login`; `../isp-backend/routes/client.php:22`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/Auth/AuthController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ClientController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/FundController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/HistoryController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/PaymentsController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/StaffController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ZoneController.php`
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
- `../isp-backend/app/Http/Requests/RemoveClientImageRequest.php`
- `../isp-backend/app/Http/Requests/RemoveStaffImageRequest.php`
- `../isp-backend/app/Http/Requests/ResetStaffPasswordRequest.php`
- `../isp-backend/app/Http/Requests/SignupRequest.php`
- `../isp-backend/app/Http/Requests/StoreClientRequest.php`
- `../isp-backend/app/Http/Requests/StoreFundRequest.php`
- `../isp-backend/app/Http/Requests/StorePaymentRequest.php`
- `../isp-backend/app/Http/Requests/StoreStaffRequest.php`
- `../isp-backend/app/Http/Requests/StoreZoneRequest.php`
- `../isp-backend/app/Http/Requests/UpdateClientRequest.php`
- `../isp-backend/app/Http/Requests/UpdateClientStatusRequest.php`
- `../isp-backend/app/Http/Requests/UpdateFundRequest.php`
- `../isp-backend/app/Http/Requests/UpdatePaymentRequest.php`
- `../isp-backend/app/Http/Requests/UpdateStaffRequest.php`
- `../isp-backend/app/Http/Requests/UpdateStaffStatusRequest.php`
- `../isp-backend/app/Http/Requests/UpdateZoneRequest.php`
- `../isp-backend/app/Http/Requests/UploadClientImageRequest.php`
- `../isp-backend/app/Http/Requests/UploadClientPhotoRequest.php`
- `../isp-backend/app/Http/Requests/UploadStaffImageRequest.php`
- `../isp-backend/app/Http/Resources/AuthResource.php`
- `../isp-backend/app/Http/Resources/ClientAccountResource.php`
- `../isp-backend/app/Http/Resources/ClientAuthResource.php`
- `../isp-backend/app/Http/Resources/ClientCollection.php`
- `../isp-backend/app/Http/Resources/ClientDropdownResource.php`
- `../isp-backend/app/Http/Resources/ClientPaymentResource.php`
- `../isp-backend/app/Http/Resources/ClientProfileResource.php`
- `../isp-backend/app/Http/Resources/ClientResource.php`
- `../isp-backend/app/Http/Resources/DeviceMapResource.php`
- `../isp-backend/app/Http/Resources/FundCollection.php`
- `../isp-backend/app/Http/Resources/FundResource.php`
- `../isp-backend/app/Http/Resources/HistoryCollection.php`
- `../isp-backend/app/Http/Resources/PaymentCollection.php`
- `../isp-backend/app/Http/Resources/PaymentResource.php`
- `../isp-backend/app/Http/Resources/StaffCollection.php`
- `../isp-backend/app/Http/Resources/StaffResource.php`
- `../isp-backend/app/Http/Resources/ZoneCollection.php`
- `../isp-backend/app/Http/Resources/ZoneResource.php`
