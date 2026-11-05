## Summary

Expense list status changes moved from the approve and decline icon buttons into a status dropdown on the status column, matching the ticket status menu.

## Frontend

- `components/expenses/expense-column.tsx`: actions keep edit and delete. The status cell uses `ChoiceMenu` with Pending, Approved, and Declined. Choosing a status sends `PUT /expense-status/{id}` and rolls back on error. Users without `expenses.approval` see the badge only.
- `components/expenses/expense-type.ts` and `expense-form-schema.ts`: shared status options for the menu and the expense form.
- `public/lang/en.json` and `public/lang/bn.json`: `expense.status.change`.
- `tests/unit/expenses/expense-status-select.test.tsx`: menu options, save, permission badge, and no approve/decline buttons.

## Browser

No dev server was running, and the expenses page needs a signed-in session. The dropdown was not clicked in the browser. The unit test covers the menu, the status request, and the badge shown without `expenses.approval`.

## Checks

- `npx vitest run tests/unit/expenses/expense-status-select.test.tsx` passed (4 tests).
- `scripts/ai/typecheck` passed.

## Security

`PUT /expense-status/{expense}` (`expense.status.update`) sits in the `auth:sanctum` + `subscription` group and is not behind the `permissions` middleware. `expenses.approval` only hides the menu. The seeded permission name and the route name also differ, so the API does not enforce the permission the form and this menu use.

## Unrelated

Left untouched: `components/clients/client-view.tsx`, `tests/unit/clients/client-view-ping-button.test.tsx`.
