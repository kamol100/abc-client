# Source evidence — communication-gateways

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/communication-gateways/page.tsx`
- `components/communication-gateways/communication-gateway-column.tsx`
- `components/communication-gateways/communication-gateway-form-schema.ts`
- `components/communication-gateways/communication-gateway-form.tsx`
- `components/communication-gateways/communication-gateway-table.tsx`
- `components/communication-gateways/communication-gateway-type.ts`

## Observed permission checks

- `communication-gateways.create`
- `communication-gateways.delete`
- `communication-gateways.show`

## Observed API templates (not validated endpoints)

- `/dropdown-companies`
- `/dropdown-resellers`
- `communication-gateways`

## Observed form/config field names

- `access_type`
- `api`
- `api_host`
- `api_key`
- `api_password`
- `api_port`
- `api_secret`
- `api_token`
- `api_username`
- `balance_api`
- `campaign_id`
- `communication_gateway.sections.admin`
- `communication_gateway.sections.basic`
- `communication_gateway.sections.credentials`
- `company_id`
- `name`
- `note`
- `rates_per_unit`
- `reseller_id`
- `status`
- `type`

## Matching backend route declarations

- GET `/communication-gateways` → `communication-gateways.access`; `CommunicationGatewayController::index`; `../isp-backend/routes/api.php:403`
- POST `/communication-gateways` → `communication-gateways.create`; `CommunicationGatewayController::store`; `../isp-backend/routes/api.php:404`
- GET `/communication-gateways/{communicationGateway}` → `communication-gateways.show`; `CommunicationGatewayController::show`; `../isp-backend/routes/api.php:405`
- PUT `/communication-gateways/{communicationGateway}` → `communication-gateways.edit`; `CommunicationGatewayController::update`; `../isp-backend/routes/api.php:406`
- DELETE `/communication-gateways/{communicationGateway}` → `communication-gateways.delete`; `CommunicationGatewayController::destroy`; `../isp-backend/routes/api.php:407`
- GET `/dropdown-resellers/{id?}` → `dropdown.resellers`; `ResellerController::dropdownList`; `../isp-backend/routes/api.php:698`
- GET `/dropdown-companies` → `dropdown.companies`; `CompanyController::dropdownList`; `../isp-backend/routes/api.php:714`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/CompanyController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/CommunicationGatewayController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ResellerController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/CompanyController.php`
- `../isp-backend/app/Http/Requests/ImportCompanyExportRequest.php`
- `../isp-backend/app/Http/Requests/ImportResellerExportRequest.php`
- `../isp-backend/app/Http/Requests/RemoveResellerImageRequest.php`
- `../isp-backend/app/Http/Requests/StoreCommunicationGatewayRequest.php`
- `../isp-backend/app/Http/Requests/StoreCompanyRequest.php`
- `../isp-backend/app/Http/Requests/StoreResellerRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCommunicationGatewayRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanyProfileRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanyRequest.php`
- `../isp-backend/app/Http/Requests/UpdateCompanySettingsRequest.php`
- `../isp-backend/app/Http/Requests/UpdateResellerRequest.php`
- `../isp-backend/app/Http/Requests/UploadResellerImageRequest.php`
- `../isp-backend/app/Http/Resources/ClientCollection.php`
- `../isp-backend/app/Http/Resources/CommunicationGatewayCollection.php`
- `../isp-backend/app/Http/Resources/CommunicationGatewayResource.php`
- `../isp-backend/app/Http/Resources/CompanyCollection.php`
- `../isp-backend/app/Http/Resources/CompanyPublicResource.php`
- `../isp-backend/app/Http/Resources/CompanyResource.php`
- `../isp-backend/app/Http/Resources/PackagesResource.php`
- `../isp-backend/app/Http/Resources/ResellerCollection.php`
- `../isp-backend/app/Http/Resources/ResellerCompanyResource.php`
- `../isp-backend/app/Http/Resources/ResellerResource.php`
