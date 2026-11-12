# Source evidence — expense-types

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/expense-types/page.tsx`
- `components/expense-type/expense-type-column.tsx`
- `components/expense-type/expense-type-form-schema.ts`
- `components/expense-type/expense-type-form.tsx`
- `components/expense-type/expense-type-table.tsx`
- `components/expense-type/expense-type-type.ts`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- `/expense-types`
- `expense-types`

## Observed form/config field names

- `description`
- `name`

## Matching backend route declarations

- GET `/expense-types` → `expense-types.access`; `ExpenseTypeController::index`; `../isp-backend/routes/api.php:372`
- POST `/expense-types` → `expense-types.create`; `ExpenseTypeController::store`; `../isp-backend/routes/api.php:373`
- GET `/expense-types/{expenseType}` → `expense-types.show`; `ExpenseTypeController::show`; `../isp-backend/routes/api.php:374`
- PUT `/expense-types/{expenseType}` → `expense-types.edit`; `ExpenseTypeController::update`; `../isp-backend/routes/api.php:375`
- DELETE `/expense-types/{expenseType}` → `expense-types.delete`; `ExpenseTypeController::destroy`; `../isp-backend/routes/api.php:376`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/ExpenseTypeController.php`
- `../isp-backend/app/Http/Requests/ExpenseTypeRequest.php`
- `../isp-backend/app/Http/Resources/ExpenseTypeCollection.php`
- `../isp-backend/app/Http/Resources/ExpenseTypeResource.php`
