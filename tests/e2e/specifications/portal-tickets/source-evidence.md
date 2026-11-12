# Source evidence — portal-tickets

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(client-dashboard)/client/tickets/[id]/page.tsx`
- `app/(client-dashboard)/client/tickets/page.tsx`
- `components/client-area/tickets/client-ticket-columns.tsx`
- `components/client-area/tickets/client-ticket-filter-schema.ts`
- `components/client-area/tickets/client-ticket-form-schema.ts`
- `components/client-area/tickets/client-ticket-form.tsx`
- `components/client-area/tickets/client-ticket-message-thread.tsx`
- `components/client-area/tickets/client-ticket-reply-form.tsx`
- `components/client-area/tickets/client-ticket-row-actions.tsx`
- `components/client-area/tickets/client-ticket-type.ts`
- `components/client-area/tickets/client-ticket-view.tsx`
- `components/client-area/tickets/client-tickets-table.tsx`

## Observed permission checks

- None extracted; inspect page, shared components and dynamic configuration.

## Observed API templates (not validated endpoints)

- `/client-dropdown-subjects`
- `/client-tickets`
- `client-tickets`
- `client-tickets/${ticketId}`
- `client-tickets/${ticketId}/messages`

## Observed form/config field names

- `message`
- `priority`
- `status`
- `subject_id`
- `ticket_id`

## Matching backend route declarations

- GET `/client-tickets` → `client.tickets`; `TicketController::index`; `../isp-backend/routes/client.php:29`
- POST `/client-tickets` → `client.tickets.create`; `TicketController::store`; `../isp-backend/routes/client.php:30`
- GET `/client-tickets/{ticket}` → `client.tickets.show`; `TicketController::reply`; `../isp-backend/routes/client.php:31`
- GET `/client-tickets/{ticket}/messages` → `client.tickets.messages`; `TicketController::getMessages`; `../isp-backend/routes/client.php:32`
- POST `/client-tickets/{ticket}/messages` → `client.tickets.reply`; `TicketController::storeMessage`; `../isp-backend/routes/client.php:33`
- GET `/client-dropdown-subjects` → `client.dropdown.subjects`; `TicketController::dropdownSubjects`; `../isp-backend/routes/client.php:34`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/TicketController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/TicketController.php`
- `../isp-backend/app/Http/Requests/StoreTicketRequest.php`
- `../isp-backend/app/Http/Requests/UpdateTicketAssigneeRequest.php`
- `../isp-backend/app/Http/Requests/UpdateTicketRequest.php`
- `../isp-backend/app/Http/Requests/UpdateTicketStatusRequest.php`
- `../isp-backend/app/Http/Resources/TicketCollection.php`
- `../isp-backend/app/Http/Resources/TicketMessageResource.php`
- `../isp-backend/app/Http/Resources/TicketResource.php`
