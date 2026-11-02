## Summary

My profile now shows the photo card, then two cards: Account information on the left and Account settings on the right. Removed profile fields are no longer shown. Address appears only when one exists.

## Frontend

- Dropped marital status, father's name, mother's name, social media, and job experience from the profile view.
- Address uses the present address when it exists, otherwise the permanent address. The address category is hidden when both are empty.
- Account information groups the remaining fields as Personal, Contact, Address, and Work.
- Account settings holds mobile search as a compact row: label, then Simple and Default. The always-open switch stays on the next row. Descriptive hints are not shown.
- English and Bangla labels: `staff_account.account_information` and `staff_account.account_settings`.

## Checks

- `npx vitest run tests/unit/profiles/staff-account-page.test.tsx` passed (8 tests).
- `scripts/ai/typecheck` passed.

## Browser

Signed in at `http://vp.isp.test` as vp. The two cards sit side by side. This account has no address, so the address category is hidden. Choosing Default saved, then Simple was selected again.

## Security

The page still sends only the settings group. It does not send `company_id` or `reseller_id`.
