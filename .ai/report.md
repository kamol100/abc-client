## Summary

The client server card shows Data Usage directly under Up/down. Each available period is a badge: D for today, M for this month, and LM for last month. The badge shows the short label and the total. The tooltip reads the full period, for example Today 10 GB. A period that has not been recorded is omitted. If none are available, the row is hidden. A measured zero still shows, such as D 0 B.

Values come from `GET /client-usage/{id}` and use binary units (1024). The request is cached for 60 seconds and does not wait on the router-info call.

## Files

- `components/clients/client-router-info.tsx`
- `components/clients/client-type.ts`
- `lib/helper/helper.ts`
- `public/lang/en.json`
- `public/lang/bn.json`
- `tests/unit/clients/client-data-usage.test.tsx`
- `tests/unit/lib/format-data-usage.test.ts`

## Checks

`npx vitest run` on the usage, router-info, and client-view ping tests passed (13 tests).

The client detail page was not opened in a browser. No dev server was running, and the page needs a signed-in staff session. The unit test covers the short badges, the tooltip label, a hidden missing period, loading, and the router section staying visible when usage is absent.

## Git

Uncommitted.
