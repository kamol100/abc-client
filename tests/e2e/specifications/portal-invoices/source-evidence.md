# Source evidence — portal-invoices

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(client-dashboard)/client/invoices/page.tsx`
- `components/client-area/invoices/client-invoice-columns.tsx`
- `components/client-area/invoices/client-invoice-filter-schema.ts`
- `components/client-area/invoices/client-invoice-row-actions.tsx`
- `components/client-area/invoices/client-invoices-table.tsx`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- `client-invoices`

## Observed form/config field names

- `status`

## Matching backend route declarations

- GET `/client-invoices` → `client.invoices`; `InvoiceController::index`; `../isp-backend/routes/client.php:25`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Client/InvoiceController.php`
- `../isp-backend/app/Http/Resources/InvoiceCollection.php`
