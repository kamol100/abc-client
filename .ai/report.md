## Summary

Opening Edit Role no longer calls `GET /api/v1/roles/{id}`. That route only allows PUT and DELETE, so the dialog failed with MethodNotAllowed. The roles list already returns `name`, which is the only field the form edits, so the dialog fills from that row.

## Files

- `components/roles/role-column.tsx` — pass the list row into the edit form
- `components/roles/role-form.tsx` — do not hydrate the edit form from a show endpoint

## Checks

`scripts/ai/typecheck` passed.

In the browser, signed in on `http://vp.isp.test/roles`:

- Edit on the Client row opened the Edit Role dialog with Role Name set to Client.
- The dialog did not show a failed-to-load state, and no `GET /roles/{id}` was issued.

## Git

This work is uncommitted.

Unrelated working-tree changes were left as they were: form-wrapper field-array files, staff form schema and tests, and `isp-backend` `app/Http/Resources/StaffResource.php`.
