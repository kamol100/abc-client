# Frontend architecture

Next.js 16 App Router, React 19, TypeScript strict (`tsconfig.json`). Tailwind 3. Path alias `@/*` → repo root.

## Route groups

| Group | Who |
|---|---|
| `app/(dashboard)/` | Staff admin (`/clients`, `/zones`, `/invoices`, …) |
| `app/(client-dashboard)/` | Subscriber portal (`/client/...`) |
| `app/(public)/` | Marketing and public pay |
| `app/(client-auth)/` | `/client/login` |
| `app/admin` | Staff login (`app/login` redirects here) |

Auth gate is `proxy.ts`. Public paths are `lib/auth/public-routes.ts`. There is no `middleware.ts`.

Dashboard layout loads `GET /user-settings` into `AppProvider`. Client layout loads `/client-profile`.

## Feature files

A resource usually looks like this (see `components/zones/` for dialog CRUD):

```text
components/{feature}/{feature}-type.ts
components/{feature}/{feature}-form-schema.ts
components/{feature}/{feature}-form.tsx
components/{feature}/{feature}-column.tsx
components/{feature}/{feature}-table.tsx
components/{feature}/{feature}-filter-schema.ts   # when the list is filtered
app/(dashboard)/{feature}/page.tsx
```

Full-page forms (staffs, clients) use `AccordionFormBuilder` and `create` / `edit/[id]` routes. Invoices place fields with `FormBuilder` `children`. Client-portal UI stays under `components/client-area/`.

## Data

- Reads: `useApiQuery` (`hooks/use-api-query.ts`).
- Writes: `useApiMutation` (`hooks/use-api-mutation.ts`).
- Server/layout fetches: `useFetch` from `app/actions.ts`.
- Do not add clients in `lib/api/api.ts` unless the call is public or has no session.

List hook data: items at `data?.data?.data`, pagination at `data?.data?.pagination`. Query keys are the API slug (`"zones"`, `"invoices"`). Dropdowns use `/dropdown-{resource}`.

## Forms and tables

`FormBuilder` field types include text, number, dropdown, date, dateRange, fieldArray, and the rest declared on `FieldConfig`. Zod messages are i18n keys. Edit submits `PUT /{api}/{id}`. `queryKey` must match the table so the list invalidates.

Tables use TanStack Table through `DataTable`. Default page size follows the API (`item_per_page` on the backend). Include sorting and filtering when the twin screen has them.

## i18n and theme

`useTranslation()` on the client. `t()` from `@/lib/i18n/server` for metadata. Keys in both `public/lang/en.json` and `public/lang/bn.json`.

Colors come from CSS variables. `next-themes` switches light and dark. Density tokens already live on `<html>`.

## Permissions and menu

`hasPermission("widgets.access")` matches the backend route name. Nav items: `hooks/use-menu-items.ts` (admin) and `hooks/use-client-menu-items.ts` (portal).

## Tests

Vitest config: `vitest.config.ts` (`tests/unit/**`). Playwright: `playwright.config.ts`, `tests/e2e/`. One unit file exists today (`tests/unit/auth/login-form.test.tsx`). New CRUD screens do not need a full e2e suite; do not break the tests that exist.
