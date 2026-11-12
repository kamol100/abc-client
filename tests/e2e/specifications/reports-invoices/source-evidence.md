# Source evidence — reports-invoices

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/reports/invoices/page.tsx`
- `components/invoices/amount-in-words.ts`
- `components/invoices/bulk-invoice-pay-dialog.tsx`
- `components/invoices/client-invoice-columns.tsx`
- `components/invoices/client-invoice-filter-schema.ts`
- `components/invoices/client-invoice-params.ts`
- `components/invoices/client-invoice-table.tsx`
- `components/invoices/invoice-column.tsx`
- `components/invoices/invoice-discount-dialog.tsx`
- `components/invoices/invoice-filter-schema.ts`
- `components/invoices/invoice-form-schema.ts`
- `components/invoices/invoice-form.tsx`
- `components/invoices/invoice-lines-editor.tsx`
- `components/invoices/invoice-pay-dialog.tsx`
- `components/invoices/invoice-print-config.ts`
- `components/invoices/invoice-print-dialog.tsx`
- `components/invoices/invoice-receipt.tsx`
- `components/invoices/invoice-reports.tsx`
- `components/invoices/invoice-row-actions.tsx`
- `components/invoices/invoice-table.tsx`
- `components/invoices/invoice-totals.tsx`
- `components/invoices/invoice-type.ts`
- `components/invoices/invoice-view-dialog.tsx`
- `components/invoices/invoice-view-document.tsx`
- `components/invoices/invoice-view-model.ts`
- `components/invoices/lazy-bulk-invoice-pay-dialog.tsx`
- `components/invoices/payment-fund-access.ts`

## Observed permission checks

- `clients.show`
- `invoices.apply-discount`
- `invoices.change-payment-date`
- `invoices.create`
- `invoices.delete`
- `invoices.edit`
- `invoices.pay`
- `invoices.show`

## Observed API templates (not validated endpoints)

- `/dropdown-clients`
- `/dropdown-funds`
- `/dropdown-invoice-types`
- `/dropdown-staffs`
- `/dropdown-zones`
- `/invoice-due/${invoice?.id}`
- `/invoices`
- `/invoices/${invoiceId}`
- `invoice-discount/${invoice.uuid}`
- `invoices`
- `invoices/${invoiceId}`
- `invoices/${invoiceKey}`
- `invoices/bulk-pay`
- `invoices/pay/${invoiceId}`

## Observed form/config field names

- `client_id`
- `confirmation_sms`
- `create_by`
- `create_date`
- `discount`
- `due_date`
- `fund_id`
- `invoice_type_id`
- `lines`
- `note`
- `partial_amount`
- `payment_date`
- `status`
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
- GET `/invoices` → `invoices.access`; `InvoicesController::index`; `../isp-backend/routes/api.php:265`
- GET `/invoices/{invoices}` → `invoices.show`; `InvoicesController::show`; `../isp-backend/routes/api.php:266`
- POST `/invoices/bulk-pay` → `invoices.pay`; `InvoicesController::bulkPay`; `../isp-backend/routes/api.php:267`
- POST `/invoices` → `invoices.create`; `InvoicesController::store`; `../isp-backend/routes/api.php:268`
- PUT `/invoices/{invoices}` → `invoices.edit`; `InvoicesController::update`; `../isp-backend/routes/api.php:269`
- DELETE `/invoices/{invoices}` → `invoices.delete`; `InvoicesController::destroy`; `../isp-backend/routes/api.php:271`
- GET `/invoice-type` → `invoices.type`; `InvoicesController::invoiceType`; `../isp-backend/routes/api.php:630`
- GET `/invoice-due/{invoice_uuid}` → `invoices.due`; `InvoiceDueController::invoiceDue`; `../isp-backend/routes/api.php:631`
- PUT `/invoice-discount/{invoice}` → `invoices.discount.update`; `InvoicesController::updateDiscount`; `../isp-backend/routes/api.php:632`
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
- GET `/dropdown-invoice-types` → `dropdown.invoice.types`; `InvoiceTypeController::dropdownList`; `../isp-backend/routes/api.php:713`
- POST `/auth/client` → `clients.login`; `AuthController::login`; `../isp-backend/routes/client.php:22`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/Auth/AuthController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ClientController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/FundController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/HistoryController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/InvoiceDueController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/InvoiceTypeController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/InvoicesController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/StaffController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ZoneController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/Auth/AuthController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/ClientController.php`
- `../isp-backend/app/Http/Requests/AddClientMapRequest.php`
- `../isp-backend/app/Http/Requests/BtrcClientReportRequest.php`
- `../isp-backend/app/Http/Requests/BtrcResellerReportRequest.php`
- `../isp-backend/app/Http/Requests/BulkInvoicePayRequest.php`
- `../isp-backend/app/Http/Requests/ChangePasswordRequest.php`
- `../isp-backend/app/Http/Requests/ChangeUsernameRequest.php`
- `../isp-backend/app/Http/Requests/ClientLoginRequest.php`
- `../isp-backend/app/Http/Requests/InvoicePayRequest.php`
- `../isp-backend/app/Http/Requests/InvoiceTypeRequest.php`
- `../isp-backend/app/Http/Requests/LoginRequest.php`
- `../isp-backend/app/Http/Requests/NewClientReportRequest.php`
- `../isp-backend/app/Http/Requests/NewClientResellerReportRequest.php`
- `../isp-backend/app/Http/Requests/RemoveClientImageRequest.php`
- `../isp-backend/app/Http/Requests/RemoveStaffImageRequest.php`
- `../isp-backend/app/Http/Requests/ResetStaffPasswordRequest.php`
- `../isp-backend/app/Http/Requests/SignupRequest.php`
- `../isp-backend/app/Http/Requests/StoreClientRequest.php`
- `../isp-backend/app/Http/Requests/StoreFundRequest.php`
- `../isp-backend/app/Http/Requests/StoreInvoicesRequest.php`
- `../isp-backend/app/Http/Requests/StoreStaffRequest.php`
- `../isp-backend/app/Http/Requests/StoreZoneRequest.php`
- `../isp-backend/app/Http/Requests/UpdateClientRequest.php`
- `../isp-backend/app/Http/Requests/UpdateClientStatusRequest.php`
- `../isp-backend/app/Http/Requests/UpdateFundRequest.php`
- `../isp-backend/app/Http/Requests/UpdateInvoicesRequest.php`
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
- `../isp-backend/app/Http/Resources/InvoiceCollection.php`
- `../isp-backend/app/Http/Resources/InvoiceResource.php`
- `../isp-backend/app/Http/Resources/InvoiceTypeCollection.php`
- `../isp-backend/app/Http/Resources/InvoiceTypeResource.php`
- `../isp-backend/app/Http/Resources/StaffCollection.php`
- `../isp-backend/app/Http/Resources/StaffResource.php`
- `../isp-backend/app/Http/Resources/ZoneCollection.php`
- `../isp-backend/app/Http/Resources/ZoneResource.php`
