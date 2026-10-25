## Summary

Client logout was leaving the company host. `signOut({ callbackUrl: "/login" })` lets Auth.js prefix that path with `AUTH_URL` (`http://isp.test`), so a session on `http://vp.isp.test` landed on `http://isp.test/login`.

Logout now clears the session without following that Auth.js URL, then opens `/login` on the current host (`http://vp.isp.test/login`). The sidebar sign-out uses the same path.

## Files

- `lib/auth/client-sign-out.ts`
- `lib/auth/routes.ts`
- `components/client-area/client-profile.tsx`
- `components/client-area/client-sidebar.tsx`
- `tests/unit/auth/auth-gate.test.ts`
- `tests/unit/auth/client-sign-out.test.ts`

## Checks

`npx vitest run tests/unit/auth/auth-gate.test.ts tests/unit/auth/client-sign-out.test.ts` passed (12 tests). `scripts/ai/typecheck` passed.

Signed out from `http://vp.isp.test/client/dashboard`. The browser landed on `http://vp.isp.test/login`. A later visit to `/client/dashboard` stayed on `http://vp.isp.test/login?callbackUrl=%2Fclient%2Fdashboard`.

## Git

Uncommitted. Earlier auth-route edits in this working tree were already present and were left in place.
