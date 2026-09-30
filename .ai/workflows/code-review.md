# Code review workflow

Review `scripts/ai/diff`. Pair API changes with `isp-backend/.ai/workflows/code-review.md`.

## Security

- Request body includes `company_id`, `reseller_id`, or a network id the user typed, used to reach another tenant.
- Permission string does not match the backend route name, or a destructive action is shown with no `hasPermission` check.
- Tokens or passwords are logged, stored in `localStorage` outside the existing auth helpers, or rendered in the UI.

## Frontend

- `any`, relative imports, or a new UI dependency.
- Edits under `components/ui/` that the task did not ask for.
- Missing loading and error states on a new query or mutation.
- Hardcoded user-facing English, or a key added to only one language file.
- Colors that ignore light/dark tokens. Layout that only works at desktop width.
- Interactive control with no accessible name (icon-only button without a label).

## General

- Unrelated files, `console.log`, commented-out JSX, unused imports.
- API shape assumed instead of read from the Laravel resource.
- Checks not run. Do not treat a clean story as a clean typecheck.
