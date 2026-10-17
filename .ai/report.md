## Summary

Design D is the only filter-row layout. A table that sets `filter_row` splits its filters into that many flexible rows. Each row grows to the available width and wraps on its own. The invoice table uses `filter_row: 2`. Tables that omit `filter_row` keep the previous single-row grid. The comparison page and layouts A, B, and C are removed.

## Files

- `components/form-wrapper/form-filter.tsx` — `filterRows` renders the flexible rows
- `components/data-table/filter-layout.ts` — row splitting only
- `components/data-table/data-table-toolbar-options.ts` — `filter_row` documents the final behavior
- `components/data-table/data-table-toolbar.tsx` — passes `filter_row` through
- `components/invoices/invoice-table.tsx` — `filter_row: 2`
- Removed `app/(dashboard)/dev/filter-layouts/page.tsx` and `components/data-table/filter-layout-demo.tsx`
- Removed `filter_layout_demo` from `public/lang/en.json` and `public/lang/bn.json`
- `tests/unit/data-table/filter-layout.test.ts`, `tests/unit/data-table/filter-layout-preview.test.tsx`

## Checks

`scripts/ai/typecheck` passed. Filter layout and filter toggle tests passed (3 files / 10 tests).

The open invoice filter was not checked in the browser.

## Assumptions

Phone filters stay in the existing bottom drawer. Ten invoice filters with `filter_row: 2` form two rows of five.
