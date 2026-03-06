---
name: plan-02-invoices-create-edit
overview: Migrate invoice create/edit (including line items and totals) into `shadcn-isp-client` using strict Zod types, RHF, TanStack Query mutations, shadcn UI, and full i18n coverage. This unlocks real actions from the invoice list created in plan-01.
todos:
  - id: types-invoice-form
    content: Extend `components/invoices/invoice-type.ts` with `InvoiceLineSchema`, `InvoiceFormSchema`, `InvoicePayloadSchema`, and `InvoiceDetailSchema` (strict types + `.passthrough()` where appropriate).
    status: pending
  - id: invoice-form-schema-config
    content: Create `components/invoices/invoice-form-schema.ts` describing non-line fields (dates, dropdowns, status, payment fields, confirmation_sms, note) using translation keys.
    status: pending
  - id: invoice-lines-editor
    content: Create `components/invoices/invoice-lines-editor.tsx` using RHF `useFieldArray` with a clean mobile-first layout and aligned add/remove controls.
    status: pending
  - id: invoice-totals-component
    content: Create `components/invoices/invoice-totals.tsx` that derives totals from watched values (no setValue loops) and displays Sub Total/Discount/Total.
    status: pending
  - id: invoice-form-component
    content: Create `components/invoices/invoice-form.tsx` to render fields + lines + totals, validate with Zod resolver, and submit via `useApiMutation` to `POST/PUT invoices` with strict payload building.
    status: pending
  - id: routes-create-edit
    content: Add `app/(dashboard)/invoices/create/page.tsx` and `app/(dashboard)/invoices/edit/[id]/page.tsx` (server components) that render the form with metadata titles.
    status: pending
  - id: invoice-table-create-action
    content: Update `components/invoices/invoice-table.tsx` to include a permission-gated Create button linking to `/invoices/create`.
    status: pending
  - id: i18n-invoice-form
    content: Add all required `invoice.*` form keys to both `public/lang/en.json` and `public/lang/bn.json` with identical structure.
    status: pending
isProject: false
---

# plan-02-invoices-create-and-edit

## Brief analysis of the current invoice feature (old project)

- **Create/Edit entrypoints**:
  - `C:/wamp64/www/isp-client/app/(dashboard)/invoices/create/page.tsx` and `.../edit/[Id]/page.tsx` render `InvoiceForm`.
  - `C:/wamp64/www/isp-client/components/invoices/invoice-form.tsx` handles:
    - header fields (dates, invoice type, client, discount, status)
    - conditional payment fields (fund, payment_date) when status is paid/partial
    - **line items** editor (`invoice-lines.tsx`) using `useFieldArray`
    - totals summary (`invoice-total.tsx`) derived from lines + discounts
    - validation with Zod (`components/forms/schema/invoice.ts`)
    - submit via TanStack Query mutation (create: `POST /api/invoices`, edit: `PUT /api/invoices/{id}`)
- **Behavioral rules encoded in UI**:
  - When creating and status is `paid` or `partial_paid`, `fund_id` is required.
  - When status is `partial_paid`, `partial_amount > 0` is required.
  - Totals are derived: line totals, line discounts, overall discount, after-discount total.

## Target architecture in `shadcn-isp-client` (this plan)

Follow `migrate-feature.md` structure under `/components/invoices`.

- `components/invoices/invoice-type.ts`
  - Add **nested ref schemas**, **line schema**, **form schema**, **payload/output types**.
  - Keep `InvoiceRowSchema.passthrough()` for list/table.
- `components/invoices/invoice-form-schema.ts`
  - UI form field config for the non-line fields (dates, dropdowns, status, payment info, note).
- `components/invoices/invoice-lines-editor.tsx`
  - Custom line-item editor using RHF `useFieldArray` (table/grid layout) to match old UX.
- `components/invoices/invoice-totals.tsx`
  - Pure derived totals component (no API fields) that watches form values.
- `components/invoices/invoice-form.tsx`
  - Main form component:
    - uses `FormWrapper` or `react-hook-form` directly
    - uses `useApiMutation` for create/update
    - uses shadcn `ActionButton` and inputs (`input-field`, `textarea-field`, `DatePicker`, `SelectDropdown`)

Pages (server components by default):

- `app/(dashboard)/invoices/create/page.tsx`
- `app/(dashboard)/invoices/edit/[id]/page.tsx`

## New folder structure (added/updated in this plan)

- `C:/wamp64/www/shadcn-isp-client/components/invoices/`
  - `invoice-type.ts` (update)
  - `invoice-form-schema.ts` (new)
  - `invoice-form.tsx` (new)
  - `invoice-lines-editor.tsx` (new)
  - `invoice-totals.tsx` (new)
- `C:/wamp64/www/shadcn-isp-client/app/(dashboard)/invoices/create/page.tsx` (new)
- `C:/wamp64/www/shadcn-isp-client/app/(dashboard)/invoices/edit/[id]/page.tsx` (new)

## TypeScript types (strict) to add

Extend `components/invoices/invoice-type.ts`:

- **Line schema**
  - `InvoiceLineSchema`:
    - `description: string` (min length)
    - `amount: number` (gt 0)
    - `quantity: number` (int, gt 0)
    - `discount: number` (>= 0)
    - `order?: number`
    - `uuid?: string | null` (for editing existing lines)
  - `InvoiceLine` type
- **Form schema** (validation only)
  - `InvoiceFormSchema` containing:
    - `create_date`, `due_date`
    - `invoice_type_id`, `client_id`
    - `discount` (header-level discount)
    - `status: "due" | "paid" | "partial_paid"`
    - `partial_amount?`
    - `fund_id?`, `payment_date?`
    - `confirmation_sms` (0/1)
    - `note?`
    - `lines: InvoiceLine[]`
- **Payload schema** (what we POST/PUT)
  - `InvoicePayloadSchema` derived from `InvoiceFormSchema` plus computed totals if backend expects them:
    - `total_amount`
    - `line_total_discount`
    - `after_discount_amount`
  - Export:
    - `InvoiceFormInput` (z.input)
    - `InvoicePayload` (z.output)
- **Detail schema** (for edit hydration)
  - `InvoiceDetailSchema` extending `InvoiceRowSchema` with:
    - `lines: InvoiceLine[]`
    - payment refs if present (fund, etc.)
  - Keep `.passthrough()` for safety.

## API endpoints to use (new project)

Use `useApiMutation` + `useApiQuery` (which call `useFetch` server action):

- Create invoice: `POST /invoices`
- Update invoice: `PUT /invoices/{id}`
- Get invoice detail (for edit): `GET /invoices/{id}`

(These map to backend `.../api/v1/invoices...` via `app/actions.ts`.)

## UI/UX requirements (shadcn + mobile-first)

- Use shadcn form components already present:
  - `components/form/DatePicker.tsx`
  - `components/select-dropdown.tsx`
  - `components/form/input-field.tsx`, `textarea-field.tsx`, `radio-field.tsx`
  - `components/action-button.tsx`
- Line items editor:
  - Mobile: stacked card rows per line
  - Desktop: grid/table layout
  - Add/remove buttons aligned cleanly (per guideline note on dynamic list delete icon alignment)
- Totals:
  - Show Sub Total, Discount (line + header), Total (after discount)
  - Compute purely from current form values to avoid infinite watch/set loops.

## Wire invoice list toolbar action (small addition)

Update `components/invoices/invoice-table.tsx` to show a Create button in the toolbar if `hasPermission("invoices.create")`.

- Use `ActionButton` with `url="/invoices/create"`.

## Translation keys (en.json + bn.json additions)

Add under `invoice`:

- `invoice.create.title`, `invoice.edit.title`
- Field labels/placeholders:
  - `invoice.create_date.label`, `invoice.create_date.placeholder`
  - `invoice.due_date.label`, `invoice.due_date.placeholder`
  - `invoice.invoice_type.label`, `invoice.invoice_type.placeholder`
  - `invoice.client.label`, `invoice.client.placeholder`
  - `invoice.discount.label`, `invoice.discount.placeholder`
  - `invoice.status.label`
  - `invoice.partial_amount.label`, `invoice.partial_amount.placeholder`
  - `invoice.fund.label`, `invoice.fund.placeholder`
  - `invoice.payment_date.label`, `invoice.payment_date.placeholder`
  - `invoice.confirmation_sms.label`
  - `invoice.note.label`, `invoice.note.placeholder`
  - `invoice.lines.title`, `invoice.lines.add`, `invoice.lines.remove`
  - line fields: `invoice.line.description.`*, `invoice.line.amount.`*, `invoice.line.quantity.*`, `invoice.line.discount.*`
- Validation errors:
  - `invoice.fund.errors.required`
  - `invoice.partial_amount.errors.min`
  - `invoice.line.description.errors.required`
  - `invoice.line.amount.errors.min`
  - `invoice.line.quantity.errors.min`

Ensure identical key structure in both `en.json` and `bn.json` and use transliteration (e.g., “ইনভয়েস”, “পেমেন্ট”, “ডিসকাউন্ট”).

## Verification checklist

- `/invoices/create` can create an invoice, then redirects back to `/invoices` and invalidates `invoices` query.
- `/invoices/edit/[id]` loads existing invoice lines, allows edits, updates successfully.
- Totals match the old behavior for discount handling.
- No Flowbite usage; no hardcoded strings.
- Permissions respected for create/edit.

