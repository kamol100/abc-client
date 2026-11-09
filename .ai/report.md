## Summary

Expense creation now selects the signed-in user's staff fund. Admin and Super Admin, and anyone with `expenses.fund.update`, can change that fund. Other staff stay on their own fund. Editing follows `expenses.edit` and does not require `expenses.fund.update`.

## Frontend

- The fund comes from the user profile (`staff.fund`), the same staff relationship as `Fund.staff_id`.
- On create, that fund is the default. Without `expenses.fund.update`, the field shows the fund name and stays disabled. With no assigned fund, the form shows "You do not have any fund access" and does not submit.
- Admin and Super Admin can pick any fund on create, including when they have no personal fund.
- The edit action is hidden without `expenses.edit`. With that permission, the saved fund stays selected and can be changed.

## Checks

- `scripts/ai/typecheck`: passed.
- `npx vitest run tests/unit/expenses/expense-fund-access.test.tsx tests/unit/expenses/expense-status-select.test.tsx`: 17 passed.
- `scripts/ai/test`: 21 failures in unrelated suites (date picker, menu, pay, reseller clients, maps). No expense test failed.
- Browser, signed in as Super Admin at `http://app.isp.test/expenses`: Add Expense defaults Payment Method to `admin` and the list includes `cash`, `bkash`, and `admin`. Edit Expense keeps the saved fund `cash` and leaves the field changeable. A restricted staff session was not opened in the browser.

## Notes

- `components/select-dropdown.tsx` was already modified and was left as-is.
- Backend gap, unchanged as requested: `StoreExpenseRequest` and `UpdateExpenseRequest` still accept any `fund_id`. The API does not enforce `expenses.fund.update` or the staff fund assignment.
