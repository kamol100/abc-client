## Summary

The company profile menu uses the staff photo when one is stored. The image is loaded through the private staff photo URL. When there is no photo, the menu shows the initials fallback.

## Files

- `components/profiles/company-profile.tsx`
- `components/profiles/profile-avatar.ts`
- `types/app.ts`
- `tests/unit/profiles/profile-avatar.test.ts`

## Checks

`scripts/ai/typecheck` passed. `tests/unit/profiles/profile-avatar.test.ts` passed (2 tests).

On `http://vp.isp.test/clients`, the signed-in user has a staff photo. The navbar and the open profile menu both show that photo. The image request returned `200` `image/jpeg`.

## Git

Uncommitted. Earlier client-row action edits are still uncommitted in this working tree.
