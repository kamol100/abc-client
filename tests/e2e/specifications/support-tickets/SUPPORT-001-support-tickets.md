# SUPPORT-001 — Support ticket management and conversations

- Status: Partial Playwright coverage on CP/MK. Review remains pending, so these runs are not passing coverage. ST-A03 foreign client-id assignment fails on the current API. Review-blocked scenarios are not implemented.
- Investigated: 2026-11-12, static source inspection.
- Goal: Staff and subscribers can create and converse on the correct support ticket, while status, assignment, permissions, and ownership persist correctly.
- Scope: staff `/tickets`, `/tickets/view/[id]`; client-profile embedded create/history; subscriber `/client/tickets`, `/client/tickets/[id]`; dashboard support-count integration.
- Follow-ups: subjects/tags CRUD, notification delivery reliability, SLA/escalation/attachments (not established features in inspected code), full dashboard suite.

## Evidence

Repository-relative: `components/tickets/{ticket-table,ticket-form,ticket-form-schema,ticket-filter-schema,ticket-column,ticket-row-actions,ticket-view,ticket-message-thread,ticket-reply-form,ticket-type}.tsx` (schemas/types with `.ts` where applicable); `components/clients/client-ticket.tsx`; `components/client-area/tickets/`; relevant `app/(dashboard)/tickets/` and `app/(client-dashboard)/client/tickets/` pages; `tests/unit/tickets/ticket-status-select.test.tsx`.

Backend sibling: `../isp-backend/routes/{api,client}.php`; `app/Http/Controllers/V1/{Admin,Client}/TicketController.php`; `app/Http/Requests/{StoreTicketRequest,UpdateTicketRequest,UpdateTicketStatusRequest,UpdateTicketAssigneeRequest}.php`; `app/Http/Resources/TicketResource.php`. Frontend and canonical backend tenant rules apply. No ticket-specific e2e specs currently exist.

## Observed contracts

- Backend TicketResource exposes UUID as `id`; frontend shared TicketRowSchema currently coerces `id` to number. This mismatch requires review/fix; tests must use returned UUIDs, not numeric assumptions.
- Staff APIs relative to `/api/v1`: `GET /tickets` (`tickets.access`), `POST /tickets` (`tickets.create`), `GET /tickets/{ticket}` (`tickets.show`), `PUT /tickets/{ticket}` (`tickets.edit`), `DELETE /tickets/{ticket}` (`tickets.delete`).
- Inline controls: `PUT /ticket-status/{ticket}` (`tickets.status.update`) and `PUT /ticket-assignee/{ticket}` (`tickets.assignee.update`). Assignee may be null; backend checks chosen staff via scoped query.
- Conversation: `GET/POST /tickets/{ticket}/messages` (`tickets.messages` / `tickets.reply`). These routes lie outside the primary route-permission group; inspected controller methods do not explicitly check those permissions. Audit full middleware/model scope before asserting effective access.
- Staff filters: ticket code `ticket_id`, client, assigned staff, priority, status; server list newest ID first, pagination and message count included.
- Priorities: low/medium/high; states: open/in_progress/resolved/closed. Create defaults medium/open. Frontend create requires exactly one client identifier (numeric ID or UUID), message ≥2 characters; reply requires ≥1. Backend create validation is looser for subject/client/status/priority; review semantics before using it as the expected specification.
- Staff create supports client UUID and assigned-staff UUID resolution. Edit request validates numeric relation fields, so test hydration and preservation of those relations carefully.
- Message thread polls every 5 seconds and API returns descending message IDs. Replies invalidate message queries. Staff attribution uses user's staff relation when present; absent staff can produce null attribution.
- Staff reply form allows `tickets.reply` OR `tickets.access`; row reply action uses a different permission condition. Staff ticket table passes create form without a local `tickets.create` gate.
- Subscriber APIs: `GET/POST /client-tickets`, `GET /client-tickets/{ticket}`, `GET/POST /client-tickets/{ticket}/messages`, `GET /client-dropdown-subjects`; route names `client.tickets`, `.create`, `.show`, `.messages`, `.reply`, and `client.dropdown.subjects`.
- Subscriber list filters exact ticket code, paginates 10, and scopes by authenticated client ID. Detail/messages enforce ownership and return 404 for another client's ticket; create overwrites `client_id` with authenticated identity.
- Subscriber row renders delete for zero-message tickets using `DELETE /client-tickets/{id}`; inspected client route file and controller contain no matching delete route/action. This is a contract gap, not an endpoint to invent in tests.

## Review decisions / gaps

1. Approve permission model for staff create/show/messages/reply; should list-only staff reply? Should create be hidden without `tickets.create`? Confirm direct API enforcement, not only UI gates.
2. Resolve UUID/number mismatch before implementing assertions around schema parsing or ticket navigation.
3. Approve required subject/client, minimum/maximum message length, whitespace-only messages, valid priorities/statuses, allowed relation assignment, and backend parity. Coercion to zero is not evidence of a valid selection.
4. Approve allowed status transitions, reopening closed/resolved tickets, and whether subscribers/staff may reply to a closed or locked ticket. No transition restriction should be invented from labels alone.
5. Subscriber delete: implement authorized ownership/message-count-checked backend support in a separate approved feature change, or remove the UI action. Until decided, its positive scenario is blocked; do not fake a successful backend route.
6. Approve conversation ordering, timestamp format, unattributed staff fallback, deletion of staff tickets with messages, retention, and notification side effects.
7. Audit relation validation: general store/update validators do not establish scoped exists checks for all clients/subjects/tags/assignees, unlike inline assignee validation. Record backend gaps rather than relying on filtered dropdowns.

## Environment / fixtures

Dedicated test database, queue/cache namespace, and two company domains. Company A: full-permission staff with staff relation, list-only staff, separately granted reply/status/assignment users, reseller/zone-restricted users, two subscribers with distinct tickets. Company B: foreign ticket, client, staff, subject, tag.

Seed subjects/tags, assignable/unassigned staff, all priorities/states, no-reply and multi-reply tickets, enough rows for pagination, and distinct conversation text for every identity. Record fixture UUIDs and display ticket codes separately. Include an approved locked-ticket case only after its policy is established.

Use run/worker/test-owned records for mutations and teardown that removes dependent messages/tag links safely. Do not depend on a prior create test. Fake outbound notifications/SMS/email; no real messages to customers. Staff-to-subscriber conversation tests use separate browser contexts with explicit accounts on the same test tenant host. Time fixtures use agreed Asia/Dhaka dates; browser time does not control Laravel.

## Scenarios

P0 = ownership/access/data integrity; P1 = primary workflow; P2 = extended regression. Review-blocked cases depend on the decisions above.

### List and filters

- ST-L01 [P1]: Authorized staff opens list; expected ticket codes, client, subject, priority, status, assignee, message counts, and pagination total match fixtures.
- ST-L02 [P1]: Filter independently by code/client/assignee/each priority/each status, then combine filters; assert included and excluded ticket codes. Clear restores baseline.
- ST-L03 [P1]: Navigate pagination and change page size where offered; restrictive filtering from later page returns valid results without duplicates or stale page state.
- ST-L04 [P1]: Empty/no-match state is usable; clearing filters recovers known rows. Failed list query is distinguishable from a valid empty list.
- ST-L05 [P1]: Client-detail embedded ticket list shows only selected client's fixtures; navigate to another client's detail and confirm no old ticket rows remain.

### Create and edit

- ST-F01 [P0]: Create ticket with seeded client/subject, medium/open defaults and unique message; locate returned ticket code, open UUID detail, reload, and verify associations and content.
- ST-F02 [P1]: Select each priority and approved initial status, multiple tags, and assignee; saved/reloaded detail preserves selections. Cancel leaves no created record.
- ST-F03 [P1]: Submit no client and empty/one-character message; form remains open, approved errors appear, and no ticket is created. Verify missing subject behavior after review.
- ST-F04 [P0]: Create through client-profile action with hidden UUID defaults; ticket belongs to that client, not another previously viewed client or stale numeric URL default.
- ST-F05 [P1]: Edit a seeded ticket; hydrated fields match before editing. Update message/subject/tags/assignee/priority/status and verify persistence, including clearing optional tags/assignment under approved rules.
- ST-F06 [P1]: Cancel edit preserves original values. Server rejection retains recoverable input and does not show success or close as though saved.
- ST-F07 [P1]: Rapid repeated create/save produces one intended ticket/change; verify persisted count and identity.
- ST-F08 [P1, review-blocked]: Invalid subject/client/tag/assignee and whitespace/length boundaries follow reviewed validation on create and edit, without cross-scope assignment or silently saving invalid zero identifiers.

### Inline status and assignee

- ST-U01 [P1, review-blocked]: Permitted user applies each approved status transition; list and reloaded detail agree; unrelated fields remain unchanged. Rejected transition leaves persisted state intact.
- ST-U02 [P1]: Permitted user assigns seeded staff then clears assignment; reload confirms named/unassigned state and other ticket fields are preserved.
- ST-U03 [P0]: Without `tickets.status.update` or `tickets.assignee.update`, corresponding inline editor is unavailable and direct mutation is denied; granting one permission does not grant the other.
- ST-U04 [P1]: Delay/reject inline mutation; pending control prevents conflicting submissions, truthful error is shown, and failure leaves original saved value after reload.
- ST-U05 [P0]: Foreign/invalid staff assignment is rejected by API and original assignee remains; options exclude unauthorized choices.

### Detail and conversation

- ST-C01 [P1]: View/reply navigation opens selected UUID with correct ticket code, original message, client, subject, tags, status, and assignee. Back-to-list works.
- ST-C02 [P1]: Submit unique staff reply; it appears exactly once with approved author/time, input resets after success, and reply persists after reload under the correct ticket.
- ST-C03 [P1]: Empty reply is rejected with no new message. Controlled server failure preserves draft and does not show success; retry creates only the intended message.
- ST-C04 [P0]: Subscriber replies in separate context; staff thread eventually shows it through polling, staff responds, subscriber eventually sees response; replies never appear on another seeded ticket.
- ST-C05 [P1]: Multi-message ordering matches approved order and empty thread shows expected state. Poll with retrying assertions; no fixed 5-second sleeps.
- ST-C06 [P1, review-blocked]: Closed/resolved/locked ticket reply behavior matches approved policy; rejected replies create no persisted message.
- ST-C07 [P2]: Message containing harmless HTML-like text is rendered as text rather than executed; long approved messages remain readable without breaking controls.
- ST-C08 [P1]: Switching between ticket details while requests are delayed does not render a stale ticket/thread or submit a reply to the previously viewed ticket.

### Subscriber experience

- ST-P01 [P0]: Subscriber list shows only own tickets; exact-code filter and 10-row pagination retain ownership scope.
- ST-P02 [P0]: Subscriber creates ticket using offered subject/priority/message fields; reloaded ticket belongs to signed-in subscriber and defaults follow approved policy. Staff sees correct subscriber association.
- ST-P03 [P1]: Subscriber create validation/cancel/failure preserves truthful state; no unrelated subscriber's identity can be selected through the UI.
- ST-P04 [P0]: Subscriber A cannot open subscriber B's known ticket UUID or read/post its messages, including within same company. Denial leaks no ticket text or author details.
- ST-P05 [P0, review-blocked]: Approved subscriber deletion policy is implemented end to end: cancel preserves ticket; permitted deletion removes own eligible ticket; replied/foreign/otherwise ineligible deletion is denied. Blocked until missing route/UI mismatch is resolved.

### Access, deletion, dashboard, and resilience

- ST-A01 [P0]: Anonymous staff/subscriber list and detail access require appropriate login; subscriber session cannot mutate staff-only status/assignee actions.
- ST-A02 [P0, review-blocked]: List-only staff have exactly reviewed show/create/reply/edit/delete controls; direct endpoints enforce the same approved capability model.
- ST-A03 [P0]: Company A cannot list/search/open/edit/delete company B ticket or read/post messages by known UUID. Foreign related client/subject/tag/staff IDs cannot reassign a local ticket across boundaries.
- ST-A04 [P0, review-blocked]: Reseller/zone restrictions and locked-client/ticket rules apply to list, detail, messages, and mutation paths as approved; backend authorization tests independently prove direct enforcement.
- ST-A05 [P0]: Logout/identity switch and browser back/reload do not restore previous user's ticket or conversation content.
- ST-D01 [P1, review-blocked]: Authorized staff cancels then confirms deletion of eligible test ticket; reload verifies respective persistence/removal. Test tickets with replies under approved retention policy; unrelated tickets/messages remain.
- ST-D02 [P1]: With independently seeded counts, create open ticket then move to in-progress/resolved/closed; dashboard support metrics change by exactly approved deltas after refresh. Cross-reference DASHBOARD-001 without relying on its execution order.
- ST-R01 [P1]: Delayed detail/messages show loading independently; endpoint failure is recoverable and not falsely represented as an empty successful conversation. Missing/forbidden UUID uses approved safe error behavior.
- ST-R02 [P1]: Session expiry during reply produces agreed login/recovery flow, no false success, and no message committed under another identity.
- ST-R03 [P2]: Representative mobile, keyboard navigation, English/Bangla, and light/dark checks cover list actions, create dialog, inline controls, detail, and conversation. Existing raw status/priority labels should be reported if localization expectations fail.

## Implementation handoff and completion

Review decisions first; split implementation into list/create-edit, status/assignment, conversation/subscriber, then access/resilience. Start with real isolated backend happy paths. Repair shared login/submit helpers separately, preserving current uncommitted changes. Generate role auth state at runtime; do not commit session secrets.

Use semantic locators and scoped rows/dialogs, not first-option/first-button positions. Reference scenario IDs in test titles. Use small fixtures with teardown, no shared mutation dependencies, swallowed errors, unconditional skips, or assertions weakened to match defects. Browser `page.route` cannot intercept Next.js server-action outbound API calls: use backend test controls or a server-reachable stub for failures.

Verify persistence via reload/fresh reads, exact target association, duplicate prevention, and denied side effects. Every case links to a spec or a reviewed blocker/deferral. Record commands/environment/results and failure artifacts; complete required checks when implementing. Backend gaps are separate fixes, not frontend workarounds. Update `.ai/report.md`; installations/push/deploy require approval.

Current verification: `npm run test:e2e:tickets`. Evidence is `tests/e2e/specifications/support-tickets/EXECUTION.json`. No application ticket code was changed.
