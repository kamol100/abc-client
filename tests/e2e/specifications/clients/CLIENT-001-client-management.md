# CLIENT-001 — Staff client management Playwright specification

- Status: Partially implemented — see [scenario implementation status](IMPLEMENTATION.md) and [runner instructions](../../clients/README.md).
- Investigated: 2026-11-12, static source inspection only.
- Goal: Staff can find, create, inspect, update, and operate on the correct subscriber, with persistent results and correct access boundaries.
- Scope: `/clients`, `/clients/create`, `/clients/edit/[id]`, `/clients/view/[id]`; relevant entry points to invoices, payments, wallets, tickets, SMS, and reseller client reports.
- Separate follow-ups: subscriber portal, bulk import, full archive lifecycle, full invoice/payment accounting, full report/export suites, and real device/provider integration.

## Investigation evidence

Paths below are repository-relative; backend paths refer to the sibling checkout.

- Pages: `app/(dashboard)/clients/**/page.tsx`.
- List and filters: `components/clients/client-table.tsx`, `client-column.tsx`, `client-filter-schema.ts`, `reseller-client-filter-schema.ts`. Default list supports simple search, network/zone/billing/status filters, pagination, column toggles, counts, and `created_at=this_month`. Reseller report uses a separate query key and no create action.
- Create/edit: `client-form.tsx`, `client-form-schema.ts`, `client-type.ts`. Full-page accordion form; next SID hint on create; image fields omitted from the ordinary client payload.
- Detail and actions: `client-view.tsx`, `client-row-actions.tsx`, `client-status-toggle.tsx`, `client-activation.ts`, `client-lock-dialog.tsx`, `client-change-package-dialog.tsx`, `client-session-reset-dialog.tsx`, `client-image-fields.tsx`, `client-add-map-dialog.tsx`, `client-sms-status.tsx`. Detail embeds deferred invoice/payment/ticket/history sections.
- Backend: `../isp-backend/routes/api.php`; `app/Http/Controllers/V1/Admin/ClientController.php`; `app/Http/Resources/ClientResource.php`; `app/Http/Requests/{StoreClientRequest,UpdateClientRequest,UpdateClientStatusRequest,UploadClientImageRequest}.php`; `app/Services/Client/ClientService.php`.
- Architecture: `.cursor/rules/architecture.mdc` and sibling `docs/architecture/multi-tenancy.md`, sections 3 and 10.
- Existing tests: `tests/unit/clients/` covers payload normalization, defaults, activation, maps, billing entry points, SMS status, network widgets, reseller filters, and identity links. Existing e2e files cover auth, vendors, zones/sub-zones; there is no client-management e2e spec.

## Observed contracts

- Resource `id` is the client UUID. Do not assume numeric database IDs in browser routes.
- API paths below are relative to `/api/v1`.
- `GET /clients` → `clients.access`; `GET /clients/{client}` → `clients.show`; `POST /clients` → `clients.create`; `PUT /clients/{client}` → `clients.edit`; `DELETE /clients/{client}` → `clients.delete`.
- `GET /client-next-sid` → `clients.next-sid`; advisory display only, not a guaranteed reserved identifier.
- `PUT /client-status/{client}` → `clients.status`; missing-bill activation may return `internet_bill_required` with a billing preview.
- `PUT /clients-change-package/{client}` → `clients.change.package`; `POST /client-reset-session/{client}` → `client.reset.session`; `POST /client-mikrotik-sync/{client}` → `clients.mikrotik.sync`.
- `PUT /clients/{client}/lock` → `clients.lock`; controller additionally restricts locking to users allowed to see locked clients. Frontend uses Admin/Super Admin role names.
- `POST /clients/{client}/add-client-map` → `clients.map.add`.
- Image upload/read/delete: `/clients/{client}/images/{field}`, corresponding `clients.image.upload`, `clients.image.show`, `clients.image.remove`; allowed fields `photo`, `nid_front`, `nid_back`. Upload validator accepts actual JPEG/PNG/WebP images and enforces a configured size limit; message currently says 2 MB.
- `GET /clients/{client}/sms-status` → `clients.sms-status`, explicitly bypassing route-permission middleware; frontend allows `clients.show` OR `clients.sms-status`.
- Related action gates include `invoices.access`, `invoices.pay`, `wallets.access`, `tickets.create`, `sms-send.access`, and `onus.access`.
- Core frontend validation requires name length ≥2, PPPoE username/password, network, and package. Phone is marked mandatory in the form, nullable in Zod, and conditionally required/numeric/11–13 digits in Laravel. Treat the discrepancy as a review item.
- Create UI defaults include prepaid billing, auto billing, first payment term, invoice day 01, company payment deadline (fallback 11), and welcome notification enabled. Editing must preserve stored choices, including valid zero values.
- `ClientService::deleteClient` rejects clients with payments or invoices; successful deletion also removes the client wallet before deleting the client. Package changes currently reject selecting the same package and require a successful MikroTik update before persisting the package.

## Review decisions and suspected gaps

Resolve these explicitly; current implementation is evidence, not automatic approval of intended behavior.

1. Phone: must it always be required? What validation should users see for blank or invalid values? Name maximum length also differs between frontend and backend.
2. Permissions: reset-session and change-package menu actions currently have no frontend permission gate. Operational routes near the end of `routes/api.php` are outside the main permission middleware group; inspected reset/package controller methods have no explicit permission check. Confirm intended permissions and audit service/middleware checks before claiming an exploitable gap or encoding permissive behavior.
3. Locking: retain Admin/Super Admin role-only behavior, or use `clients.lock` plus backend role checks? Confirm who can view locked rows and their related resources.
4. Billing: approve exact fixtures and expected invoice/balance effects for activation, package changes, cable charges, payment, and reseller recharge. Do not derive expected amounts from the same production helper being tested.
5. Assignment: the form schema includes `reseller_id`. Confirm allowed assignment workflows; never use company/reseller payload fields to switch authorization context.
6. Deletion: confirm archive retention and router deletion behavior. Ordinary deletion must not be treated as permanent removal of all related records.
7. Private images: confirm role combinations for show/upload/remove and behavior before a new client is saved.
8. Detail sections: confirm invoice/payment/ticket/history visibility without their related permissions; sections are instantiated in the detail page without obvious local gates.
9. Confirm test domains, credentials/personas, seed/reset mechanism, device fakes, and failure injection mechanism. None were provisioned or executed during this task.

Scenarios tied to unresolved decisions remain review-blocked. Implement independent approved scenarios without weakening assertions or silently skipping blocked cases.

## Environment and fixtures

- Dedicated backend database, storage, queue, and cache namespace; never reset shared development or production data.
- Tenant A and B on registered test hostnames; company admin, read-only staff, no-client-access staff, zone-assigned staff, reseller staff, and a tenant-B user. Test personas must have explicit route permissions and a known subscription state.
- Tenant A: two zones/sub-zones, two networks, packages with known prices, active/inactive clients, locked client, company-owned and reseller-owned clients, paid/due/no-current-invoice clients, missing optional values, and clients created inside/outside the chosen month.
- Test-owned client per mutation scenario; seed enough rows for pagination. Use run/worker/test identifiers, not timestamps alone. Cleanup must survive failed assertions and account for soft-deleted rows and uploaded images.
- Use browser geolocation permissions for map tests; local image fixtures containing no personal data; controlled MikroTik/SMS/payment adapters. No real sends or router mutations.
- Set backend and browser date/time assumptions consistently, using Asia/Dhaka for calendar-boundary fixtures. Browser clock changes alone do not change Laravel time.
- Prepare records through existing supported APIs or a separately implemented backend fixture mechanism. Do not invent endpoints in tests or add public test-only bypasses.

## Scenarios and acceptance criteria

Each numbered item is a separately identifiable case. Split combined variants into independent tests when implementation begins. P0 = critical access/data integrity; P1 = main feature; P2 = extended regression. Executable slices and remaining blockers are tracked in IMPLEMENTATION.md; parent IDs are not automatically passing.

### Group A — List and discovery

- CL-L01 [P1]: Given permitted staff and known seeded clients, opening `/clients` renders their expected identity/package/billing information and backend pagination total; reload preserves the underlying records.
- CL-L02 [P1]: Search separately by seeded name, PPPoE username, and phone; only matching records appear. Clearing search restores the baseline. Confirm supported search fields against backend filters during implementation.
- CL-L03 [P1]: Apply network, zone, each billing option (`auto`, `manual`, `no_invoice_this_month`), and active/inactive filters independently, then a combined filter. Compare included AND excluded fixture identities; reset restores baseline.
- CL-L04 [P1]: Move between pages and change page size where offered; known records and counts match. Applying a restrictive filter from a later page must not strand the user on an empty stale page.
- CL-L05 [P1]: Open `/clients?created_at=this_month`; only in-month fixtures appear and notice is visible. Show-all removes the restriction; reload and browser back/forward reflect the URL consistently.
- CL-L06 [P1]: Empty/no-match results display a usable empty state; clearing filters recovers the list. A controlled failed list response must not be presented as a successful empty result.
- CL-L07 [P2]: Hide/show a supported column; verify visibility and the intended persistence scope after reload. Run with fresh browser state to avoid leaking preferences.
- CL-L08 [P1]: Reseller client report lists its allowed records, supports its reseller filter, and exposes no create button; returning to normal clients does not reuse report data or filters incorrectly.

### Group B — Create and edit

- CL-F01 [P0]: Create a uniquely named client with valid required fields and a valid phone; verify it can be found, detail UUID matches, and name/network/package/phone survive reload. Turn off notifications unless testing them with a fake.
- CL-F02 [P1]: Submit missing name, one-character name, missing PPPoE username/password, missing network, and missing package; relevant errors remain visible, form stays open, and no client is created.
- CL-F03 [P1, review-blocked]: Blank and invalid phone/name-too-long cases produce the approved frontend/server validation behavior, preserve entered values, and create no record.
- CL-F04 [P1]: Open edit directly for a seeded UUID; assert saved values hydrate before editing. Change name/address and save; list and detail show the new values after reload, while unrelated billing values remain unchanged.
- CL-F05 [P1]: Edit prepaid/postpaid and each approved billing-type value, payment term, deadline including zero, and date-only fields; reload confirms the saved choices without resetting to create defaults or shifting calendar dates.
- CL-F06 [P1]: Create shows approved company defaults and eventual next-SID hint; edit does not show that create hint. User changes made while defaults/dropdowns load are not overwritten.
- CL-F07 [P1]: Choose seeded zone/sub-zone and network/package combinations according to actual dropdown dependencies; changing a parent must not leave an invalid dependent selection silently saved. Inspect dependency implementation before selecting exact combinations.
- CL-F08 [P1]: Cancel create/edit returns to `/clients` without persisting typed changes. A controlled server rejection keeps recoverable values and does not show save success.
- CL-F09 [P1]: Repeated submission while saving creates only one test client. Verify persisted identity/count, not only a disabled button.
- CL-F10 [P1]: Clear optional editable fields and save; reopening shows them blank instead of literal `undefined`, `$undefined`, or `null`. Existing unit tests retain exhaustive payload coercion checks.

### Group C — Detail and related journeys

- CL-D01 [P1]: Open detail from row identity and view action; each resolves the selected UUID. Test same-tab/new-tab settings separately and assert destination identity in the resulting page.
- CL-D02 [P1]: Detail shows the selected client's basic/package/billing data; absent optional values and unavailable router/usage data do not break the rest of the page.
- CL-D03 [P0]: With two clients holding distinct invoices/payments/tickets/history, scroll to deferred sections and assert only the selected client's records appear. Switching to the other client must refresh those sections.
- CL-D04 [P1]: Invoice-history, payment, ticket, SMS, and wallet entry points target the selected client. In fake-backed tests create one ticket and one SMS request, verifying recipient/client association and one resulting record; other business accounting belongs to follow-up tickets.
- CL-D05 [P0, review-blocked]: Pay a seeded due invoice through the client entry point; verify approved payment record, invoice remainder, and client due total after reload. Cancel and rejected payment leave amounts unchanged. Specify exact approved numbers before implementation.
- CL-D06 [P1]: Copy phone writes the expected number; phone and WhatsApp links target the expected number without contacting external services. Identity link is unavailable without `clients.show`.
- CL-D07 [P2]: SMS status renders sent/failed/no-record states from controlled data; failure to load status leaves other billing data usable. Exhaustive indicator formatting remains in Vitest.

### Group D — Lifecycle and network operations

- CL-O01 [P0]: Deactivate an active test client; reload confirms inactive status and no activation invoice dialog. A rejected update leaves persisted status unchanged.
- CL-O02 [P0, review-blocked]: Activate an inactive client requiring an internet bill; preview shows the expected client/package/date/amount from an independently specified fixture. Cancel leaves client inactive and no invoice created.
- CL-O03 [P0, review-blocked]: Submit approved activation amount, deadline 1–30, termination date, and required note; exactly one invoice and active status persist. Invalid amount/deadline/blank note keeps dialog open; rapid duplicate submission does not duplicate billing.
- CL-O04 [P1, review-blocked]: Activate a client whose required bill already exists; approved status transition succeeds without creating a duplicate invoice.
- CL-O05 [P1, review-blocked]: Change package on a test client, confirm persistence, and verify approved billing/network effects. Cancel or fake network failure leaves original package intact. Empty selection cannot submit.
- CL-O06 [P0, review-blocked]: Lock/unlock as an authorized admin; reload confirms state. Restricted user cannot discover or act on locked clients according to approved policy.
- CL-O07 [P1]: Cancel reset-session performs no reset; confirmed reset invokes the fake once and displays the controlled result. Failed reset remains recoverable without success feedback.
- CL-O08 [P1]: Fake MikroTik sync returns created/already-exists/failure states; each displays the correct result without duplicated network users. Speed, ping, and online/offline displays use deterministic fake responses; invalid/missing IP disables ping.
- CL-O09 [P0, review-blocked]: Cancel deletion preserves the client. Confirm ordinary deletion removes the client from active list after reload and exposes it in archive only to approved users. Test router-deletion checkbox separately against a fake; assert cancel/reopen resets the checkbox.
- CL-O10 [P0]: Attempt deletion separately for a client with an invoice and a client with a payment. The API rejection is displayed; the client and financial records remain after reload. Use a client with neither relation for the successful-deletion case.
- CL-O11 [P1]: Selecting the current package produces the defined rejection and leaves state unchanged. A failed fake MikroTik package update must not persist the newly selected package.

### Group E — Images and location

- CL-M01 [P1, review-blocked]: Upload valid photo/NID images to a saved test client and reload; authorized users can view them. Replacing/removing one field affects only that field. Verify upload/remove failures leave a truthful recoverable state.
- CL-M02 [P1]: Invalid image content, unsupported type, and over-limit upload are rejected without replacing an existing image. Read the configured size limit during implementation rather than trusting error copy alone.
- CL-M03 [P1]: Grant fixed geolocation, open add-map, verify preview, save, and reload; approved coordinates persist for the selected UUID only. Cancel makes no change.
- CL-M04 [P1]: Denied/unavailable geolocation explains the failure and prevents saving invalid coordinates; remaining client actions remain usable.

### Group F — Authorization, tenancy, and resilience

- CL-A01 [P0]: Unauthenticated visits to list/create/edit/detail require staff login. Subscriber credentials do not grant staff client-management access.
- CL-A02 [P0]: Without `clients.access`, list data is unavailable. Read-only staff see permitted records/details but no create/edit/delete controls; direct create/edit visits must not enable a successful mutation.
- CL-A03 [P0]: Remove each relevant action permission independently; approved action is hidden/disabled and API mutation denied. Use exact backend names, especially `clients.edit`. Cases affected by review decisions remain blocked, not asserted permissive.
- CL-A04 [P0]: Tenant A cannot see tenant B's fixture in list/search/dropdowns or retrieve/update it by known UUID; no foreign identity or private image appears. Backend authorization tests must independently verify direct endpoint enforcement.
- CL-A05 [P0]: Reseller and zone-assigned staff only see permitted fixtures; direct foreign/other-zone UUID access cannot expose or change them. Dropdowns offer permitted assignments only.
- CL-A06 [P0]: Log out after viewing tenant A client, log in on tenant B host, and navigate/back/reload; tenant A client and deferred section data never reappear. Use separate host-specific sessions; do not pass tenant IDs to switch context.
- CL-A07 [P1]: Expired session, subscription denial, and controlled server/network failures do not produce success feedback or stale authorized data. Assert the actual agreed recovery/login flow after inspecting shared handlers.
- CL-A08 [P2]: At representative mobile width and in English/Bangla/light/dark modes, find a client, open actions/detail, and submit a representative form using keyboard-accessible labels; no required action becomes unreachable. Keep visual baselines deterministic if later added.

## Implementation handoff

1. Obtain review of the decision list; record answers here and split this parent ticket into group-sized implementation tasks if desired.
2. Repair shared e2e prerequisites in a separate change: validation-safe submit helper; strict successful-login assertion; public/auth setup separation. Existing uncommitted test changes must be preserved and reviewed first.
3. Establish fixtures, role sessions, test hosts, cleanup, and fake integrations. Auth state contains secrets: generate it at runtime and exclude it from commits/artifacts. Do not reuse the currently tracked/modified auth file as a permanent credential source.
4. Implement A/B plus basic detail/access first, then billing/lifecycle after review, then images/maps/operational and presentation coverage. Reference scenario IDs in test titles.
5. Prefer roles/labels and scoped rows. Add stable test IDs only where needed. No positional first-button/first-option shortcuts, fixed sleeps, swallowed auth errors, unconditional skips, or weakened assertions.
6. This app uses Next.js server actions for backend fetches: browser `page.route()` cannot intercept those outbound requests. Use the real isolated API or a server-reachable controlled stub for deterministic errors.
7. Keep specs independent. Seed edit/delete targets directly rather than relying on a preceding create test. Use cleanup in fixture teardown; isolate mutable accounts/data before enabling parallel writes.
8. Verify saves with fresh reads/reload and domain outcomes, not only toast text or dialog closure. Do not calculate expected billing with production billing helpers.
9. Run relevant specs first, then the approved regression scope; retain failure traces/screenshots and redact credentials/private images. Record command, environment, commit/worktree state, passed/failed/skipped counts, and artifact paths.

## Definition of done

- Every scenario has a linked executable test or an explicitly reviewed deferral/blocker with reason; no untracked coverage claims.
- Independent reruns and parallel runs (where enabled) do not collide or leave test records/files behind.
- Permissions and accounting assertions reflect reviewed requirements. Product defects are reported separately and not converted into expected behavior.
- Relevant Playwright runs and required repository checks are executed and accurately reported. No success claim from static inspection.
- No production sends/device mutations; no new dependencies, push, or deploy without required approval.
- `.ai/report.md` records implementation, evidence, known gaps, and unrelated worktree changes.

## Current verification

See [implementation status](IMPLEMENTATION.md) for every scenario and [suite README](../../clients/README.md) for commands and fixture requirements. Both CP and MK nonmutating suites passed 28 tests each; see [execution evidence](EXECUTION.json). Four isolated mutation tests are written but unexecuted until approved fake-backed fixtures are available. This does not complete all 48 parent scenarios or establish >90% coverage. Final host/check results are recorded in `.ai/report.md`.
