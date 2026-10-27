## Summary

Column hide/show choices are stored in `localStorage` and restored for the same page and table. The storage key is `data-table:column-visibility:{pathname}:{queryKey}`. A table without `queryKey` uses its hideable column ids, so two tables on one page do not share settings. Hiding a column on Clients does not change Invoices.

The toggle UI is unchanged. Preferences are applied before the column headers paint: the table stays on its skeleton until the saved visibility is read, then renders the final columns. Missing, corrupt, or outdated stored values fall back to the default visibility, including `initialColumnVisibility`. Columns that cannot be hidden are left alone. Tables with `toggleColumns` off do not read or write storage.

## Files

- `components/data-table/data-table.tsx`
- `components/data-table/column-visibility.ts`
- `components/data-table/use-persisted-column-visibility.ts`
- `tests/unit/data-table/column-visibility.test.ts`
- `tests/unit/data-table/column-visibility-persistence.test.tsx`

## Checks

`npx vitest run` on the two column-visibility test files passed (12 tests). `scripts/ai/typecheck` passed.

The clients page was not opened in a browser. No dev server was running, and the page needs a signed-in staff session. The table test renders `DataTable`, restores a hidden Email column, shows it again from the toggle, and confirms that choice is what a remount reads back.

## Git

Uncommitted. `app/layout.tsx` still has the earlier PWA install-prompt unmount and was not part of this change.
