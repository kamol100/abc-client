---
name: shadcn-client-agent
description: >-
  Build and extend the ISP admin/client frontend (Next.js 16 App Router,
  shadcn/ui, TanStack Query + Table, React Hook Form + Zod, i18n). Use for any
  shadcn-client feature work: CRUD modules, forms, tables, filters, pages,
  permissions, translations, or API wiring.
---

# shadcn-client — Agent Skill

## When this applies

Use this skill for **all** work in `shadcn-client`: new resources, forms, tables, pages, filters, menus, and i18n. Mirror an existing twin instead of inventing a new pattern.

**Simple CRUD twin:** `components/zones/` + `components/expense-type/`
**Accordion full-page twin:** `components/staffs/` + `components/clients/`
**Custom layout twin:** `components/invoices/invoice-form.tsx`
**Filtered list twin:** `components/payments/`

---

## Stack (non-negotiables)

- **Next.js 16** App Router, **React 19**, **TypeScript strict**. No `any` unless unavoidable and documented.
- **shadcn/ui** only (`@/components/ui/` + allowed `ui/*` subfolders). Do **not** install new UI libraries. Do **not** edit shadcn core files under `components/ui/`.
- **TanStack Query** via `useApiQuery` / `useApiMutation`. **TanStack Table** via `DataTable`.
- **React Hook Form + Zod** via `FormBuilder` / `AccordionFormBuilder`. Do not hand-roll forms unless FormBuilder cannot express the UI — then ask first.
- **i18n:** `react-i18next`. No hardcoded user-facing strings. Keys in both `public/lang/en.json` and `public/lang/bn.json`.
- **Imports:** always `@/` aliases, including same-directory. Never relative `../` or `./`.
- **Styling:** Tailwind only, theme tokens (`hsl(var(--…))`), `cn()` from `@/lib/utils`. Mobile-first. No inline styles.
- **Buttons:** `MyButton` from `@/components/my-button`, not `@/components/ui/button`. Prefer project wrappers (`Card`, `MyDialog`, `MyDrawer`, `FormTrigger`, `DeleteModal`) over raw shadcn.

---

## New feature module — checklist (order matters)

For a resource `widgets`:

1. **Types** — `{feature}-type.ts`: ref schemas, `WidgetRowSchema` (`.passthrough()`), `WidgetFormSchema` (validation only; no `id` / relations). Export `WidgetRow`, `WidgetFormInput`, `WidgetPayload`.
2. **Form field config** — `{feature}-form-schema.ts`: `FieldConfig[]` or `AccordionSection[]`. Labels/placeholders are i18n keys.
3. **Form** — `{feature}-form.tsx`: `MyDialog` + `FormBuilder` (simple) or `AccordionFormBuilder` / `fullPage` (complex).
4. **Columns** — `{feature}-column.tsx`: `ColumnDef<WidgetRow>[]`. Headers use i18n keys via `DataTableColumnHeader`.
5. **Table** — `{feature}-table.tsx`: `useApiQuery` + `DataTable`. Optional `{feature}-filter-schema.ts`.
6. **Page** — `app/(dashboard)/widgets/page.tsx`: thin Server Component + `metadata` via `t()` from `@/lib/i18n/server`.
7. **i18n** — add matching keys to `en.json` and `bn.json`.
8. **Menu** — if it is a nav item, add it in `hooks/use-menu-items.ts` (admin) or `hooks/use-client-menu-items.ts` (client portal) with the Spatie permission name.
9. **Permissions** — gate create/edit/delete with `usePermissions().hasPermission("widgets.create")` (permission **==** backend route name).

File map:

```
components/{feature}/{feature}-type.ts
components/{feature}/{feature}-form-schema.ts
components/{feature}/{feature}-form.tsx
components/{feature}/{feature}-column.tsx
components/{feature}/{feature}-table.tsx
components/{feature}/{feature}-filter-schema.ts   # optional
app/(dashboard)/{feature}/page.tsx
app/(dashboard)/{feature}/create/page.tsx         # full-page forms only
app/(dashboard)/{feature}/edit/[id]/page.tsx      # full-page forms only
hooks/use-menu-items.ts                           # if new nav item
public/lang/en.json
public/lang/bn.json
```

Keep related UI in the feature folder. Do not split every cell/dialog into its own file unless it is reused across features.

---

## Types (Zod)

```ts
export const WidgetRowSchema = z.object({
  id: z.coerce.number(),
  name: z.string(),
  zone: ZoneRefSchema.nullable().optional(),
}).passthrough();

export type WidgetRow = z.infer<typeof WidgetRowSchema>;

export const WidgetFormSchema = z.object({
  name: z.string({
    required_error: "widget.name.errors.required",
    invalid_type_error: "widget.name.errors.invalid",
  }).min(2, { message: "widget.name.errors.min" }),
  zone_id: z.coerce.number({
    required_error: "widget.zone.errors.required",
  }).min(1, { message: "widget.zone.errors.required" }),
});

export type WidgetFormInput = z.input<typeof WidgetFormSchema>;
export type WidgetPayload = z.output<typeof WidgetFormSchema>;
```

- Row schema = API list/show shape (includes relations). Form schema = submit payload only.
- Zod `message` / `required_error` values are **i18n keys**, not English copy.
- Nested API objects get small `*RefSchema` types (see `sub-zone-type.ts`).

---

## Forms

Always go through `FormBuilder`. Field types: `text | email | password | number | textarea | dropdown | radio | switch | checkbox | date | dateRange | geolocation | fieldArray`.

**Dialog CRUD** (zones, expense-types, tags):

```tsx
<MyDialog
  size="xl"
  title={mode === "create" ? "widget.create_title" : "widget.edit_title"}
  trigger={<FormTrigger mode={mode} />}
>
  <FormBuilder
    formSchema={WidgetFormFieldSchema()}
    grids={2}
    data={data}
    api="/widgets"
    mode={mode}
    schema={WidgetFormSchema}
    method={method}
    queryKey="widgets"
  />
</MyDialog>
```

**Accordion full-page** (staffs, clients): `AccordionFormBuilder` + `fullPage` + `onClose={() => router.push("/widgets")}`.

**Custom layout** (invoices): `FormBuilder` `children={(renderField) => …}` to place fields manually. Still pass `formSchema` + Zod `schema`.

FormBuilder / FormWrapper behavior you must not reimplement:

- Edit hydrates `GET /{api}/{id}` when `data` is incomplete (`hydrateOnEdit: "ifNeeded"` default). Passing `{ id }` is enough for dialogs.
- Edit submits `PUT /{api}/{id}`; create uses `POST {api}`.
- `queryKey` invalidates the list query after save. It must match the table `queryKey`.
- `dropdown` uses `api` + `valueMapping: { idKey, labelKey }`. Cascading selects use `dependsOn: { field, buildApi }`.
- Hide a field with `permission: false` (also used to omit create-only fields on edit).

Shared helpers belong in `lib/helper/helper.ts` (`objectToQueryString`, `parseApiError`, `toNumber`, `toApiDateString`, …).

---

## Tables

```tsx
const { data, isLoading, isFetching, setCurrentPage } =
  useApiQuery<PaginatedApiResponse<WidgetRow>>({
    queryKey: ["widgets"],
    url: "widgets",
    params,
  });

const rows = data?.data?.data ?? [];
const pagination = data?.data?.pagination;

<DataTable
  data={rows}
  columns={WidgetColumns}
  setFilter={setFilter}
  toggleColumns
  pagination={pagination}
  setCurrentPage={setCurrentPage}
  isLoading={isLoading}
  isFetching={isFetching}
  form={hasPermission("widgets.create") ? WidgetForm : undefined}
  toolbarOptions={{ filter: WidgetFilterSchema() }}  // optional
  toolbarTitle={pagination?.total
    ? `${t("widget.title")} (${pagination.total})`
    : t("widget.title")}
/>
```

API list envelope: `{ success, data: { data: T[], pagination } }` → items at `data.data.data`, pagination at `data.data.pagination`.

**Filters:** `{feature}-filter-schema.ts` returns `FieldConfig[]`. Pass as `toolbarOptions={{ filter }}`. Text fields that should auto-search use `watchForFilter: true` (debounce via `useFilterForm`). Date ranges serialize to `from,to`.

**Columns:** `DataTableColumnHeader` + i18n title keys. Actions: edit `WidgetForm mode="edit" data={{ id }}` + `DeleteModal` (`api_url`, `keys` = queryKey, confirm i18n keys). Use `cellIndex(rowIndex, pagination)` when showing row numbers.

---

## Pages & routing

Pages stay thin. `"use client"` lives in feature components, not in `page.tsx` unless the page itself is interactive.

```tsx
import WidgetTable from "@/components/widgets/widget-table";
import { t } from "@/lib/i18n/server";
import { Metadata } from "next";

export default async function WidgetsPage() {
  return <WidgetTable />;
}

export const metadata: Metadata = {
  title: t("widget.title"),
  description: t("widget.title"),
};
```

Route groups:

| Group | Path | Who |
|---|---|---|
| `app/(dashboard)/` | `/dashboard`, `/clients`, `/zones`, … | Staff admin |
| `app/(client-dashboard)/` | `/client/dashboard`, `/client/invoices`, … | Subscriber portal |
| `app/(public)/` | `/`, `/pricing`, `/pay`, … | Unauthenticated |
| `app/(client-auth)/` | `/client/login` | Client login |
| `app/admin` | `/admin` | Staff login (`/login` redirects here) |

Auth gate is `proxy.ts` (Next 16 proxy — there is no `middleware.ts`). Public paths: `lib/auth/public-routes.ts`.

Client-portal UI lives under `components/client-area/`. Do not mix admin and client tables unless they already share a component.

---

## Data fetching

- **Reads:** `useApiQuery` (`hooks/use-api-query.ts`). Server/layout fetches: `useFetch` from `app/actions.ts`.
- **Writes:** `useApiMutation` (`hooks/use-api-mutation.ts`) — toast + `invalidateKeys` + optional `redirectTo`. Prefer this over raw `fetch`.
- Transport: `useFetch` → `{NEXTAPI_URL}/api/v1{url}` with Sanctum Bearer from NextAuth session.
- Do not add new clients in `lib/api/api.ts` unless the call is public / special (company branding, no session).

---

## Permissions & menu

`usePermissions()` from `@/context/app-provider` (seeded by dashboard layout `GET /user-settings`).

```ts
const { hasPermission } = usePermissions();
hasPermission("widgets.create");
```

Permission names **must match backend route names** (`widgets.access`, `widgets.create`, `widgets.update`, `widgets.delete`). Super Admin is handled on the API; the UI still hides actions the user cannot do.

New nav item: `hooks/use-menu-items.ts` → `t("menu.{feature}.title")` + `permissions: ["widgets.access"]`. Client portal: `hooks/use-client-menu-items.ts`.

---

## i18n

Client: `const { t } = useTranslation()`. Server metadata: `import { t } from "@/lib/i18n/server"`. Form labels in field config are keys; `FormBuilder` translates them.

```json
"widget": {
  "title": "Widget",
  "title_plural": "Widgets",
  "create_title": "Add widget",
  "edit_title": "Edit widget",
  "delete_confirmation": "Delete this widget?",
  "name": {
    "label": "Name",
    "placeholder": "Enter name",
    "errors": { "required": "Name is required", "min": "Must be at least 2 characters" }
  }
}
```

Menu keys under `menu.{feature}.title`. snake_case keys, max 3–4 nesting levels. Every `en.json` key must exist in `bn.json` with the same shape. Bangla: transliterate technical terms (Invoice → ইনভয়েস, not a literal translation).

---

## UI conventions

- Prefer `@/components/card`, `@/components/my-button`, `@/components/my-dialog`, `@/components/my-drawer`, `@/components/form-trigger`, `@/components/delete-modal`.
- Do not add `mr-2` on icons inside `MyButton` — spacing is built in.
- Loading: table uses `DataTable` skeleton; form uses `FormLoader`; buttons use `MyButton` pending state. Do not invent a new spinner.
- Theme-aware classes only. Support light/dark and density tokens already on `<html>`.

---

## Testing

- Unit: Vitest — `tests/unit/**/*.test.{ts,tsx}` (`npm test`).
- E2E: Playwright — `tests/e2e/` (`npm run test:e2e`). Auth storage: `playwright/.auth/user.json`. Form helpers: `tests/e2e/helpers/forms.ts`.
- Add or update tests when you change a flow that already has coverage (auth, zones). New CRUD modules do not require a full Pest-style suite, but do not break existing e2e.

---

## Conventions to mirror

- Layout data: `app/(dashboard)/layout.tsx` loads `/user-settings` into `AppProvider`; client layout loads `/client-profile`.
- Query keys are plural API slugs: `"zones"`, `"expense-types"`, `"invoices"`.
- Dropdown endpoints: `/dropdown-{resource}` (e.g. `/dropdown-zones`, `/dropdown-staffs`).
- Shared field components: `components/form/*`. Form orchestration: `components/form-wrapper/*`.
- Never duplicate `objectToQueryString` / `parseApiError` — use `lib/helper/helper.ts`.

When unsure, open the nearest twin (`zones` for dialog CRUD, `staffs` for accordion pages, `payments` for filters, `invoices` for custom FormBuilder children) and match its structure.
