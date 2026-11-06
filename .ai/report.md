## Summary

Opening a list filter no longer hides the result count. A count chip sits at the start of the open filter row on every paginated data table.

## Frontend

- `DataTable` passes `pagination.total` into the shared toolbar.
- Desktop filters, the mobile filter drawer, and mobile simple search all render that total as a pill before the fields.
- The chip uses `DisplayCount`, so English and Bangla digits follow the active language. The closed toolbar title is unchanged.
- Lists with no pagination total do not show the chip. Map screens and the income/expense report are not paginated tables, so they are unchanged.

## Browser

No app server was running, and the clients screen needs a signed-in session, so the chip was not clicked in a browser. Vitest covered a closed filter, an opened filter with `1,284` before the field, a pinned-open filter showing `0`, and a data table passing `902` into the chip.

## Checks

- `npx vitest run tests/unit/data-table/filter-result-count.test.tsx tests/unit/form/filter-toggle-reset.test.tsx tests/unit/data-table/filter-layout-preview.test.tsx tests/unit/data-table/mobile-simple-search.test.tsx`: 14 passed.
- `scripts/ai/typecheck` passed.

## Unrelated

Working tree was clean before this change.
