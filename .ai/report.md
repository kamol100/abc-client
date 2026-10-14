## Summary

Hiding the filter fields now clears the filter form and the query sent to the list API.

## Files

- `components/form-wrapper/form-filter.tsx`
- `tests/unit/form/filter-toggle-reset.test.tsx`

## Behavior

- The toggle only changed `isOpen`. Values stayed in the filter form, and the last query string stayed on the list request.
- Closing the fields now uses the existing reset: `form.reset()` plus `submitFilter({})`.
- A page `defaultFilter` stays on the query. User-entered values do not.
- Opening the fields does not submit again. The inputs come back empty.
- Closing with an empty form does not call `setFilter`, so a query that did not come from this form is left as it is.
- `forceOpen` panels, including the mobile filter drawer and the map filters, stay filled because those fields never hide.

## Checks

`npx vitest run tests/unit/form` passed: 24 tests. `scripts/ai/typecheck` passed.

## Browser

The expenses page redirected to login. Signing in was blocked, so the toggle was not clicked in the browser. The hide, show, empty-close, default-filter, and `forceOpen` paths are covered by the unit test.

## Left untouched

Unrelated working-tree changes: `components/data-table/data-table-toolbar.tsx`, `components/form/DatePicker.tsx`, `components/invoices/bulk-invoice-pay-dialog.tsx`, `components/invoices/invoice-type.ts`, `hooks/use-filter-form.ts`, `components/expenses/expense-reports.tsx`, and the other files under `tests/unit/form/`.
