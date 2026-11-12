# Source evidence — salaries

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/salaries/create/page.tsx`
- `app/(dashboard)/salaries/edit/[id]/page.tsx`
- `app/(dashboard)/salaries/page.tsx`
- `components/salaries/salary-column.tsx`
- `components/salaries/salary-form-schema.ts`
- `components/salaries/salary-form.tsx`
- `components/salaries/salary-show.tsx`
- `components/salaries/salary-table.tsx`
- `components/salaries/salary-type.ts`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- `/dropdown-expense-types`
- `/dropdown-funds`
- `/dropdown-staffs`
- `/salaries`
- `/salary-deduction/${staffId}`
- `salaries`

## Observed form/config field names

- `amount`
- `date`
- `deductions_label`
- `deductions_value`
- `expense_type_id`
- `fund_id`
- `items_label`
- `items_value`
- `note`
- `salary_deductions`
- `salary_items`
- `salary_type`
- `staff_id`
- `status`

## Matching backend route declarations

- GET `/salaries` → `salaries.access`; `SalaryController::index`; `../isp-backend/routes/api.php:449`
- POST `/salaries` → `salaries.create`; `SalaryController::store`; `../isp-backend/routes/api.php:450`
- GET `/salaries/{salary}` → `salaries.show`; `SalaryController::show`; `../isp-backend/routes/api.php:451`
- PUT `/salaries/{salary}` → `salaries.edit`; `SalaryController::update`; `../isp-backend/routes/api.php:452`
- DELETE `/salaries/{salary}` → `salaries.delete`; `SalaryController::destroy`; `../isp-backend/routes/api.php:453`
- GET `/salary-deduction/{staffId}` → `salaries.deduction`; `StaffController::salaryDeduction`; `../isp-backend/routes/api.php:626`
- GET `/dropdown-funds` → `dropdown.funds`; `FundController::dropdownList`; `../isp-backend/routes/api.php:704`
- GET `/dropdown-staffs` → `dropdown.staffs`; `StaffController::dropdownList`; `../isp-backend/routes/api.php:707`
- GET `/dropdown-expense-types` → `dropdown.expense.types`; `ExpenseTypeController::dropdownList`; `../isp-backend/routes/api.php:708`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/ExpenseTypeController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/FundController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/SalaryController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/StaffController.php`
- `../isp-backend/app/Http/Requests/ExpenseTypeRequest.php`
- `../isp-backend/app/Http/Requests/RemoveStaffImageRequest.php`
- `../isp-backend/app/Http/Requests/ResetStaffPasswordRequest.php`
- `../isp-backend/app/Http/Requests/StoreFundRequest.php`
- `../isp-backend/app/Http/Requests/StoreSalaryRequest.php`
- `../isp-backend/app/Http/Requests/StoreStaffRequest.php`
- `../isp-backend/app/Http/Requests/UpdateFundRequest.php`
- `../isp-backend/app/Http/Requests/UpdateSalaryRequest.php`
- `../isp-backend/app/Http/Requests/UpdateStaffRequest.php`
- `../isp-backend/app/Http/Requests/UpdateStaffStatusRequest.php`
- `../isp-backend/app/Http/Requests/UploadStaffImageRequest.php`
- `../isp-backend/app/Http/Resources/ExpenseTypeCollection.php`
- `../isp-backend/app/Http/Resources/ExpenseTypeResource.php`
- `../isp-backend/app/Http/Resources/FundCollection.php`
- `../isp-backend/app/Http/Resources/FundResource.php`
- `../isp-backend/app/Http/Resources/SalaryCollection.php`
- `../isp-backend/app/Http/Resources/SalaryResource.php`
- `../isp-backend/app/Http/Resources/StaffCollection.php`
- `../isp-backend/app/Http/Resources/StaffResource.php`
