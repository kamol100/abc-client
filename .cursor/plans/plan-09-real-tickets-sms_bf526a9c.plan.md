---
name: plan-09-real-tickets-sms
overview: Replace placeholders with real Tickets (list/create/details/reply) and real SMS Send (single-send with phone prefill), using existing shadcn patterns, strict Zod typing, permission gating, and i18n parity.
todos:
  - id: tickets-types
    content: Add `components/tickets/ticket-type.ts` with `TicketRowSchema`, `TicketDetailSchema`, `TicketCreateSchema`, and inferred types.
    status: pending
  - id: tickets-list-page
    content: Replace `app/(dashboard)/tickets/page.tsx` placeholder with a real page rendering `TicketTable`, honoring `searchParams.client_id`.
    status: pending
  - id: ticket-table
    content: Create `components/tickets/ticket-table.tsx` using `useApiQuery` + `DataTable`, with i18n column headers and permission-gated actions.
    status: pending
  - id: ticket-create-dialog
    content: Create `components/tickets/ticket-create-dialog.tsx` (DialogWrapper + form + POST `tickets`) and wire it into `/tickets` page; auto-open/prefill when `client_id` present.
    status: pending
  - id: ticket-view-page
    content: Add `app/(dashboard)/tickets/view/[id]/page.tsx` + `components/tickets/ticket-view.tsx` to fetch `tickets/{id}` and render meta + thread.
    status: pending
  - id: ticket-reply
    content: Add `components/tickets/ticket-reply-form.tsx` and a `/tickets/reply/[id]` page (or embed in view). Implement reply mutation against the backend’s reply endpoint once confirmed during implementation.
    status: pending
  - id: sms-types-form
    content: Add `components/sms/sms-send-type.ts` + `components/sms/sms-send-form.tsx`, and replace `app/(dashboard)/sms-send/page.tsx` placeholder to render the form with `?phone=` prefill and POST `sms-store`.
    status: pending
  - id: i18n
    content: Add all new tickets/sms i18n keys in both `public/lang/en.json` and `bn.json` with strict parity.
    status: pending
  - id: final-checks
    content: Run typecheck/lint/build and fix any introduced TS/lint issues.
    status: pending
isProject: false
---

## Goal

Implement **real Tickets + SMS Send** in `shadcn-isp-client`, replacing the current placeholders.

- Tickets: list + create ticket + ticket details view + reply thread (minimal but usable)
- SMS: single-send form that posts to queue, supports `?phone=` prefill

## Reference behavior (from `isp-client`)

- Tickets API base: `/api/v1/tickets`
- Ticket create payload (approx): `client_id`, `subject_id`, `tag_id[]`, `assigned_to`, `message`, `priority`, `status`
- SMS send endpoint: `POST /api/v1/sms-store`
- SMS send supports `?phone=` in URL to prefill

## Assumptions (documented defaults)

- Dropdown endpoints exist and return `{id, name}` arrays:
  - `/dropdown-clients`, `/dropdown-staffs` (already used in this repo)
  - `/dropdown-subjects`, `/dropdown-tags` (assumed; if backend differs, we’ll adapt to the actual dropdown endpoints)
- Tickets filtering from client context uses numeric `client_id` (because current client actions link to `/tickets?client_id={id}`). If backend expects `client_uuid`, we’ll switch the query param and keep the UI stable.

## Key files to add/change

### Pages

- Replace placeholder Tickets page:
  - `C:/wamp64/www/shadcn-isp-client/app/(dashboard)/tickets/page.tsx`
- Add ticket details page:
  - `C:/wamp64/www/shadcn-isp-client/app/(dashboard)/tickets/view/[id]/page.tsx`
- Add ticket reply page (or reuse view with reply form section):
  - `C:/wamp64/www/shadcn-isp-client/app/(dashboard)/tickets/reply/[id]/page.tsx`
- Replace placeholder SMS page:
  - `C:/wamp64/www/shadcn-isp-client/app/(dashboard)/sms-send/page.tsx`

### Components

- Tickets:
  - `C:/wamp64/www/shadcn-isp-client/components/tickets/ticket-type.ts` (Zod schemas + types)
  - `C:/wamp64/www/shadcn-isp-client/components/tickets/ticket-table.tsx` (list via `useApiQuery` + `DataTable`)
  - `C:/wamp64/www/shadcn-isp-client/components/tickets/ticket-create-dialog.tsx` (DialogWrapper + form + `useApiMutation`)
  - `C:/wamp64/www/shadcn-isp-client/components/tickets/ticket-view.tsx` (fetch ticket, show meta + messages)
  - `C:/wamp64/www/shadcn-isp-client/components/tickets/ticket-reply-form.tsx` (minimal reply form)
- SMS:
  - `C:/wamp64/www/shadcn-isp-client/components/sms/sms-send-type.ts` (Zod schema)
  - `C:/wamp64/www/shadcn-isp-client/components/sms/sms-send-form.tsx` (single-send)

### i18n

- Update both:
  - `C:/wamp64/www/shadcn-isp-client/public/lang/en.json`
  - `C:/wamp64/www/shadcn-isp-client/public/lang/bn.json`

Add keys for:

- `ticket.`*: titles, columns, create dialog fields (client/subject/tags/assign/message/priority/status), view/reply labels, success/error messages
- `sms_send.`*: form labels (phone, template, message), submit, success/error

## Implementation details

### Tickets list (`/tickets`)

- Client component uses `useApiQuery<PaginatedApiResponse<TicketRow>>()`:
  - `url: "tickets"`
  - `params` derived from `searchParams`:
    - `client_id` (or `client_uuid` if required)
- DataTable columns: ticketId, client, subject, tags, assigned staff, priority/status badges, created/updated, actions.
- Permission gating via `usePermissions().hasPermission`:
  - show list page if `tickets.access`
  - show Create button/dialog if `tickets.create`
  - show Reply if `tickets.reply`
  - show View if `tickets.show` (or fallback to `tickets.access` if permission naming is flat)

### Ticket create dialog

- DialogWrapper + `react-hook-form` with Zod resolver.
- Fields:
  - `client_id` (SelectDropdown `/dropdown-clients`, prefilled if `?client_id=` present)
  - `subject_id` (SelectDropdown `/dropdown-subjects`)
  - `tag_id` (SelectDropdown `/dropdown-tags`, `isMulti`)
  - `assigned_to` (SelectDropdown `/dropdown-staffs`, optional)
  - `message` (Textarea)
  - `priority` (Radio/select)
  - `status` (Radio/select, default `open`)
- Submit with `useApiMutation({ url: "tickets", method: "POST", invalidateKeys: "tickets" })`.

### Ticket view + reply

- `/tickets/view/[id]` fetches `GET tickets/{id}` and renders:
  - top meta (client/subject/status/priority/assigned)
  - message thread list (best-effort typed with `.passthrough()`)
- Reply:
  - minimal reply form posts to a reply endpoint if available.
  - If backend uses `POST /tickets/{id}/reply` or similar, we’ll match it. If unknown, implement UI + hook behind a single configurable endpoint constant in one place.

### SMS send (`/sms-send`)

- Single-send form only (no bulk client filtering in this plan):
  - `phone` (prefill from `searchParams.phone`)
  - optional `sms_template_id` (SelectDropdown `/dropdown-sms-templates` if available; otherwise omit)
  - `custom_message` textarea
- Submit to `useApiMutation({ url: "sms-store", method: "POST" })`.

## Verification

- `/tickets` loads and paginates.
- `/tickets?client_id=123` filters and optionally opens Create dialog with client preselected.
- Create ticket works and list invalidates.
- `/tickets/view/{id}` loads and shows messages.
- Reply posts successfully (or shows a clear error toast if endpoint is not available).
- `/sms-send?phone=…` prefills and sends successfully.
- No TypeScript errors introduced; no `any` used in new code.

