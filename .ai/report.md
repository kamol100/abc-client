## Summary

The BTRC client report now has a Report Type dropdown. **All Clients with Resellers** is the default and hides the zone filter. **Own Clients** keeps the previous company-only export: same request shape, same zone and status filters, and the same `BTRC_Clients_List.xls` file.

## Files

- `components/reports/btrc-report.tsx` — report type field, zone hidden unless Own Clients
- `app/api/reports/btrc/[kind]/route.ts` — forwards `scope`
- `public/lang/en.json`, `public/lang/bn.json` — `btrc.client.type`
- `tests/unit/reports/btrc-report.test.tsx`

## Checks

`scripts/ai/frontend-check` passed (typecheck, then 53 unit files / 236 tests).

The signed-in page at `/reports/btrc` redirects to `/admin`. The dropdown, hidden zone, and download URLs were exercised in the unit test. Light/dark layout was not checked in the browser.

## Assumptions

Client Status still says “All Clients” for every status. “Own Clients” is the report type, not a status. Choosing it omits `scope` so the API call matches the previous default. The inclusive download sends `scope=with_resellers` and does not send `zone_id`.
