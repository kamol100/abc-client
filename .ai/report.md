## Summary

The salary edit form selects Expense Type from `expenseType` on the salary, the same way Fund and Staff are selected.

## Frontend

- `expense_type_id` uses `valueKey: "expenseType"`.
- The row type accepts `expense_type_id` and `expenseType`.

## Browser

Not rechecked. The API cannot return a saved type until the salary `expense_type_id` column is migrated on the local database.

## Checks

- `scripts/ai/typecheck` passed.

## Unrelated

Left untouched: traffic report, client router info, reseller wallet files, and the extra unit tests. `en.json` and `bn.json` still contain other uncommitted edits.
