## Summary

The client menu now opens My profile at `/client/profile`. The page shows the subscriber record as read-only and lets them change only their profile photo. Upload and remove use `POST` and `DELETE /api/v1/client-photo`, which store the file through the existing client image service.

## Files

- `app/(client-dashboard)/client/profile/page.tsx`
- `components/client-area/client-account-page.tsx`
- `components/client-area/client-account-type.ts`
- `components/client-area/client-profile.tsx`
- `components/client-area/client-sidebar.tsx`
- `components/client-area/client-top-navbar.tsx`
- `lib/auth/routes.ts`
- `public/lang/en.json`
- `public/lang/bn.json`
- `tests/unit/client-area/client-account-page.test.tsx`

## Checks

`npx vitest run tests/unit/client-area/client-account-page.test.tsx`: 3 passed.

`scripts/ai/typecheck`: passed.

Browser on `http://vp.isp.test`: signed in as the subscriber, opened My profile from the avatar menu, and confirmed name, phone `01677217100`, package Home 10 Mbps, and the photo controls. Other fields are text, not inputs. Light, dark, and a phone-width layout were checked. The live photo was not replaced.

## Git

Uncommitted. Left untouched: dashboard live-speed work in `ClientDashboardInfo.tsx`, `client-speed-widget.tsx`, and `tests/unit/clients/client-speed-widget.test.tsx`. `client-profile.tsx` and the language files already had those earlier edits.

## Security

The page does not send `company_id`. Photo upload goes to the authenticated client endpoint only. Passwords are not rendered.
