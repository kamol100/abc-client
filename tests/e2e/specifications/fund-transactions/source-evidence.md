# Source evidence — fund-transactions

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/fund-transactions/page.tsx`
- `components/fund-transactions/fund-transaction-access.ts`
- `components/fund-transactions/fund-transaction-column.tsx`
- `components/fund-transactions/fund-transaction-filter-schema.ts`
- `components/fund-transactions/fund-transaction-form-schema.ts`
- `components/fund-transactions/fund-transaction-form.tsx`
- `components/fund-transactions/fund-transaction-table.tsx`
- `components/fund-transactions/fund-transaction-type.ts`

## Observed permission checks

- `fund-transactions.create`
- `fund-transactions.delete`

## Observed API templates (not validated endpoints)

- `/dropdown-funds`

## Observed form/config field names

- `amount`
- `created_at`
- `fund_balance`
- `fund_id`
- `fund_uuid`
- `note`
- `sender_balance`
- `sender_uuid`
- `transaction_type`
- `transfer_by`

## Matching backend route declarations

- GET `/fund-transactions` → `fund-transactions.access`; `FundTransactionController::index`; `../isp-backend/routes/api.php:487`
- GET `/fund-transactions/{fund}` → `fund-transactions.show`; `FundTransactionController::show`; `../isp-backend/routes/api.php:488`
- POST `/fund-transactions/{fund}` → `fund-transactions.create`; `FundTransactionController::store`; `../isp-backend/routes/api.php:489`
- DELETE `/fund-transactions/{fundTransaction}` → `fund-transactions.delete`; `FundTransactionController::destroy`; `../isp-backend/routes/api.php:490`
- GET `/dropdown-funds` → `dropdown.funds`; `FundController::dropdownList`; `../isp-backend/routes/api.php:704`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/FundController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/FundTransactionController.php`
- `../isp-backend/app/Http/Requests/StoreFundRequest.php`
- `../isp-backend/app/Http/Requests/StoreFundTransactionRequest.php`
- `../isp-backend/app/Http/Requests/UpdateFundRequest.php`
- `../isp-backend/app/Http/Requests/UpdateFundTransactionRequest.php`
- `../isp-backend/app/Http/Resources/FundCollection.php`
- `../isp-backend/app/Http/Resources/FundResource.php`
- `../isp-backend/app/Http/Resources/FundTransactionCollection.php`
- `../isp-backend/app/Http/Resources/FundTransactionResource.php`
