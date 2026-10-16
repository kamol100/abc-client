## Summary

The BTRC page downloads two Excel-compatible CSV files from the API. All Zones, All Clients, and All Resellers are omitted from the query so they do not filter the file. Each Download button shows a loading state, ignores a second click while a request is in flight, and toasts success or the API error.

The browser calls `/api/reports/btrc/clients` or `/api/reports/btrc/resellers`. That route forwards the session token to `GET /api/v1/btrc/clients` and `GET /api/v1/btrc/resellers` and streams the file back.

## Files

- `components/reports/btrc-report.tsx`
- `app/api/reports/btrc/[kind]/route.ts`
- `tests/unit/reports/btrc-report.test.tsx`

## Checks

- `scripts/ai/typecheck` passed.
- `npx vitest run tests/unit/reports/btrc-report.test.tsx` passed (4 tests).

## Browser

`/reports/btrc` on the running app redirects to `/admin?callbackUrl=/reports/btrc`. Login was not available, so the live download was not clicked. The unit tests cover both download buttons, the All-filter query, the loading lock, and the error toast. The local API returns 401 for both report URLs when no token is sent.

## Left untouched

`tests/unit/activity-logs/` is still untracked and was not changed.
