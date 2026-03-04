---
name: clients-plan-08-invoice-pay-parity
overview: "Add real “Pay invoices” parity from client context: show due invoices, select which to pay, submit `/invoices/bulk-pay`, and refresh client/invoice data. Also fix Pay permission gating so the action reliably appears."
todos:
  - id: types-invoiceDue
    content: "Extend `components/clients/client-type.ts` to include an `invoiceDue?: InvoiceDueItem[]` field (strict Zod schema) and export a reusable `InvoiceDueItem` type."
    status: pending
  - id: invoice-type-uuid
    content: Update `components/invoices/invoice-type.ts` to include optional `uuid` (string) if present, so tables/dialog can identify invoices reliably.
    status: pending
  - id: bulk-invoice-pay-dialog
    content: Create `components/invoices/bulk-invoice-pay-dialog.tsx` (DialogWrapper + react-hook-form) showing due invoices with checkboxes, totals, fund dropdown (`/dropdown-funds`), payment date, status (paid/partial), optional partial amount, confirmation SMS toggle, note; submit with `useApiMutation` to `invoices/bulk-pay` and invalidate `clients,invoices`.
    status: pending
  - id: wire-pay-action
    content: Replace the current Pay link in `components/clients/client-row-actions.tsx` and `components/clients/client-view.tsx` with the new dialog trigger; gate using `hasPermission('invoices.pay')`; show only when there are due invoices (or allow opening and fetching fallback).
    status: pending
  - id: i18n-keys
    content: "Add required i18n keys (en/bn parity) for bulk-pay dialog: title, fields, status labels, totals, submit success/failure, empty-state (no due invoices)."
    status: pending
  - id: final-check
    content: Run typecheck/lint/build and fix any introduced TS/lint issues; confirm Pay visibility with realistic permissions.
    status: pending
isProject: false
---

## Goal

Replace the current Clients “Pay” shortcut with **invoice payment parity** (like `isp-client`): from the client row/view, open a dialog showing due invoices, allow selecting invoices, and submit a bulk pay request.

## Why this is needed (current state)

- `client-row-actions.tsx` and `client-view.tsx` currently gate “Pay” via `hasPermission("payments.create")` and route to `/payments/create?client_id=…`.
- There is no evidence `payments.create` is used elsewhere (sidebar/menu uses `payments.access` / `invoices.access`), so “Pay” may never appear.
- `isp-client` pays invoices via `POST /api/v1/invoices/bulk-pay` using `invoiceDue` (uuid-based).

## API expectations (from `isp-client`)

- Bulk pay endpoint: `POST /api/v1/invoices/bulk-pay`
- Payload shape:
  - `invoice_ids: string[]`
  - `fund_id: number`
  - `payment_date: string (YYYY-MM-DD)`
  - `status: "paid" | "partial"`
  - `partial_amount: number`
  - `confirmation_sms: 0 | 1`
  - `note?: string | null`

## Data source for due invoices

- **Primary**: reuse `clients/{id}` response if it already includes `invoiceDue` (common in `isp-client` and compatible with our `ClientRowSchema.passthrough()`), and type it explicitly in `components/clients/client-type.ts`.
- **Fallback** (if `invoiceDue` is absent): fetch `GET /invoices?client_id={id}&status=due` (or a backend-supported filter) inside the dialog.

## Key files to add/change

- Types:
  - `C:/wamp64/www/shadcn-isp-client/components/clients/client-type.ts`
  - `C:/wamp64/www/shadcn-isp-client/components/invoices/invoice-type.ts`
- New dialog:
  - `C:/wamp64/www/shadcn-isp-client/components/invoices/bulk-invoice-pay-dialog.tsx`
- Wire into UI:
  - `C:/wamp64/www/shadcn-isp-client/components/clients/client-row-actions.tsx`
  - `C:/wamp64/www/shadcn-isp-client/components/clients/client-view.tsx`
- i18n:
  - `C:/wamp64/www/shadcn-isp-client/public/lang/en.json`
  - `C:/wamp64/www/shadcn-isp-client/public/lang/bn.json`

## Permission gating (proposed)

- Show “Invoice History” if `invoices.access`.
- Show “Pay” if `invoices.pay` (primary). If your backend only provides `payments.`*, we’ll map accordingly, but **default** is `invoices.pay` to match `isp-client` semantics.

## Verification

- From client row and client view, clicking **Pay** opens the dialog.
- Dialog lists due invoices (from `invoiceDue` or fallback query), totals update as selections change.
- Submit calls `POST /invoices/bulk-pay` and on success invalidates/refreshes:
  - `clients` (and `clients/detail`)
  - `invoices` (client invoices table)
- No `any` introduced; payload and due-invoice items are typed.

