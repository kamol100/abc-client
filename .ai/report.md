## Summary

The client navbar and sidebar avatars show the stored client photo when `profile.photo` is set. The image is loaded from `/api/client-photo`, which proxies the signed-in client's own photo. Initials stay when there is no photo.

## Files

- `components/client-area/client-profile.tsx`
- `components/client-area/client-sidebar.tsx`
- `components/profiles/profile-avatar.ts`
- `app/api/client-photo/route.ts`
- `lib/images/proxy-private-image.ts`
- `types/app.ts`
- `tests/unit/profiles/profile-avatar.test.ts`

## Checks

`npx vitest run tests/unit/profiles/profile-avatar.test.ts`: 4 passed.

`scripts/ai/typecheck`: passed.

Browser: opened `http://vp.isp.test/login`. Password entry was blocked, so the signed-in avatar was not checked in the browser. Local client `01677217100` has a stored photo, so the navbar should show it after the API route is deployed and the client signs in again.

## Git

Uncommitted. Depends on `GET /api/v1/client-photo` and `photo` on `GET /api/v1/client-profile` in `isp-backend`.

Left untouched: dashboard usage card changes in `client-dashboard-content.tsx`, `client-dashboard-type.ts`, `use-client-dashboard-data.ts`, `ClientDashboardUsageCard.tsx`, and the `usage` keys in `public/lang/en.json` and `public/lang/bn.json`.
