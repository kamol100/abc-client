## Summary

Removed the client-side BTRC Excel download. The Client Report and Reseller Report filters stay, and each Download button does nothing until a backend export API is wired in.

## Files

- `components/reports/btrc-report.tsx`
- `components/reports/btrc-report-export.ts` (deleted)
- `tests/unit/reports/btrc-report.test.tsx`
- `tests/unit/reports/btrc-report-export.test.ts` (deleted)

## Behavior

- Zone, status, and reseller filters still load from the existing dropdown APIs.
- Both Download buttons are `type="button"` with no click handler and no file generation.
- Spreadsheet XML, paging through `/clients` and `/resellers`, and the export helpers are gone.

## Checks

- `scripts/ai/typecheck` passed.
- `npm test -- tests/unit/reports/btrc-report.test.tsx` passed (1 test).

## Browser

`/reports/btrc` redirected to `/admin`. Login was not completed, so the live page was not exercised after the change. The unit test covers that both sections and both Download buttons still render.

## Left untouched

`components/activity-logs/activity-log-column.tsx`, `components/activity-logs/activity-log-table.tsx`, `components/clients/client-form-schema.ts`, `components/reports/reports-view.tsx`, `hooks/use-menu-items.ts`, `public/lang/en.json`, `public/lang/bn.json`, and `tests/unit/activity-logs/`.
