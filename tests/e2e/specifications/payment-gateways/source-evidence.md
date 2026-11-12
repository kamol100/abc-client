# Source evidence — payment-gateways

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/payment-gateways/page.tsx`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- None extracted; inspect page, shared components and dynamic configuration.

## Observed form/config field names

- None extracted; inspect page, shared components and dynamic configuration.

## Matching backend route declarations

- GET `/payment-gateways` → `payment-gateways.access`; `PaymentGatewayController::index`; `../isp-backend/routes/api.php:456`
- POST `/payment-gateways` → `payment-gateways.create`; `PaymentGatewayController::store`; `../isp-backend/routes/api.php:457`
- GET `/payment-gateways/{paymentGateway}` → `payment-gateways.show`; `PaymentGatewayController::show`; `../isp-backend/routes/api.php:458`
- PUT `/payment-gateways/{paymentGateway}` → `payment-gateways.edit`; `PaymentGatewayController::update`; `../isp-backend/routes/api.php:459`
- DELETE `/payment-gateways/{paymentGateway}` → `payment-gateways.delete`; `PaymentGatewayController::destroy`; `../isp-backend/routes/api.php:460`
- PUT `/payment-gateways/{paymentGateway}/status` → `payment-gateways.status`; `PaymentGatewayController::toggleStatus`; `../isp-backend/routes/api.php:461`
- PUT `/payment-gateways/{paymentGateway}/default` → `payment-gateways.default`; `PaymentGatewayController::makeDefault`; `../isp-backend/routes/api.php:462`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/PaymentGatewayController.php`
- `../isp-backend/app/Http/Requests/StorePaymentGatewayRequest.php`
- `../isp-backend/app/Http/Requests/UpdatePaymentGatewayRequest.php`
- `../isp-backend/app/Http/Resources/PaymentGatewayCollection.php`
- `../isp-backend/app/Http/Resources/PaymentGatewayResource.php`
