## Summary

Staff can open My profile from the company menu and the reseller menu. The page shows their photo, or a person placeholder when they have none. Name and photo can be changed. The rest of the staff record is read only.

## Frontend

- My profile sits under Company Profile and Reseller Profile and goes to `/staff-profile`.
- The signed-in photo is loaded from `/api/staff-photo`, so the menu photo does not depend on the staff image permission.
- The name is shown with an edit icon. Edit opens the field with Save and Cancel, and either button closes that editor. Save stores the name. Cancel restores it.

## Checks

- `npx vitest run tests/unit/profiles/staff-account-page.test.tsx tests/unit/profiles/profile-avatar.test.ts` passed (7 tests).
- `scripts/ai/typecheck` passed.

## Browser

Signed in at `http://vp.isp.test` as the company user vp. `/staff-profile` shows the stored photo, the name field, Change photo, and Remove photo. Gender, phone, and email are text, not inputs. The user menu lists My profile under Company Profile. Saving the name to `vp profile` updated the sidebar, then the name was saved back to `vp`. The reseller menu was not opened because this login is a company user. A new photo was not uploaded.

## Security

The page does not send `company_id` or `reseller_id`. Name is the only text field submitted. Photo upload goes to the signed-in staff photo endpoint.
