# Source evidence — portal-profile

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(client-dashboard)/client/profile/page.tsx`
- `components/client-area/client-account-page.tsx`
- `components/client-area/client-account-type.ts`
- `components/client-area/client-invoice-payment-dialog.tsx`
- `components/client-area/client-profile.tsx`
- `components/client-area/client-sidebar.tsx`
- `components/client-area/client-top-navbar.tsx`
- `components/client-area/home.tsx`
- `components/client-area/login-form.tsx`
- `components/client-area/use-client-invoice-payment.ts`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- `/client-photo`
- `client-account`
- `client-invoice-payment`
- `client-profile`

## Observed form/config field names

- None extracted; inspect page, shared components and dynamic configuration.

## Matching backend route declarations

- GET `/client-invoice-payment` → `client.invoice.payment`; `DashboardController::invoicePayment`; `../isp-backend/routes/client.php:37`
- GET `/client-profile` → `client.profile`; `ClientController::clientProfile`; `../isp-backend/routes/client.php:44`
- GET `/client-account` → `client.account`; `ClientController::account`; `../isp-backend/routes/client.php:45`
- GET `/client-photo` → `client.photo`; `ClientController::photo`; `../isp-backend/routes/client.php:46`
- POST `/client-photo` → `client.photo.upload`; `ClientController::uploadPhoto`; `../isp-backend/routes/client.php:47`
- DELETE `/client-photo` → `client.photo.remove`; `ClientController::removePhoto`; `../isp-backend/routes/client.php:48`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/ClientController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/DashboardController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/ClientController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/DashboardController.php`
- `../isp-backend/app/Http/Requests/AddClientMapRequest.php`
- `../isp-backend/app/Http/Requests/BtrcClientReportRequest.php`
- `../isp-backend/app/Http/Requests/BtrcResellerReportRequest.php`
- `../isp-backend/app/Http/Requests/NewClientReportRequest.php`
- `../isp-backend/app/Http/Requests/NewClientResellerReportRequest.php`
- `../isp-backend/app/Http/Requests/RemoveClientImageRequest.php`
- `../isp-backend/app/Http/Requests/StoreClientRequest.php`
- `../isp-backend/app/Http/Requests/TopDueInvoiceRequest.php`
- `../isp-backend/app/Http/Requests/UpdateClientRequest.php`
- `../isp-backend/app/Http/Requests/UpdateClientStatusRequest.php`
- `../isp-backend/app/Http/Requests/UploadClientImageRequest.php`
- `../isp-backend/app/Http/Requests/UploadClientPhotoRequest.php`
- `../isp-backend/app/Http/Requests/ZoneWiseTopInvoiceDueRequest.php`
- `../isp-backend/app/Http/Resources/ClientAccountResource.php`
- `../isp-backend/app/Http/Resources/ClientCollection.php`
- `../isp-backend/app/Http/Resources/ClientDropdownResource.php`
- `../isp-backend/app/Http/Resources/ClientPaymentResource.php`
- `../isp-backend/app/Http/Resources/ClientProfileResource.php`
- `../isp-backend/app/Http/Resources/ClientResource.php`
- `../isp-backend/app/Http/Resources/DeviceMapResource.php`
- `../isp-backend/app/Http/Resources/TopDueInvoiceResource.php`
- `../isp-backend/app/Http/Resources/ZoneWiseTopInvoiceDueResource.php`
