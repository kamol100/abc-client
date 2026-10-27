## Summary

The client server card now shows Data Usage directly under Up/down: Today, This Month, and Last Month. Values come from `GET /client-usage/{id}` and are formatted with binary units (1024). The request is cached for 60 seconds and does not wait on the router-info call.

Missing history and request failures show Unavailable. A measured zero shows `0 B`. Partial periods keep the number and note when recording started.

## Files

- `components/clients/client-router-info.tsx`
- `components/clients/client-type.ts`
- `lib/helper/helper.ts`
- `public/lang/en.json`
- `public/lang/bn.json`
- `tests/unit/clients/client-data-usage.test.tsx`
- `tests/unit/lib/format-data-usage.test.ts`

## Checks

`npx vitest run` on the usage tests, router-info tests, and client-view ping test passed (15 tests). `scripts/ai/typecheck` passed.

The client detail page was not opened in a browser. No dev server was running, and the page needs a signed-in staff session. The unit test covers placement, formatting, loading, a failed usage request, and the router section staying visible.

## Git

Uncommitted.
