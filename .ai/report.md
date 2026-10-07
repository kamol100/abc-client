## Summary

The import dialog submits a bulk import using integer ids. Individual checkboxes send sync-client ids with `all_import: false`. Select all sends an empty id list with `all_import: true`. A chosen reseller id is included, or `null` for an own client.

## Files changed

- `components/import-client/import-client-bulk-dialog.tsx`
- `components/import-client/import-client-table.tsx`
- `components/import-client/import-client-column.tsx`
- `components/import-client/import-client-type.ts`
- `components/select-dropdown.tsx`
- `components/form-wrapper/form-builder.tsx`
- `components/form-wrapper/form-wrapper.tsx`
- `public/lang/en.json`
- `public/lang/bn.json`

## Behavior

Selection stores `row.id`. The dialog posts those ids to `/sync-clients/bulk-import` and clears the selection after a successful queue response. The reseller dropdown stores the reseller id.

## Tests

`scripts/ai/typecheck` passed. The dialog was not opened in the browser; no app server was running.
