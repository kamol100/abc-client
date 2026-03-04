---
name: clients-migration-plan-01
overview: Plan-01 stabilizes the existing partial Clients feature in shadcn-isp-client so it follows the migration guide (types, i18n, metadata, ActionButton) and becomes a safe base for later parity steps.
todos:
  - id: types-client-type
    content: Create `components/clients/client-type.ts` with RowSchema/FormSchema + exported types (no any)
    status: pending
  - id: clients-columns-typed-i18n
    content: Refactor `client-column.tsx` to use `ClientRow`, remove `any`/User coupling, and translate status labels
    status: pending
  - id: clients-table-i18n-actionbutton
    content: Refactor `client-table.tsx` to use `ActionButton` and remove hardcoded strings; use `ClientRow` type
    status: pending
  - id: clients-page-metadata
    content: Add server-side metadata title to `app/(dashboard)/clients/page.tsx`
    status: pending
  - id: i18n-client-titleplural
    content: Add `client.title_plural` (and optional create/edit/delete keys) to both `public/lang/en.json` and `bn.json` with strict parity
    status: pending
isProject: false
---

# plan-01 — Stabilize Clients scaffold (types + i18n + metadata)

## Goal

Make the existing Clients pages/components in `shadcn-isp-client` compile cleanly under strict TypeScript and follow the migration guide’s i18n + structure rules, without yet migrating the large “full parity” sub-features (view page widgets, status toggles, session reset, online status, etc.).

## Why this is needed (current gaps)

- **Hardcoded UI strings** in the table/columns (violates guide). Example:

```48:57:C:\wamp64\www\shadcn-isp-client\components\clients\client-table.tsx
            <Plus /> Add
          </>
        )}
      </Button>
    </Link>
  );

  const toolbarTitle = pagination?.total
    ? `Clients (${pagination.total})`
    : "Clients";
```

- **Wrong types + `any`** in columns (violates guide + your TS rule). Example:

```7:15:C:\wamp64\www\shadcn-isp-client\components\clients\client-column.tsx
import { DataTableColumnHeader } from "../data-table/data-table-column-header";
import { User } from "../users/user-type";
import { Badge } from "../ui/badge";

export const ClientColumns: ColumnDef<User>[] = [
```

- `**app/(dashboard)/clients/page.tsx` lacks metadata title** (inconsistent with other migrated features).

## Scope (what changes in plan-01)

- **Keep**: route locations and existing `components/clients/*` footprint.
- **Change**:
  - **Types**: introduce proper Clients domain types (no `Record<string, unknown>`, no `User`, no `any`).
  - **i18n**: remove hardcoded strings and add only the missing translation keys (with en/bn parity).
  - **UX consistency**: use `ActionButton` instead of raw `Button` in feature CTA (per guide).
  - **Page metadata**: add server-side metadata title using `lib/i18n/server`.

## Out of scope (deferred to later plans)

- Migrating `isp-client/components/clients/*` subcomponents (list row widgets like online status, session reset, change package, etc.).
- Client View page parity (`/clients/view/[id]`) and its cross-feature links (tickets/invoices).
- Edit page (`/clients/edit/[id]`) and advanced create/edit behaviors (unique checks, geolocation, fiber product behavior).

## Roadmap (future sequential plans, high-level)

- **plan-02**: Replace current minimal Clients table/filters with parity-oriented list structure (migrate list row subcomponents + list mutations: status toggle, session reset, online status). Produces: `components/clients/client-*-cell.tsx` (or equivalent) + API mutation wiring via `useApiMutation`.
- **plan-03**: Migrate create/edit form parity (accordion sections, dropdowns, unique checks, fiber product, geolocation). Produces: finalized `client-form-schema.ts` + `client-form.tsx` behavior parity.
- **plan-04**: Migrate client view page parity (`/clients/view/[id]`) including history table and any safe integrations with tickets/invoices (or temporary stubs).
- **plan-05**: Cleanup/orphans + finalize routes/actions (delete client, change package, any remaining widgets), remove dead/incorrect code paths.

## Implementation plan

### 1) Add Clients domain types following the migration guide

- Create `**[C:\wamp64\www\shadcn-isp-client\components\clients\client-type.ts](C:\wamp64\www\shadcn-isp-client\components\clients\client-type.ts)`**.
- Follow the guide’s pattern:
  - `**ClientRowSchema`**: represents list rows returned by `GET /clients`; must be `.passthrough()`.
  - `**ClientFormSchema`**: validation-only for create/edit payload (exclude response-only/relational fields).
  - Export types: `**ClientRow**`, `**ClientFormInput**`, `**ClientPayload**`.
- Either:
  - **Option A (preferred)**: keep `client-zod-schema.ts` only as a thin re-export to avoid churn, but source of truth becomes `client-type.ts`.
  - **Option B**: migrate `ClientSchema` into `client-type.ts` and remove/replace `client-zod-schema.ts` usage.

### 2) Fix `ClientColumns` to use `ClientRow` and eliminate `any`

- Update `**[C:\wamp64\www\shadcn-isp-client\components\clients\client-column.tsx](C:\wamp64\www\shadcn-isp-client\components\clients\client-column.tsx)`**:
  - Change `ColumnDef<User>[]` → `ColumnDef<ClientRow>[]`.
  - Remove the `roles` column (it appears copied from Users; clients feature parity will be added in plan-02).
  - Use only columns we can type safely now: `name`, `phone`, `pppoe_username`, `ip_address`, `status`.
  - Replace hardcoded `Active/Inactive` with `t("common.active") / t("common.inactive")`.
  - Actions column should render an `ActionButton` in a non-breaking way:
    - For now, either **no-op** (disabled) or link to `/clients/create` until edit/view routes are migrated.

### 3) Fix `ClientTable` hardcoded strings + CTA button consistency

- Update `**[C:\wamp64\www\shadcn-isp-client\components\clients\client-table.tsx](C:\wamp64\www\shadcn-isp-client\components\clients\client-table.tsx)`**:
  - Replace `Button` usage with `ActionButton` (guide: ActionButton over Button).
  - Replace hardcoded `Add` and `Clients` strings:
    - Button label: `t("common.add")`
    - Toolbar title: `t("client.title_plural")` and `t("client.title_plural") + (total)`.
  - Replace `type ClientRow = Record<string, unknown>` with the real `ClientRow` import.

### 4) Add metadata title for `/clients`

- Update `**[C:\wamp64\www\shadcn-isp-client\app\(dashboard)\clients\page.tsx](C:\wamp64\www\shadcn-isp-client\app\(dashboard)\clients\page.tsx)`** to match migrated feature pattern:
  - Add `export const metadata` with `title: t("client.title_plural")` using `t` from `lib/i18n/server`.

### 5) i18n: add missing keys with strict en/bn parity

- Update both:
  - `**[C:\wamp64\www\shadcn-isp-client\public\lang\en.json](C:\wamp64\www\shadcn-isp-client\public\lang\en.json)`**
  - `**[C:\wamp64\www\shadcn-isp-client\public\lang\bn.json](C:\wamp64\www\shadcn-isp-client\public\lang\bn.json)**`
- Add (minimum) keys:
  - `client.title_plural`
  - (Optional but recommended for later plans) `client.create_title`, `client.edit_title`, `client.delete_confirmation`
- Ensure:
  - **No new hardcoded strings** remain in the touched Clients files.
  - **Key structure is identical** in `en.json` and `bn.json`.
  - Bangla values follow your existing transliteration style.

## Verification checklist (after executing plan-01)

- `/clients` renders without runtime errors.
- No TypeScript errors from `components/clients/`* (no `any`, no incorrect `User` coupling).
- No hardcoded strings in `client-table.tsx` / `client-column.tsx`.
- `app/(dashboard)/clients/page.tsx` exports metadata title.
- `en.json` and `bn.json` remain structurally in sync for the new keys.

