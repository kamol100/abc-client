## Summary

The staff list name column now shows the login username under the staff name.

## Frontend

- `components/staffs/staff-column.tsx` reads `user.username` from the staff row and renders it as muted text under the capitalized name.
- The username stays as stored. Staff without a login show only the name.

## Checks

- Browser on `http://app.isp.test/staffs`: "Admin User" shows `admin`, and "Super Admin" shows `kamol`.
- Typecheck and unit tests were not run for this display-only change.

## Security

- The username is already returned by `StaffResource` for the authenticated staff list. No new field or request was added.
