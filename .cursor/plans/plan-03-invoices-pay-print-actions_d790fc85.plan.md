---
name: plan-03-invoices-pay-print-actions
overview: Complete the invoice migration by wiring real row actions (pay/print/delete), implementing invoice pay + discount flows, and providing print/export UX (browser print-ready receipt) with full i18n. Also bring the client invoice history page closer to old parity (filters + totals) so the invoice module is end-to-end migrated.
todos:
  - id: types-pay-and-discount
    content: Extend `components/invoices/invoice-type.ts` with `InvoicePaySchema`/`InvoicePayInput` and `InvoiceDiscountSchema`/`InvoiceDiscountInput` (strict Zod + translated validation messages).
    status: pending
  - id: invoice-pay-dialog
    content: Create `components/invoices/invoice-pay-dialog.tsx` (DialogWrapper + RHF + `useApiQuery` detail + `useApiMutation` PUT `invoices/pay/{id}`), showing invoice summary and pay fields; invalidate `invoices,clients` and enable print on success.
    status: pending
  - id: invoice-discount-dialog
    content: Create `components/invoices/invoice-discount-dialog.tsx` (DialogWrapper + RHF + `useApiMutation` PUT `invoice-discount/{uuid}`), and wire it into `bulk-invoice-pay-dialog.tsx` invoice list rows (and optionally invoice table rows).
    status: pending
  - id: invoice-receipt-and-print
    content: Create `components/invoices/invoice-receipt.tsx` and `components/invoices/invoice-print-dialog.tsx` using browser print-friendly markup (95mm-ish) and show company info from `useSettings()` when available.
    status: pending
  - id: wire-row-actions
    content: Update `components/invoices/invoice-row-actions.tsx` to include Pay/Print/Delete along with Edit, with correct permission gating and status rules; use `DeleteModal` for delete.
    status: pending
  - id: client-invoice-history-parity
    content: Add `components/invoices/client-invoice-filter-schema.ts` and extend `components/invoices/client-invoice-table.tsx` to support filters (and show totals via `InvoiceReports` if backend returns `reports`).
    status: pending
  - id: i18n-invoice-actions-pay-print
    content: Add required i18n keys for actions, pay dialog, discount dialog, print/receipt labels, and client history filters/titles to both `en.json` and `bn.json` with identical structure.
    status: pending
isProject: false
---

# plan-03-invoices-pay-print-actions-and-client-history

## Brief analysis of the remaining invoice responsibilities (old project)

From `C:/wamp64/www/isp-client/components/invoices/*` and invoice routes:

- **Pay**
  - Single pay page: `app/(dashboard)/invoices/pay/[Id]/page.tsx` fetches invoice and renders `components/invoices/invoice-pay.tsx`.
  - Pay modal: `components/invoices/invoice-pay-modal.tsx` (Flowbite Modal) fetches invoice (`GET /api/v1/invoices/{id}`) and submits pay (`PUT /api/v1/invoices/pay/{id}`), then enables print.
  - Bulk pay: `components/invoices/bulk-invoice-pay-modal.tsx` submits `POST /api/v1/invoices/bulk-pay`.
- **Discount**
  - `components/invoices/invoice-discount.tsx` applies extra discount via `PUT /api/v1/invoice-discount/{invoice.uuid}`.
- **Print**
  - `components/invoices/invoice-print.tsx` / `bulk-invoice-print.tsx` generate a small receipt PDF using `html2canvas` + `jspdf`.
- **Actions & permissions**
  - `invoice-list.tsx` shows edit/pay/print/delete actions gated by `usePermission("invoices.*")`.

Plan-01/02 migrated list + create/edit. This plan completes **pay + discount + print + row actions** in `shadcn-isp-client`.

## Target architecture (new project)

Extend `/components/invoices` following the standard architecture rules:

- `components/invoices/invoice-type.ts`
  - Add missing schemas/types for pay + discount.
- `components/invoices/invoice-row-actions.tsx`
  - Upgrade from edit-only to full action set (edit, pay, print, delete).
- `components/invoices/invoice-pay-dialog.tsx` (new)
  - shadcn dialog for paying an invoice (fetch details, validate, submit).
- `components/invoices/invoice-discount-dialog.tsx` (new)
  - shadcn dialog to apply additional discount.
- `components/invoices/invoice-print-dialog.tsx` + `invoice-receipt.tsx` (new)
  - print-ready receipt UI using browser print (no extra deps).

Optional (only if you need deep-link parity):

- `app/(dashboard)/invoices/pay/[id]/page.tsx` (new)

Client invoice history parity:

- Evolve `components/invoices/client-invoice-table.tsx` to support filters + totals like old `client-invoice.tsx` + `client-invoice-reports.tsx`.

## API endpoints to support (via `useFetch` / `useApiMutation`)

These map directly to backend `.../api/v1/...` because `useFetch` builds `${NEXTAPI_URL}/api/v1`.

- **Invoice pay**: `PUT /invoices/pay/{invoiceId}`
- **Bulk invoice pay** (already exists): `POST /invoices/bulk-pay`
- **Invoice discount**: `PUT /invoice-discount/{invoiceUuid}`
- **Invoice detail** (already exists): `GET /invoices/{invoiceId}`
- **Invoice delete**: `DELETE /invoices/{invoiceId}`

## Types to add/extend (strict, no `any`)

Update `C:/wamp64/www/shadcn-isp-client/components/invoices/invoice-type.ts`:

- **Pay schema**
  - `InvoicePayStatusSchema = z.enum(["paid", "partial_paid"])` (keep backend mapping consistent)
  - `InvoicePaySchema` fields (based on old `invoice-pay.tsx` / `invoice-pay-schema.ts`):
    - `fund_id: number (required)`
    - `payment_date: string (YYYY-MM-DD, required)`
    - `status: "paid" | "partial_paid"`
    - `partial_amount?: number` (required + > 0 when partial)
    - `transaction_id?: string | null`
    - `reference?: string | null`
    - `confirmation_sms: 0 | 1`
    - `note?: string | null`
  - Export `InvoicePayInput` type.
- **Discount schema**
  - `InvoiceDiscountSchema`:
    - `discount_amount: number (> 0)`
  - Export `InvoiceDiscountInput`.
- **(Optional) Receipt/print shape**
  - If `InvoiceDetailSchema` doesn’t include needed fields for receipt (e.g. `trackID`, `lines`, `after_discount_amount`, `amount_paid`, `amount_due`), extend it safely with optional fields and `.passthrough()`.

## New shadcn components (to implement)

### 1) `invoice-pay-dialog.tsx`

- **Trigger**: from invoice row actions when `hasPermission("invoices.pay")` and status is `due/partial`.
- **Data**: fetch invoice detail with `useApiQuery({ url:` invoices/${id}`, pagination:false })`.
- **Submit**: `useApiMutation({ url:` invoices/pay/${id}`, method:"PUT", invalidateKeys:"invoices,clients" })`.
- **UX**:
  - Show invoice summary (client, dates, totals) at top.
  - Show pay form fields (fund, payment date, status paid/partial, partial amount conditional, SMS toggle, note).
  - On success: close dialog and enable print action (same behavior as old modal).

### 2) `invoice-discount-dialog.tsx`

- **Trigger**: from bulk pay dialog line items (and optionally from invoice table rows).
- **Submit**: `useApiMutation({ url:` invoice-discount/${invoiceUuid}`, method:"PUT", invalidateKeys:"clients,invoices" })`.
- **Validation**: enforce max discount not exceeding remaining due (old UI computed this). Use `InvoiceRow`/`InvoiceDueItem` fields if available; otherwise validate on server error.

### 3) `invoice-receipt.tsx` + `invoice-print-dialog.tsx`

- **Goal**: replicate old receipt output without `html2canvas/jspdf` by using **browser print**.
- `invoice-receipt.tsx`:
  - Render compact receipt layout (95mm-friendly) with:
    - company header (from `useSettings()` where available; fallback to app name)
    - client name/phone
    - invoice id (trackID) and current date
    - line items table (description, qty, price, amount)
    - totals: subtotal, discount, paid, due/total
- `invoice-print-dialog.tsx`:
  - `DialogWrapper` showing the receipt component.
  - Add `ActionButton` “Print” that opens a print window for the receipt HTML and calls `window.print()`.

(If you later require auto-PDF download parity, add `html2canvas` + `jspdf` and an explicit download button—but this plan completes migration with print-ready output without new deps.)

## Wire actions into the invoice list

Update `C:/wamp64/www/shadcn-isp-client/components/invoices/invoice-row-actions.tsx`:

- **Edit**: keep existing logic for due/partial.
- **Pay**:
  - show when `hasPermission("invoices.pay")` and status is `due` or `partial`.
  - trigger `InvoicePayDialog`.
- **Print**:
  - show when `hasPermission("invoices.show")` and status is `paid` or `partial`.
  - trigger `InvoicePrintDialog`.
- **Delete**:
  - show when `hasPermission("invoices.delete")`.
  - use existing `DeleteModal` (`api_url: invoices/{id}`, `keys: "invoices"`).

Ensure buttons use `ActionButton` (not raw `Button`).

## Client invoice history parity (finish the module)

Old has a richer client history view with filters + summary totals (`client-invoice.tsx`, `client-invoice-reports.tsx`). In `shadcn-isp-client` we already have:

- `app/(dashboard)/invoices/client/[id]/page.tsx`
- `components/invoices/client-invoice-table.tsx`

In this plan:

- Add `components/invoices/client-invoice-filter-schema.ts` (similar to old `client-invoice-filter.ts` but in new FieldConfig style).
- Extend `components/invoices/client-invoice-table.tsx` to:
  - accept filter state and build params (track_id/date ranges/status)
  - call `useApiQuery` with `params: { client_id: id, ...filters }`
  - (if backend provides) display a summary totals card using the same `InvoiceReports` component from plan-01.

## Translation workflow (mandatory)

Add keys to BOTH:

- `C:/wamp64/www/shadcn-isp-client/public/lang/en.json`
- `C:/wamp64/www/shadcn-isp-client/public/lang/bn.json`

New key groups (examples):

- `invoice.actions.edit`, `invoice.actions.pay`, `invoice.actions.print`, `invoice.actions.delete`
- `invoice.pay.title`, `invoice.pay.submit`, `invoice.pay.success`
- `invoice.pay.fund.`*, `invoice.pay.payment_date.`*, `invoice.pay.status.*`, `invoice.pay.partial_amount.*`, `invoice.pay.confirmation_sms.*`, `invoice.pay.note.*`
- `invoice.discount.title`, `invoice.discount.submit`, `invoice.discount.success`, `invoice.discount.discount_amount.*`
- `invoice.print.title`, `invoice.print.print_button`
- `invoice.receipt.*` (company/client/labels: item, qty, price, amount, thank_you)
- `invoice.client_history.title` + filter placeholders

Keep nesting ≤ 3–4 levels deep and ensure en/bn structures are identical.

## Verification checklist

- Invoice table row actions show correctly per permission + status.
- Paying an invoice updates list state (invalidates `invoices`) and allows print.
- Bulk pay dialog still works; discount dialog updates due totals.
- Print dialog renders a clean receipt and browser print works.
- Client invoice history supports filters and shows totals when available.
- No hardcoded strings; no `any` introduced.

