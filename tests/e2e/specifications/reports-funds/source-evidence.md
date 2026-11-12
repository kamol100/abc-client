# Source evidence — reports-funds

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/reports/funds/page.tsx`
- `components/funds/fund-column.tsx`
- `components/funds/fund-filter-schema.ts`
- `components/funds/fund-form-schema.ts`
- `components/funds/fund-form.tsx`
- `components/funds/fund-table.tsx`
- `components/funds/fund-type.ts`

## Observed permission checks

- `fund-transactions.show`
- `funds.delete`
- `funds.edit`

## Observed API templates (not validated endpoints)

- `/dropdown-staffs`
- `/funds`
- `funds`

## Observed form/config field names

- `account_number`
- `name`
- `short_name`
- `staff_id`

## Matching backend route declarations

- GET `/funds` → `funds.access`; `FundController::index`; `../isp-backend/routes/api.php:472`
- POST `/funds` → `funds.create`; `FundController::store`; `../isp-backend/routes/api.php:473`
- GET `/funds/{fund}` → `funds.show`; `FundController::show`; `../isp-backend/routes/api.php:474`
- PUT `/funds/{fund}` → `funds.edit`; `FundController::update`; `../isp-backend/routes/api.php:475`
- DELETE `/funds/{fund}` → `funds.delete`; `FundController::destroy`; `../isp-backend/routes/api.php:476`
- GET `/fund-transactions` → `fund-transactions.access`; `FundTransactionController::index`; `../isp-backend/routes/api.php:487`
- GET `/fund-transactions/{fund}` → `fund-transactions.show`; `FundTransactionController::show`; `../isp-backend/routes/api.php:488`
- POST `/fund-transactions/{fund}` → `fund-transactions.create`; `FundTransactionController::store`; `../isp-backend/routes/api.php:489`
- DELETE `/fund-transactions/{fundTransaction}` → `fund-transactions.delete`; `FundTransactionController::destroy`; `../isp-backend/routes/api.php:490`
- GET `/dropdown-staffs` → `dropdown.staffs`; `StaffController::dropdownList`; `../isp-backend/routes/api.php:707`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/FundController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/FundTransactionController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/StaffController.php`
- `../isp-backend/app/Http/Requests/RemoveStaffImageRequest.php`
- `../isp-backend/app/Http/Requests/ResetStaffPasswordRequest.php`
- `../isp-backend/app/Http/Requests/StoreFundRequest.php`
- `../isp-backend/app/Http/Requests/StoreFundTransactionRequest.php`
- `../isp-backend/app/Http/Requests/StoreStaffRequest.php`
- `../isp-backend/app/Http/Requests/UpdateFundRequest.php`
- `../isp-backend/app/Http/Requests/UpdateFundTransactionRequest.php`
- `../isp-backend/app/Http/Requests/UpdateStaffRequest.php`
- `../isp-backend/app/Http/Requests/UpdateStaffStatusRequest.php`
- `../isp-backend/app/Http/Requests/UploadStaffImageRequest.php`
- `../isp-backend/app/Http/Resources/FundCollection.php`
- `../isp-backend/app/Http/Resources/FundResource.php`
- `../isp-backend/app/Http/Resources/FundTransactionCollection.php`
- `../isp-backend/app/Http/Resources/FundTransactionResource.php`
- `../isp-backend/app/Http/Resources/StaffCollection.php`
- `../isp-backend/app/Http/Resources/StaffResource.php`
