## Summary

The admin Agents screen is a dialog CRUD page, matching invoice types for permissions and vendors for name, phone, and status filters. Agent status is the string `active` or `inactive`. Create, edit, and delete stay behind `agents.create`, `agents.edit`, and `agents.delete`.

## Files Changed

Created:

- `app/(dashboard)/agents/page.tsx`
- `components/agents/agent-type.ts`
- `components/agents/agent-form-schema.ts`
- `components/agents/agent-form.tsx`
- `components/agents/agent-filter-schema.ts`
- `components/agents/agent-column.tsx`
- `components/agents/agent-table.tsx`
- `tests/unit/agents/agent-form-schema.test.ts`
- `tests/unit/agents/agent-column.test.tsx`

Modified:

- `hooks/use-menu-items.ts` — Agents nav item after Resellers, permission `agents.access`
- `public/lang/en.json`
- `public/lang/bn.json`

## Tests

`scripts/ai/typecheck` — exit 0.

`scripts/ai/frontend-check` — exit 0. Vitest: 6 files, 14 tests.

ESLint was not run. `npm run lint` is already broken in this repo.

`/agents` redirected to `/admin?callbackUrl=%2Fagents` because that browser session is not logged in, so create, edit, delete, and the empty state were not confirmed on the page.

## Security

The menu and row actions use the backend route names. The API still enforces the permission and the company scope.

## Risks

The Agents menu stays hidden until the signed-in role has `agents.access`. The list query key is `agents`.

## Git Diff

Branch `master`. Unrelated untracked tests remain: `tests/unit/clients/` and `tests/unit/packages/`.
