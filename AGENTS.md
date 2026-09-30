# ISP Frontend — Agent Constitution

This file is the entry point for AI agents working in `shadcn-client`. It is a Next.js 16 App Router admin and client portal (React 19, TypeScript strict) for the ISP API. The Laravel API is a **sibling repository** (`isp-backend`), not a folder in this repo.

When this file or `.cursor/skills/agent/SKILL.md` disagrees with the source, trust the source, then this file.

## Lifecycle

```text
Understand → Investigate → Plan → Implement → Test → Review → Report
```

Load context in this order:

1. This file.
2. `.ai/workflows/` for the task type.
3. `.cursor/skills/agent/SKILL.md` when adding or changing a CRUD screen.
4. `isp-backend/.ai/tenancy.md` when the screen sends or displays company- or reseller-scoped data (sibling checkout).
5. The nearest feature folder under `components/` and its page. Do not load the whole `components/ui` tree.

## Frontend rules

- Follow the App Router layout already in `app/`. Pages stay thin. Interactive code lives in `components/{feature}/`.
- TypeScript strict. Do not introduce `any` unless it is unavoidable and the reason is written next to it.
- Reuse `FormBuilder`, `AccordionFormBuilder`, `DataTable`, `useApiQuery`, `useApiMutation`, `MyButton`, `MyDialog`, `MyDrawer`, `Card`, `FormTrigger`, and `DeleteModal` before adding a component.
- Do not edit shadcn primitives in `components/ui/` unless the task explicitly says to. Do not install another UI kit.
- Preserve existing behavior while changing UI. Support light and dark themes with Tailwind tokens (`hsl(var(--…))`) and `cn()` from `@/lib/utils`. No inline styles.
- User-facing strings go through `react-i18next`. Add the same keys to `public/lang/en.json` and `public/lang/bn.json`. Form labels are translation keys.
- Imports use the `@/` alias, including same-directory imports.
- Permission checks use `usePermissions().hasPermission("route.name")`. The string must match the backend route name.
- Buttons: `MyButton` from `@/components/my-button`. Do not add `mr-2` on icons inside buttons.

## Backend boundary

The API envelope is `{ success, status, data }`. Lists are `data.data.data` plus `data.data.pagination`. Transport is `useFetch` → `{NEXTAPI_URL}/api/v1` with the Sanctum token from NextAuth.

Do not invent endpoints. If a field is missing, check the Laravel resource before changing the UI to guess.

Tenant and reseller filtering is enforced by the API. The UI still hides actions the user cannot perform. Do not send `company_id` as a writable field to hop tenants.

## Testing and checks

- Unit: Vitest, `tests/unit/**/*.test.{ts,tsx}`, via `scripts/ai/test`.
- Types: `scripts/ai/typecheck` (`tsc --noEmit`). This passes on the current tree.
- Unit: `scripts/ai/test` (`vitest run`).
- Combined: `scripts/ai/check` or `scripts/ai/frontend-check` (typecheck, then unit).
- `npm run lint` and `scripts/ai/lint` do not currently succeed. Next 16 removed `next lint`, and `eslint.config.mjs` crashes ESLint 9. Do not rebuild that config unless lint is the task. Playwright (`npm run test:e2e`) needs a browser, auth storage, and a running app. Do not start it unless the task is an e2e change.
- Do not claim a command passed unless you ran it.

## Git

Before editing: `scripts/ai/status`. After editing: `scripts/ai/diff` and `scripts/ai/status`.

Leave unrelated working-tree changes alone and name them in the report. Never `git reset --hard`, `git clean`, or force-push unless the user explicitly approves that command.

## Human approval

Required for `npm install`, new dependencies, production env changes, deploy, and `git push`. This repo has no database. Do not run Laravel Artisan from here.

## Finish

End every task with the report in `.ai/report.md`.
