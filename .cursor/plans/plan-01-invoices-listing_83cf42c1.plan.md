---
name: plan-01-invoices-listing
overview: Migrate the core invoice listing + reporting UI from `isp-client` into `shadcn-isp-client` using the standard feature architecture (types, filters, columns, table, i18n). This establishes the foundation for create/edit/pay/print in plans 02–03.
todos:
  - id: old-audit-invoices-list
    content: Confirm the invoice list API response shape (especially `reports` and nested refs) by reviewing existing backend responses or nearby migrated features using similar `PaginatedApiResponse` patterns; align `InvoiceRowSchema` + `InvoiceReportsSchema` accordingly.
    status: pending
  - id: types-invoice-foundation
    content: Expand `components/invoices/invoice-type.ts` to include strict Zod schemas for `InvoiceRow`, nested refs, and `InvoiceReports` (with `.passthrough()` for rows).
    status: pending
  - id: invoice-filter-schema
    content: Create `components/invoices/invoice-filter-schema.ts` using `FieldConfig[]` (date ranges, dropdowns for zone/type/staff/client, status options) with translation-key placeholders.
    status: pending
  - id: invoice-columns
    content: Create `components/invoices/invoice-column.tsx` with TanStack column definitions and translated headers; add a basic actions column placeholder (full actions wired in later plans).
    status: pending
  - id: invoice-reports-component
    content: Create `components/invoices/invoice-reports.tsx` (shadcn-styled totals bar) and wire it to list response `reports`.
    status: pending
  - id: invoice-table-component
    content: Create `components/invoices/invoice-table.tsx` using `useApiQuery` + `DataTable`, supporting pagination and filter params derived from filterValue.
    status: pending
  - id: routes-invoices-and-reports
    content: Add `app/(dashboard)/invoices/page.tsx` and `app/(dashboard)/reports/invoices/page.tsx` with metadata titles and render the invoice table.
    status: pending
  - id: i18n-invoice-listing
    content: Add en/bn translation keys for invoice listing columns, filters, report labels, and page titles; ensure identical key structure in both JSON files.
    status: pending
isProject: false
---

# plan-01-invoices-listing-and-reporting

## Brief analysis of the current invoice feature (old project)

- **Primary entrypoints**:
  - `C:/wamp64/www/isp-client/app/(dashboard)/invoices/content.tsx`: renders header (totals + count), filter form, and `InvoiceList`.
  - `C:/wamp64/www/isp-client/components/invoices/invoice-list.tsx`: TanStack Query list fetch (`GET /api/v1/invoices`), Flowbite table UI, in-row actions.
  - `C:/wamp64/www/isp-client/components/invoices/invoice-reports.tsx`: renders totals summary from list response `reports`.
- **Responsibilities**:
  - **List + filter** invoices (server provides `pagination` + `reports`).
  - **Permission-gated actions** (edit/pay/print/delete) via `usePermission("invoices.*")`.
  - **Reporting** is a byproduct of list API: response includes `reports` totals.
- **Key API usage (old)**:
  - List: `GET /api/v1/invoices?page=...&...filters` (see `invoice-list.tsx`).
  - Delete: `DELETE /api/v1/invoices/{id}` (via `DeleteItem`).
  - Pay entrypoint from list: `GET /api/v1/clients/{uuid}` to obtain `invoiceDue` and then bulk-pay.

## Target architecture in `shadcn-isp-client` (this plan only)

Implement the list/report portion following `migrate-feature.md` structure.

- `components/invoices/invoice-type.ts`
  - Zod schemas + exported types.
  - Must include `RowSchema.passthrough()` to tolerate backend fields.
- `components/invoices/invoice-filter-schema.ts`
  - Filter field config using the same pattern as `components/tj-box/tj-box-filter-schema.ts`.
- `components/invoices/invoice-column.tsx`
  - TanStack columns (header uses `DataTableColumnHeader` with translation keys).
- `components/invoices/invoice-table.tsx`
  - `DataTable` + `useApiQuery` fetching `invoices` with params derived from filter state.
- `components/invoices/invoice-reports.tsx`
  - shadcn-styled totals bar (no Flowbite).
- Routes
  - `app/(dashboard)/invoices/page.tsx`
  - `app/(dashboard)/reports/invoices/page.tsx` (reuse the same table so reports page matches old behavior)

## New folder structure (added/updated in this plan)

- `C:/wamp64/www/shadcn-isp-client/components/invoices/`
  - `invoice-type.ts` (update/expand)
  - `invoice-filter-schema.ts` (new)
  - `invoice-column.tsx` (new)
  - `invoice-reports.tsx` (new)
  - `invoice-table.tsx` (new)
- `C:/wamp64/www/shadcn-isp-client/app/(dashboard)/invoices/page.tsx` (new)
- `C:/wamp64/www/shadcn-isp-client/app/(dashboard)/reports/invoices/page.tsx` (new)

## Types and API contracts to define (minimal but strict)

In `components/invoices/invoice-type.ts`:

- **Ref schemas** (nested objects used in list rows):
  - `ClientRefSchema` (id, uuid?, name?)
  - `ZoneRefSchema` (id, name?)
  - `InvoiceTypeRefSchema` (id, name?)
- **Reports schema**:
  - `InvoiceReportsSchema` with fields observed in old UI: `total_amount`, `discount`, `after_discount_amount`, `amount_paid` (all `number | null | undefined` coerced to number where useful)
- **Row schema**:
  - `InvoiceRowSchema.passthrough()` containing at least:
    - `id: number`
    - `uuid?: string`
    - `trackID?: string | null`
    - `create_date?: string | null`
    - `due_date?: string | null`
    - `status?: string | null`
    - `total_amount?: number | null`
    - `after_discount_amount?: number | null`
    - `amount_paid?: number | null`
    - `discount?: number | null`
    - `line_total_discount?: number | null`
    - `note?: string | null`
    - `client?: ClientRef`
    - `zone?: ZoneRef`
    - `invoice_type?: InvoiceTypeRef`
- **List response type** (what `useApiQuery` returns):
  - A typed wrapper for `data.pagination` and `data.reports` if present in the backend response.

## UI migration details (list + reports)

- **Filter toolbar** (`invoice-filter-schema.ts`):
  - create date (range)
  - due date (range)
  - zone dropdown (`/dropdown-zones`)
  - invoice type dropdown (`/dropdown-invoice-types` or the backend equivalent)
  - created by dropdown (`/dropdown-staffs` or backend equivalent)
  - client dropdown (`/dropdown-clients`)
  - status options: due/paid/partial
- **Table** (`invoice-table.tsx`):
  - Mirror `components/tj-box/tj-box-table.tsx` pattern:
    - keep `filterValue` in state
    - derive `params` using `URLSearchParams`
    - call `useApiQuery({ url: "invoices", queryKey: ["invoices"], params })`
  - Extract `reports` from response and pass to `invoice-reports.tsx`.
- **Columns** (`invoice-column.tsx`):
  - Columns should match old semantics:
    - invoice id (trackID)
    - created date, due date
    - type, client, zone
    - note (truncate + tooltip)
    - amount (display total and optionally paid; exact paid/partial rendering can be deferred to plan 03)
    - status as `Badge`
    - actions column: keep as a placeholder or include only safe actions in this plan (edit/delete/pay/print will be fully implemented in plans 02–03).

## Translation workflow (mandatory)

Add invoice list/report keys to both:

- `C:/wamp64/www/shadcn-isp-client/public/lang/en.json`
- `C:/wamp64/www/shadcn-isp-client/public/lang/bn.json`

Proposed key groups:

- `invoice.title_plural`
- `invoice.invoice_id`, `invoice.date_created`, `invoice.date_due`, `invoice.type`, `invoice.client`, `invoice.zone`, `invoice.note`, `invoice.amount`, `invoice.status`
- `invoice.reports.sub_total`, `invoice.reports.discount`, `invoice.reports.total`, `invoice.reports.paid`
- `invoice.filter.`* placeholders (mirror filter schema names)

## Common pitfalls to avoid

- Do not introduce `any` types; keep `RowSchema.passthrough()` to tolerate extra backend fields.
- Ensure all table headings/labels are translation keys (no hardcoded strings).
- Ensure params mapping matches backend (`client_id` vs `client_uuid`, `trackID` vs `track_id`).

## Verification checklist

- `/invoices` route renders and loads invoice data.
- Filter toolbar updates the query params and refreshes table.
- Reports summary renders from API `reports` when present.
- All UI uses shadcn components (no Flowbite).
- All strings are translated with en/bn parity.

