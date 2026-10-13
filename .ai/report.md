## Summary

The company table client column now uses the API `client_count` instead of the length of an empty clients list.

## Files changed

- `components/companies/companies-column.tsx`: the clients cell reads `client_count`.

## Behavior

A company with no counted clients shows 0. A company with clients shows the count returned by `GET /companies`.

## Tests

`scripts/ai/typecheck` passed.

The companies table was not opened in the browser. No dev server was running, and the page needs a signed-in session.

## Left untouched

`dashboard-breadcrumb.tsx`, `components/clients/client-row-actions.tsx`, `components/expenses/expense-type.ts`, `company-form-schema.ts`, `company-type.ts`, and the other language-file edits were already dirty and were not part of this change.
