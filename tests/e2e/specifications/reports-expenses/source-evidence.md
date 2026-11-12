# Source evidence — reports-expenses

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/reports/expenses/page.tsx`
- `components/expenses/expense-column.tsx`
- `components/expenses/expense-filter-schema.ts`
- `components/expenses/expense-form-schema.ts`
- `components/expenses/expense-form.tsx`
- `components/expenses/expense-fund-access.ts`
- `components/expenses/expense-reports.tsx`
- `components/expenses/expense-table.tsx`
- `components/expenses/expense-type.ts`

## Observed permission checks

- `expenses.approval`
- `expenses.edit`
- `expenses.fund.update`

## Observed API templates (not validated endpoints)

- `/dropdown-expense-types`
- `/dropdown-funds`
- `/dropdown-staffs`
- `/dropdown-zones`
- `/expense-status/${expense.id}`
- `/expenses`
- `expenses`

## Observed form/config field names

- `amount`
- `any`
- `expense_date`
- `expense_type_id`
- `fund_id`
- `note`
- `staff_id`
- `status`
- `voucher`
- `zone_id`

## Matching backend route declarations

- GET `/expenses` → `expenses.access`; `ExpenseController::index`; `../isp-backend/routes/api.php:365`
- POST `/expenses` → `expenses.create`; `ExpenseController::store`; `../isp-backend/routes/api.php:366`
- GET `/expenses/{expense}` → `expenses.show`; `ExpenseController::show`; `../isp-backend/routes/api.php:367`
- PUT `/expenses/{expense}` → `expenses.edit`; `ExpenseController::update`; `../isp-backend/routes/api.php:368`
- DELETE `/expenses/{expense}` → `expenses.delete`; `ExpenseController::destroy`; `../isp-backend/routes/api.php:369`
- PUT `/expense-status/{expense}` → `expense.status.update`; `ExpenseController::updateStatus`; `../isp-backend/routes/api.php:690`
- GET `/dropdown-zones` → `dropdown.zones`; `ZoneController::dropdownList`; `../isp-backend/routes/api.php:699`
- GET `/dropdown-funds` → `dropdown.funds`; `FundController::dropdownList`; `../isp-backend/routes/api.php:704`
- GET `/dropdown-staffs` → `dropdown.staffs`; `StaffController::dropdownList`; `../isp-backend/routes/api.php:707`
- GET `/dropdown-expense-types` → `dropdown.expense.types`; `ExpenseTypeController::dropdownList`; `../isp-backend/routes/api.php:708`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/ExpenseController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ExpenseTypeController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/FundController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/StaffController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/ZoneController.php`
- `../isp-backend/app/Http/Requests/ExpenseTypeRequest.php`
- `../isp-backend/app/Http/Requests/RemoveStaffImageRequest.php`
- `../isp-backend/app/Http/Requests/ResetStaffPasswordRequest.php`
- `../isp-backend/app/Http/Requests/StoreExpenseRequest.php`
- `../isp-backend/app/Http/Requests/StoreFundRequest.php`
- `../isp-backend/app/Http/Requests/StoreStaffRequest.php`
- `../isp-backend/app/Http/Requests/StoreZoneRequest.php`
- `../isp-backend/app/Http/Requests/UpdateExpenseRequest.php`
- `../isp-backend/app/Http/Requests/UpdateFundRequest.php`
- `../isp-backend/app/Http/Requests/UpdateStaffRequest.php`
- `../isp-backend/app/Http/Requests/UpdateStaffStatusRequest.php`
- `../isp-backend/app/Http/Requests/UpdateZoneRequest.php`
- `../isp-backend/app/Http/Requests/UploadStaffImageRequest.php`
- `../isp-backend/app/Http/Resources/ExpenseCollection.php`
- `../isp-backend/app/Http/Resources/ExpenseResource.php`
- `../isp-backend/app/Http/Resources/ExpenseTypeCollection.php`
- `../isp-backend/app/Http/Resources/ExpenseTypeResource.php`
- `../isp-backend/app/Http/Resources/FundCollection.php`
- `../isp-backend/app/Http/Resources/FundResource.php`
- `../isp-backend/app/Http/Resources/StaffCollection.php`
- `../isp-backend/app/Http/Resources/StaffResource.php`
- `../isp-backend/app/Http/Resources/ZoneCollection.php`
- `../isp-backend/app/Http/Resources/ZoneResource.php`
