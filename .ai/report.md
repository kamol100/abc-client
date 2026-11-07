## Summary

The demo request edit dialog now edits every fillable field, including a new username and password.

## Frontend

- `demo-request-status-form.tsx` sends full name, ISP name, email, website, phone, WhatsApp, user count, office address, terms accepted, status, username, and password.
- `demo-request-admin-form-field-schema.ts` and `demo-request-type.ts` match those fields.
- The details dialog shows username and password.
- English and Bangla strings are in `public/lang/en.json` and `public/lang/bn.json`.

## Checks

- `npx vitest run tests/unit/demo-request/demo-request-schema.test.ts`: 4 passed.
- `scripts/ai/typecheck`: passed.
- Browser: `http://isp.test/demo-requests`, signed in as Super Admin. The edit dialog opened with the existing row filled in, including username and password inputs. Saving `demo.user` / `demo-pass` failed because MySQL does not have the new columns yet. The row was not updated.

## Remaining

- Apply `2026_11_07_153600_add_username_and_password_to_demo_requests_table` on the API database, then save again.

## Unrelated working tree

Left as found: the public website field change in `demo-request-form.tsx` and `lib/validations/demo-request-schema.ts`, and `next.config.ts` (`demo.isp.test`, `mk.isp.test`).
