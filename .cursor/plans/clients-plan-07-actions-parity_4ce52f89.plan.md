---
name: clients-plan-07-actions-parity
overview: "Add the next slice of client action parity: invoice history navigation, pay shortcut, SMS and tickets links, all permission-gated and i18n-safe; add minimal missing routes so these actions don’t 404."
todos:
  - id: client-actions-i18n
    content: "Add new i18n keys (en/bn parity): `client.actions.invoice_history`, `client.actions.pay`, `client.actions.sms`, `client.actions.tickets` (+ any page titles used)."
    status: pending
  - id: client-row-actions-extend
    content: Extend `components/clients/client-row-actions.tsx` to add Invoice History / Pay / SMS / Tickets items; gate all actions via `usePermissions().hasPermission`.
    status: pending
  - id: client-view-actions
    content: Add a compact action button group to `components/clients/client-view.tsx` (Edit, Change Package, Invoice History, Pay, Tickets, SMS), reusing existing dialogs and matching permission gating.
    status: pending
  - id: invoice-history-route
    content: Add `app/(dashboard)/invoices/client/[id]/page.tsx` with a minimal invoice list using `useApiQuery` + `DataTable` (assume `invoices?client_id={id}`; adjust if backend requires uuid).
    status: pending
  - id: pay-shortcut-prefill
    content: Update `app/(dashboard)/payments/create/page.tsx` (and/or `PaymentForm`) to accept `?client_id=` and prefill the form so the Clients “Pay” action is one click.
    status: pending
  - id: tickets-sms-minimal-routes
    content: Add minimal `app/(dashboard)/tickets/page.tsx` and `app/(dashboard)/sms-send/page.tsx` so client action links don’t 404; parse `client_id` / `phone` from `searchParams` and show a basic scaffold UI.
    status: pending
  - id: final-checks
    content: Run typecheck/lint/build; fix any introduced TS/lint issues.
    status: pending
isProject: false
---

## Goal

Extend the Clients action surface beyond plan-06 by adding the remaining high-value actions you have in `isp-client`: Invoice History, Pay, SMS, Tickets — with permission gating using the existing `usePermissions().hasPermission` and i18n parity.

## What exists today (confirmed)

- Clients row actions currently include: View, Edit, Reset Session, Change Package, Delete (with optional `mikrotik_delete=true`).
- Permissions infrastructure already exists via `AppProvider` (`hasPermission`) and the menu system (`hooks/use-menu-items.ts`).
- The routes for `/invoices`, `/tickets`, `/sms-send` **do not exist yet** in this repo, so any new navigation needs those pages added (even if minimal at first).

## Assumptions (documented defaults)

- The API can filter invoices by **client id** via `GET /invoices?client_id={id}`. If your backend only supports `client_uuid`, we’ll switch the query param to `client_uuid` (the UI/route structure remains the same).
- “Pay” will be implemented as a **shortcut into existing Payments flow** (prefill `client_id` on `/payments/create`) in this plan. Full “bulk invoice pay” modal parity can be a follow-up plan once invoice-due data + payload shape are confirmed.

## Key files to change/add

- Clients action UI:
  - `C:/wamp64/www/shadcn-isp-client/components/clients/client-row-actions.tsx`
  - `C:/wamp64/www/shadcn-isp-client/components/clients/client-view.tsx`
- New minimal routes:
  - `C:/wamp64/www/shadcn-isp-client/app/(dashboard)/invoices/client/[id]/page.tsx`
  - `C:/wamp64/www/shadcn-isp-client/app/(dashboard)/tickets/page.tsx` (minimal placeholder + query param parsing)
  - `C:/wamp64/www/shadcn-isp-client/app/(dashboard)/sms-send/page.tsx` (minimal placeholder + phone prefill)
- Payments shortcut:
  - `C:/wamp64/www/shadcn-isp-client/app/(dashboard)/payments/create/page.tsx` (accept `searchParams.client_id` and pass to `PaymentForm`)
- i18n:
  - `C:/wamp64/www/shadcn-isp-client/public/lang/en.json`
  - `C:/wamp64/www/shadcn-isp-client/public/lang/bn.json`

## Implementation notes

- Permission gating:
  - Use `const { hasPermission } = usePermissions()` and hide actions if missing.
  - Proposed permission strings (matching `isp-client` conventions):
    - View: `clients.show`
    - Edit: `clients.edit`
    - Delete: `clients.delete`
    - Invoice history: `invoices.access`
    - Pay shortcut: `payments.create` (or `invoices.pay` if you prefer)
    - SMS: `sms-send.access`
    - Tickets: `tickets.create`
- Invoice history page:
  - Use existing `useApiQuery` + `DataTable` patterns.
  - Start with a simple read-only list (no editing/printing in this plan).

## Verification

- Row actions show only permitted items.
- Invoice history route renders and loads invoices for a client.
- “Pay” opens the Payments create form with the correct client preselected.
- Tickets/SMS routes don’t 404 and accept query params (`client_id`, `phone`).
- Typecheck + lint pass after changes.

