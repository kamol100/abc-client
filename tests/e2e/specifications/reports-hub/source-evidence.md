# Source evidence — reports-hub

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/reports/page.tsx`
- `components/reports/btrc-report.tsx`
- `components/reports/income-expense-filter-schema.ts`
- `components/reports/income-expense-summary.tsx`
- `components/reports/income-expense-table.tsx`
- `components/reports/income-expense-type.ts`
- `components/reports/new-client-report.tsx`
- `components/reports/reports-view.tsx`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- `dropdown-resellers`
- `dropdown-zones`
- `expense-type`
- `invoice-type`

## Observed form/config field names

- `create_date`
- `date_range`
- `reseller_id`
- `scope`
- `status`
- `zone_id`

## Matching backend route declarations

- GET `/invoice-type` → `invoices.type`; `InvoicesController::invoiceType`; `../isp-backend/routes/api.php:630`
- GET `/expense-type` → `expense.type`; `ExpenseController::expenseType`; `../isp-backend/routes/api.php:633`
- GET `/dropdown-resellers/{id?}` → `dropdown.resellers`; `ResellerController::dropdownList`; `../isp-backend/routes/api.php:698`
- GET `/dropdown-zones` → `dropdown.zones`; `ZoneController::dropdownList`; `../isp-backend/routes/api.php:699`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/ExpenseController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/InvoicesController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ResellerController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ZoneController.php`
- `../isp-backend/app/Http/Requests/BulkInvoicePayRequest.php`
- `../isp-backend/app/Http/Requests/ImportResellerExportRequest.php`
- `../isp-backend/app/Http/Requests/InvoicePayRequest.php`
- `../isp-backend/app/Http/Requests/RemoveResellerImageRequest.php`
- `../isp-backend/app/Http/Requests/StoreExpenseRequest.php`
- `../isp-backend/app/Http/Requests/StoreInvoicesRequest.php`
- `../isp-backend/app/Http/Requests/StoreResellerRequest.php`
- `../isp-backend/app/Http/Requests/StoreZoneRequest.php`
- `../isp-backend/app/Http/Requests/UpdateExpenseRequest.php`
- `../isp-backend/app/Http/Requests/UpdateInvoicesRequest.php`
- `../isp-backend/app/Http/Requests/UpdateResellerRequest.php`
- `../isp-backend/app/Http/Requests/UpdateZoneRequest.php`
- `../isp-backend/app/Http/Requests/UploadResellerImageRequest.php`
- `../isp-backend/app/Http/Resources/ClientCollection.php`
- `../isp-backend/app/Http/Resources/ExpenseCollection.php`
- `../isp-backend/app/Http/Resources/ExpenseResource.php`
- `../isp-backend/app/Http/Resources/InvoiceCollection.php`
- `../isp-backend/app/Http/Resources/InvoiceResource.php`
- `../isp-backend/app/Http/Resources/PackagesResource.php`
- `../isp-backend/app/Http/Resources/ResellerCollection.php`
- `../isp-backend/app/Http/Resources/ResellerCompanyResource.php`
- `../isp-backend/app/Http/Resources/ResellerResource.php`
- `../isp-backend/app/Http/Resources/ZoneCollection.php`
- `../isp-backend/app/Http/Resources/ZoneResource.php`
