# Source evidence — noc

Generated from static source inspection on 2026-11-12. Literal references can include inactive paths, aliases and shared subfeatures. Confirm reachability/middleware and final payload before implementation.

## Frontend files

- `app/(dashboard)/noc/page.tsx`
- `components/noc/noc-map-canvas.tsx`
- `components/noc/noc-view.tsx`

## Observed permission checks

- `olts.show`
- `tickets.access`
- `tickets.show`

## Observed API templates (not validated endpoints)

- `monitoring/summary`

## Observed form/config field names

- None extracted; inspect page, shared components and dynamic configuration.

## Matching backend route declarations

- GET `/olts` → `olts.access`; `OltController::index`; `../isp-backend/routes/api.php:298`
- GET `/olts/{device}` → `olts.show`; `OltController::show`; `../isp-backend/routes/api.php:299`
- GET `/olts/{device}/clients` → `olts.clients`; `OltController::clients`; `../isp-backend/routes/api.php:300`
- DELETE `/olts/{device}/access` → `olts.access-remove`; `OltAccessController::destroy`; `../isp-backend/routes/api.php:303`
- POST `/olts/{device}/access/test` → `olts.access-test`; `OltAccessController::test`; `../isp-backend/routes/api.php:304`
- POST `/olts/{device}/poll` → `olts.poll`; `OltController::poll`; `../isp-backend/routes/api.php:305`
- GET `/monitoring/summary` → `monitoring.summary`; `MonitoringController::summary`; `../isp-backend/routes/api.php:309`
- GET `/tickets` → `tickets.access`; `TicketController::index`; `../isp-backend/routes/api.php:554`
- POST `/tickets` → `tickets.create`; `TicketController::store`; `../isp-backend/routes/api.php:555`
- GET `/tickets/{ticket}` → `tickets.show`; `TicketController::show`; `../isp-backend/routes/api.php:556`
- PUT `/tickets/{ticket}` → `tickets.edit`; `TicketController::update`; `../isp-backend/routes/api.php:557`
- PUT `/ticket-status/{ticket}` → `tickets.status.update`; `TicketController::updateStatus`; `../isp-backend/routes/api.php:558`
- PUT `/ticket-assignee/{ticket}` → `tickets.assignee.update`; `TicketController::updateAssignee`; `../isp-backend/routes/api.php:559`
- DELETE `/tickets/{ticket}` → `tickets.delete`; `TicketController::destroy`; `../isp-backend/routes/api.php:560`
- POST `/tickets/{ticket}/messages` → `tickets.reply`; `TicketController::storeMessage`; `../isp-backend/routes/api.php:628`
- GET `tickets/{ticket}/messages` → `tickets.messages`; `TicketController::getMessages`; `../isp-backend/routes/api.php:629`
- POST `/olts/{device}/access/detect-community` → `olts.access-detect-community`; `OltAccessController::detectCommunity`; `../isp-backend/routes/api.php:696`

## Backend contract files to review

- `../isp-backend/app/Http/Controllers/V1/Admin/MonitoringController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/OltAccessController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/OltController.php`
- `../isp-backend/app/Http/Controllers/V1/Admin/TicketController.php`
- `../isp-backend/app/Http/Controllers/V1/Client/TicketController.php`
- `../isp-backend/app/Http/Requests/OltAccessRequest.php`
- `../isp-backend/app/Http/Requests/StoreTicketRequest.php`
- `../isp-backend/app/Http/Requests/UpdateTicketAssigneeRequest.php`
- `../isp-backend/app/Http/Requests/UpdateTicketRequest.php`
- `../isp-backend/app/Http/Requests/UpdateTicketStatusRequest.php`
- `../isp-backend/app/Http/Resources/PaginatedCollection.php`
- `../isp-backend/app/Http/Resources/TicketCollection.php`
- `../isp-backend/app/Http/Resources/TicketMessageResource.php`
- `../isp-backend/app/Http/Resources/TicketResource.php`
