## Summary

The login page links to `/forgot-password`. That form asks for an email and posts it, with the browser hostname, to the company-scoped reset API. The email link opens `/reset-password` with the token and email. A successful reset returns the user to login. It does not sign them in.

If the API says the email is missing for this company, the form shows: Email not found to reset password. Please contact your administrator.

## Files

- `components/login/login-form.tsx` — forgot-password link
- `components/login/password-reset-forms.tsx`
- `components/schema/password-reset.ts`
- `lib/auth/password-reset.ts`
- `lib/auth/public-routes.ts`
- `app/forgot-password/page.tsx`
- `app/reset-password/page.tsx`
- `public/lang/en.json`
- `public/lang/bn.json`
- `tests/unit/auth/login-form.test.tsx`
- `tests/unit/auth/password-reset.test.tsx`

## Checks

`npx vitest run tests/unit/auth/login-form.test.tsx tests/unit/auth/password-reset.test.tsx` passed (15 tests).

`scripts/ai/typecheck` passed.

In the browser, `/admin` shows **Forgot your password?** and opens `/forgot-password`. Empty and invalid emails show field errors. `missing@example.com` on this machine returned "Unable to determine the company for this request." because `localhost` is not a company domain here. `/reset-password` without a token shows the incomplete-link message. A link with a token and email shows the password form, rejects a mismatched confirmation, and does not display the token.

## Git

Branch `master`. This work is uncommitted.

Left untouched: `app/admin/page.tsx`, `app/api/staffs/`, `components/form/private-image-fields.tsx`, `components/staffs/staff-image-fields.tsx`, `lib/images/`, `tests/unit/images/`, `tests/unit/staffs/`.
