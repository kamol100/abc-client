## Summary

`/client/traffic-report` is in the client sidebar and shows this week, this month, and last month totals, a daily usage chart, and a paginated history table. The default range is the current month in the usage timezone. A date filter changes the chart and table together. The three cards stay on their fixed periods.

Signed in as client `01677217100` on `http://vp.isp.test/client/traffic-report` after local usage rows were added for that client. Cards showed 16 GB, 43.6 GB, and 11.9 GB. Page 2 showed 7 Oct, 4 Oct, and 2 Oct. Filtering 1–30 Sep showed the four September rows and left the cards unchanged.

## Files

- `app/(client-dashboard)/client/traffic-report/page.tsx`
- `components/client-area/traffic-report/client-traffic-report.tsx`
- `components/client-area/traffic-report/traffic-report-format.ts`
- `components/client-area/traffic-report/traffic-report-type.ts`
- `hooks/use-client-menu-items.ts`
- `hooks/use-menu-items.ts`
- `components/client-area/client-top-navbar.tsx`
- `app/(dashboard)/dashboard-breadcrumb.tsx`
- `public/lang/en.json`
- `public/lang/bn.json`
- `tests/unit/client-area/traffic-report-format.test.ts`

## Checks

`npx vitest run tests/unit/client-area/traffic-report-format.test.ts`: 3 passed.

`npx tsc --noEmit`: passed.

Browser: client login, default month, page 2, and a September date range on `vp.isp.test`.

## Git

Uncommitted. Depends on `GET /api/v1/client-traffic-report` in `isp-backend`.
