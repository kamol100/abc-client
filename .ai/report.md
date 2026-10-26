## Summary

A signed-in session that is still valid now leaves only the home page for the dashboard. `http://vp.isp.test/` and `http://vp.isp.test/home` redirect to `/dashboard`. Features, pricing, demo request, pay, and other public pages stay where they are.

## Files

- `lib/auth/routes.ts`
- `app/(public)/home/page.tsx`
- `tests/unit/auth/auth-gate.test.ts`

## Checks

`npx vitest run tests/unit/auth/auth-gate.test.ts` passed (14 tests). `scripts/ai/typecheck` passed.

Signed in on `http://vp.isp.test`. Opening `/home` and `/` landed on `/dashboard`. Opening `/features` and `/pricing` stayed on those pages.

## Git

Uncommitted. No unrelated working-tree changes.
