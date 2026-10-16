## Summary

The activity log Action by and Date columns now stay at least 150px wide, on one line. The Summary column still takes the leftover width.

## Files

- `components/activity-logs/activity-log-column.tsx`
- `tests/unit/activity-logs/activity-log-summary.test.tsx`

## Checks

`npx vitest run tests/unit/activity-logs/activity-log-summary.test.tsx` — 6 passed. The show-more fixture is longer than the 120-character summary limit.

## Browser

The signed-in activity log page stayed on its loading skeleton, so the live column widths were not measured.

## Left untouched

`auth/auth.ts`, `components/data-table/data-table.tsx`, `public/lang/en.json`, and `public/lang/bn.json`.
