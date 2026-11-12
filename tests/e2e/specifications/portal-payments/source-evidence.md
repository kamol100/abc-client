# Source evidence — portal-payments

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(client-dashboard)/client/payments/page.tsx`
- `components/client-area/payments/client-payment-columns.tsx`
- `components/client-area/payments/client-payment-filter-schema.ts`
- `components/client-area/payments/client-payment-type.ts`
- `components/client-area/payments/client-payments-table.tsx`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- `client-payments`

## Observed form/config field names

- `payment_date`
- `status`
- `track_id`

## Matching backend route declarations

- GET `/client-payments` → `client.payments`; `PaymentController::index`; `../isp-backend/routes/client.php:27`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Client/PaymentController.php`
- `../isp-backend/app/Http/Resources/PaymentCollection.php`
