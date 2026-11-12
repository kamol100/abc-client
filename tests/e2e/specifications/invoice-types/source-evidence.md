# Source evidence — invoice-types

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/invoice-types/page.tsx`
- `components/invoice-type/invoice-type-column.tsx`
- `components/invoice-type/invoice-type-form-schema.ts`
- `components/invoice-type/invoice-type-form.tsx`
- `components/invoice-type/invoice-type-table.tsx`
- `components/invoice-type/invoice-type-type.ts`

## Observed permission checks

- `invoice-types.create`
- `invoice-types.delete`
- `invoice-types.edit`

## Observed API templates (not validated endpoints)

- `/invoice-types`
- `invoice-types`

## Observed form/config field names

- `description`
- `name`

## Matching backend route declarations

- GET `/invoice-types` → `invoice-types.access`; `InvoiceTypeController::index`; `../isp-backend/routes/api.php:274`
- POST `/invoice-types` → `invoice-types.create`; `InvoiceTypeController::store`; `../isp-backend/routes/api.php:275`
- GET `/invoice-types/{invoiceType}` → `invoice-types.show`; `InvoiceTypeController::show`; `../isp-backend/routes/api.php:276`
- PUT `/invoice-types/{invoiceType}` → `invoice-types.edit`; `InvoiceTypeController::update`; `../isp-backend/routes/api.php:277`
- DELETE `/invoice-types/{invoiceType}` → `invoice-types.delete`; `InvoiceTypeController::destroy`; `../isp-backend/routes/api.php:278`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/InvoiceTypeController.php`
- `../isp-backend/app/Http/Requests/InvoiceTypeRequest.php`
- `../isp-backend/app/Http/Resources/InvoiceTypeCollection.php`
- `../isp-backend/app/Http/Resources/InvoiceTypeResource.php`
