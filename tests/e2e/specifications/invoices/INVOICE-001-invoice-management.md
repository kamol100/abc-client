# INVOICE-001 — Subscriber invoice management, collection, and receipts

- Status: Partially implemented; monetary decisions remain pending review. See [implementation status](IMPLEMENTATION.md) and [execution evidence](EXECUTION.json).
- Investigated: 2026-11-12 by static source inspection.
- Goal: Authorized staff create accurate invoices, collect the intended outstanding amounts into permitted funds, and view/print truthful documents without mixing client or tenant records.
- Scope: `/invoices`, `/invoices/create`, `/invoices/edit/[id]`, `/invoices/client/[id]`, invoice dialogs in client list/detail, full/partial bulk payment, discounts, invoice view and receipt output.
- Follow-ups: automatic invoice generation, invoice-type CRUD, full payments/fund ledger administration, subscriber portal invoice suite, public payment gateways, platform subscription invoices, and full print-settings administration.

## Investigation evidence

Repository-relative frontend sources: `app/(dashboard)/invoices/`; `components/invoices/invoice-table.tsx`, `invoice-filter-schema.ts`, `client-invoice-table.tsx`, `client-invoice-params.ts`, `invoice-form.tsx`, `invoice-form-schema.ts`, `invoice-type.ts`, `invoice-lines-editor.tsx`, `invoice-totals.tsx`, `invoice-row-actions.tsx`, `bulk-invoice-pay-dialog.tsx`, `payment-fund-access.ts`, `invoice-discount-dialog.tsx`, `invoice-view-dialog.tsx`, `invoice-print-dialog.tsx`, `invoice-view-model.ts`, `invoice-view-document.tsx`, and receipt/config files.

Backend sibling sources: `../isp-backend/routes/api.php`; `app/Http/Controllers/V1/Admin/{InvoicesController,InvoiceDueController}.php`; `app/Http/Requests/{StoreInvoicesRequest,UpdateInvoicesRequest,BulkInvoicePayRequest}.php`; `app/Services/Invoices/{InvoiceManagementService,UpdateInvoiceService,InvoicePayService}.php`; `app/Http/Resources/InvoiceResource.php`.

Existing `tests/unit/invoices/` covers columns, view/actions/documents, receipt/amount-in-words, bulk pay, fund access, paid-response normalization, client filter scoping, print configuration, and UTF-8 note limits. No invoice-specific e2e spec was found. Follow frontend workflow and canonical tenant rules already reviewed for these workspaces.

## Observed contracts

- Paths below are relative to `/api/v1`. `GET /invoices` → `invoices.access`; `GET /invoices/{invoices}` → `invoices.show`; `POST /invoices` → `invoices.create`; `PUT /invoices/{invoices}` → `invoices.edit`; `DELETE /invoices/{invoices}` → `invoices.delete`.
- Active row collection flow loads `GET /invoice-due/{invoice_uuid}` (`invoices.due`), then opens bulk collection for the client's returned outstanding invoices. This is not necessarily a single-invoice selection.
- `POST /invoices/bulk-pay` → `invoices.pay`; statuses `paid` / `partial`. Invoice UUID array, fund, payment date, confirmation flag, optional note, and partial amount are submitted.
- Legacy `invoice-pay-dialog.tsx` references `/invoices/pay/{id}`; corresponding route is commented out. Do not implement tests against it without establishing a reachable UI and valid contract.
- Discount API: `PUT /invoice-discount/{invoice}` → `invoices.discount.update`. Bulk-dialog discount visibility uses `invoices.apply-discount`; date editing uses `invoices.change-payment-date`. Backend enforcement/parity needs review.
- Create form defaults due, today's create/due dates, no fund, no confirmation SMS, one empty line. Required dates/client/type/description/positive unit amount/positive integer quantity and at least one line; nonnegative discounts. Paid/partial creation requires fund; partial creation requires positive amount.
- Form status `partial_paid` maps from API `partial` during edit hydration; list accepts both. Bulk payment uses `partial`. Do not conflate their payload contracts.
- Form transforms line totals from unit price × quantity, sends line/invoice discounts and derived totals, normalizes dates, and strips payment values when due. Note limit is 65,535 UTF-8 bytes, not characters. Bulk payment note backend limit is separately 255 characters.
- Backend create-with-payment is transactional. Bulk service loads unpaid selected UUIDs, pays each fully or distributes an integer partial amount sequentially until exhausted. Its query has no explicit order clause; submitted checkbox order must not be assumed to determine allocation.
- Non-admin staff bulk payments are restricted to assigned staff fund in frontend AND request validator. Missing assignment blocks submission. Admin/Super Admin can choose funds; full tenant/ownership enforcement still requires backend verification.
- Payment success opens receipt print when paid-response records are available. Client/invoice query invalidation is deferred until receipt closes to avoid unmounting it.
- List filters: track ID (legacy `trackID` alias also sent), creation/due date ranges, zone, invoice type, creator, client, due/paid/partial status. Report summaries are separate from paginated rows; `include_reports=0` is used when reports are disabled. Subscription invoices are excluded by the inspected listing query.
- Client-specific invoice list enforces `client_uuid` and removes competing numeric `client_id` from filter parameters.
- Row gates: edit/pay for due or partial with corresponding permission; view for `invoices.show`; receipt row action for paid/partial plus show; delete for `invoices.delete`. View dialog also has a print action, so document view and paid receipt are distinct paths.
- Backend InvoiceResource returns UUID under `id`; shared frontend InvoiceRowSchema declares numeric `id` and optional string `uuid`. Some consumers normalize UUID explicitly, while actions use `id` or `uuid`; do not assume this is correct across every response path.
- Invoice view hydrates detail on open; receipt uses print settings and detail hydration. Thermal receipt action generates/downloads PDF. Invoice document view uses browser `window.print`; physical printer output is outside browser-test scope.
- Backend delete rejects invoices with payments. Discount controller increments invoice discount and derives after-discount from total minus invoice discount; inspected formula does not subtract `line_total_discount`.

## Review decisions and suspected gaps

1. Approve money policy: unit prices, quantities, line discount meaning (per line versus per unit), invoice-level discount, rounding, fractional currency, zero-payable invoices, over-discount and overpayment rules. Expected totals must be independently specified, not copied from production helpers.
2. Resolve UUID/numeric schema consistency and establish which list/detail fields actions consume. Fix contract defects separately rather than coercing away identities in tests.
3. Approve partial allocation order and excess-payment behavior. Bulk service does not explicitly order rows; integer casts also warrant fractional-currency review. Decide what happens if a selected invoice is paid by another collector while the dialog is open.
4. Approve transaction/retry policy for multi-invoice collection: should all payments roll back on one failure? Inspection establishes a transaction for creation, not an outer bulk transaction or concurrency/idempotency guarantee.
5. Confirm discount permissions and server validation. Discount and due-lookup routes are outside main route-permission middleware; discount method lacks explicit permission/amount validation in inspected code. Review effective authorization and line-discount handling; do not encode negative/over-limit acceptance as intended behavior.
6. Approve editing of already partially paid invoices: can client/lines/status/total change, and may new total be below amount already paid? Inspected UpdateInvoiceService updates amounts/lines but does not itself reconcile payment/status changes from the form. Paid row hides edit, but direct URL/API policy must be established.
7. Confirm fund/date restrictions on paid/partial CREATE and edit as well as bulk payment. Assigned-fund validator was observed for bulk; parity across other paths is not established.
8. Approve date order rules, backdating permissions, receipt identity/branding/content, and browser-print availability for due invoice document versus payment receipt. Physical printing is manual acceptance.
9. Confirm reseller/zone access for due lookup (which removes ResellerScope), discount, documents, and bulk selections; direct API authorization must be tested independently from frontend hidden actions.
10. Confirm cancellation/reopen selection defaults, notifications and receipts on partial payment, bulk note boundaries, and whether unsupported legacy dialog should remain out of scope.

Cases marked review-blocked remain pending until their business decisions are recorded. Current behavior is evidence, not automatic acceptance criteria.

## Fixtures and environment

- Dedicated database/storage/cache/queue namespace and two company domains. Personas: full invoice admin, read-only invoice viewer, creator/editor without collection rights, assigned-fund collector, collector without fund, date/discount-limited collector, reseller, zone-assigned staff, tenant-B user, and subscriber for staff-route denial.
- Seed two local clients with distinct UUIDs/numeric relation IDs, a foreign company client, two zones, invoice types, two staff creators, allowed and foreign funds, no-payment due invoice, partial invoice, paid invoice, discounted multiline invoice, and enough rows for pagination. Keep subscription invoice fixtures distinct.
- For monetary review, propose a simple manifest: line A 100 ×2 with line discount 20; line B 50 ×1, invoice discount 10; if line discounts are fixed amounts, approved subtotal 250, discounts 30, payable 220. Separately, two outstanding amounts 100 and 200 with payment 150 demonstrate allocation. These are proposed business fixtures, not approved expected values until decisions 1–3 are resolved.
- Include decimal money, dates across month/year boundaries, preexisting payments, zero outstanding, unauthorized IDs, and controlled stale-balance/failure cases. Fix backend/browser Asia/Dhaka date assumptions together; browser clock alone does not control Laravel.
- Every mutation owns its records; cleanup handles payments before deleting invoices and restores test fund balances/settings without touching shared data. Fake notification/SMS/Telegram/gateway integrations; no customer communications or production money operations.
- Provision fixtures using existing supported APIs or separately approved backend test infrastructure. No invented test endpoints or authorization bypasses. PDF filenames/branding use synthetic customer data.

## Scenarios

P0 = money/access integrity; P1 = main flow; P2 = extended regression. Every ID is independently trackable; implemented slices and outstanding variants are recorded in [implementation status](IMPLEMENTATION.md).

### List, filters, and client scoping

- IV-L01 [P1]: Authorized staff opens list; seeded track IDs, dates, client/type/status and monetary columns match known records; count/pagination agree.
- IV-L02 [P1]: Apply track ID, creation range, due range, zone, type, creator, client and each status filter independently; assert included/excluded records. Combined filters narrow correctly and reset restores baseline.
- IV-L03 [P1]: Pagination/page-size changes have expected identities and no duplicates; restricting a filter from later page returns valid results rather than stale empty-page state.
- IV-L04 [P0, review-blocked]: Report totals match approved full filtered dataset, not only visible page; change page and assert totals retain correct scope. Reports-disabled variant omits summary requests/data without changing row correctness.
- IV-L05 [P0]: `/invoices/client/[uuid]` and client-detail embedded invoices show only selected client's data; conflicting numeric client filter must not override UUID scope. Navigate between clients and verify old rows do not persist.
- IV-L06 [P1]: Empty/no-match list is usable and reset recovers fixtures; server failure is distinguishable from a successful empty result. Normal subscriber billing list excludes separately seeded subscription invoice as intended.

### Create and edit

- IV-F01 [P0, review-blocked]: Create due invoice with approved multiline monetary fixture; list/detail reload confirms correct client/type/dates, ordered descriptions/quantities/amounts, discounts, payable total, zero paid and full outstanding; no payment record created.
- IV-F02 [P1]: Clear required dates/client/type/description, enter zero or negative unit price, zero/fractional quantity, and remove all lines; approved validation prevents save and preserves recoverable form data.
- IV-F03 [P1]: Add/remove/reorder lines where supported, edit quantity/unit price and discounts; displayed totals update. Saved/reloaded document reflects the final lines, without removed or duplicated entries. Confirm actual reorder UI before asserting drag/drop.
- IV-F04 [P1]: Create defaults dates/status correctly; changing choices while dropdowns load is preserved. Cancel creates nothing and returns to invoice list.
- IV-F05 [P0, review-blocked]: Create fully paid invoice with allowed fund/date; exactly one payment is recorded, approved fund balance changes, invoice paid/outstanding totals agree, and correct client due is refreshed.
- IV-F06 [P0, review-blocked]: Create partial invoice with 0 < partial amount < payable; approved status/payment/remainder persist. Zero/equal/excess partial values are rejected without invoice/payment side effects.
- IV-F07 [P1]: Paid/partial modes require fund, partial requires amount, and returning to due hides/omits payment-specific data; verify resulting server state rather than only hidden fields.
- IV-F08 [P1]: Open seeded due invoice edit directly; hydrated client/type/dates/lines/discounts match before changes. Edit description/date/note and save; detail/list reload agree and UUID identity remains stable.
- IV-F09 [P0, review-blocked]: Edit partially paid invoice under approved policy; existing payments remain truthful and forbidden total/client/status changes are rejected. Direct paid-invoice edit cannot evade approved restrictions.
- IV-F10 [P1]: Cancel edit/server validation failure preserves persisted original invoice. Rapid repeated save does not create duplicates or repeated payments.
- IV-F11 [P1]: Representative multibyte note over 65,535 UTF-8 bytes is rejected without save; accepted note persists. Exhaustive byte-boundary and formatting cases remain in existing Vitest tests; test bulk payment's separate note limit too.

### Collection and fund restrictions

- IV-P01 [P0]: Click pay on a due row with multiple outstanding invoices; dialog identifies correct client and every offered invoice, current discounts, amounts already paid, and remaining dues. Do not assume only clicked row is selected.
- IV-P02 [P1]: Select/deselect individual invoices and all; totals match selected fixtures only. No selection prevents submission. Cancel does not create payments or change balances.
- IV-P03 [P0, review-blocked]: Fully collect selected due/partial invoices; paid amounts, outstanding, statuses, one intended payment per eligible invoice, fund totals and client due agree after receipt closes and reload. Unselected invoices remain unchanged.
- IV-P04 [P0, review-blocked]: Partial collection across two invoices follows approved allocation order; verify exact per-invoice payment/remainder and total collected. Test amount below first due, exactly first due, between combined dues, and above combined due under approved rules.
- IV-P05 [P0]: Assigned-fund collector sees locked correct fund; forged alternative fund is denied by API. Missing-fund collector receives warning and cannot submit; unknown/loading profile also blocks premature submission.
- IV-P06 [P0, review-blocked]: Admin may select a permitted tenant fund; foreign/invalid fund is rejected. Paid/partial creation respects approved equivalent restrictions.
- IV-P07 [P0, review-blocked]: Without date-change or discount capability, relevant controls are unavailable and API rejects unauthorized alterations; permitted users can apply approved changes with correct audit/payment date.
- IV-P08 [P0, review-blocked]: Another collector settles an invoice after dialog opens; submit stale selection without overcollection or duplicate payments according to approved concurrency policy. Exercise rapid double-click/retry similarly.
- IV-P09 [P0, review-blocked]: Fail collection before commit and midway through multiple invoices; verify approved atomicity, truthful UI error, consistent fund/invoice/payment state, and safe retry. Never infer rollback merely from a failed response.
- IV-P10 [P1]: Due lookup fails or returns no payable invoices; no misleading payable dialog, stuck loading button, or success feedback; unrelated row actions remain usable.

### Discounts

- IV-X01 [P0, review-blocked]: Authorized collector applies permitted positive discount to an outstanding invoice; persisted invoice discount, line discount, payable, remaining due and refreshed selection totals match approved arithmetic. Existing paid amount does not change.
- IV-X02 [P0, review-blocked]: Zero/negative/over-outstanding discount is rejected in UI AND API without mutation. Include a partially paid invoice and verify it cannot be discounted below already collected amount.
- IV-X03 [P1]: Cancel discount retains values; server rejection preserves a recoverable dialog without success; reopening uses current server values rather than stale maximum due.

### Documents and receipt lifecycle

- IV-D01 [P1]: View action opens correct UUID document, lazily hydrates full detail, and displays expected track ID, client, dates, line items, note, discounts, paid and outstanding totals. Row click/action does not accidentally open another invoice.
- IV-D02 [P1]: Paid/partial row receipt action uses permitted print settings and correct branding/identities/amounts; closing and reopening does not reuse another client's document.
- IV-D03 [P0]: Successful full/partial payment opens receipt from actual returned invoice data and keeps it mounted while rendering/printing. Closing receipt refreshes client and invoice lists to persisted values, without submitting payment again.
- IV-D04 [P1]: Generate thermal PDF; Playwright observes download, nonempty PDF file, expected name and selected receipt count/content through an appropriate artifact check. Keep browser-print document action separate; intercept/instrument print invocation without driving OS dialogs. Physical printer quality requires manual acceptance.
- IV-D05 [P1]: Slow/missing/denied settings or detail fetch shows loading/error and prevents invalid document generation; retry/close remains usable. No fallback receipt may fabricate a successful payment.
- IV-D06 [P2]: Long invoice lines, Bangla text, long names, amount-in-words and multipage receipts retain readable totals/content. Review deterministic document artifacts; do not assert screenshot existence alone as layout correctness.

### Access, deletion, and tenant safety

- IV-A01 [P0]: Anonymous list/create/edit access requires staff login; subscriber session cannot use staff invoice CRUD/collection APIs.
- IV-A02 [P0]: Independently remove access/create/edit/pay/show/delete permissions; approved controls disappear and direct mutation/read paths enforce corresponding denial. Shared form's lack of local permission gate must not become permission to mutate by direct URL.
- IV-A03 [P0]: Tenant A cannot list/search/view/edit/delete/pay/discount or print tenant B invoice by known UUID, nor assign foreign client/fund/type relations. Assert absent financial side effects using fresh backend reads.
- IV-A04 [P0, review-blocked]: Reseller/assigned-zone user cannot use due lookup, discount, print hydration or mixed bulk UUID selection to bypass allowed scope. Decide whether mixed selections reject all or handle allowed subset before asserting results.
- IV-A05 [P1]: Cancel deletion preserves eligible no-payment invoice; confirm deletes only selected eligible invoice and refreshes list/client due after reload.
- IV-A06 [P0]: Deleting invoice with existing payment is rejected; invoice, payments and fund balances remain intact. Do not delete payment prerequisites to force this case to pass.
- IV-A07 [P0]: Logout/identity switch, back navigation, and reload never reveal previous tenant's cached rows, documents, due selections, or receipt data.
- IV-A08 [P1]: Session expiry/subscription denial during form/payment uses reviewed recovery, no false success, and no change recorded under a later identity.
- IV-A09 [P1, review-blocked]: Complete client → due invoice → payment journey updates client outstanding and approved dashboard metrics. Cross-reference CLIENT-001/DASHBOARD-001 but provision independent fixtures; respect approved invoice-date versus payment-date meaning.
- IV-R01 [P2]: Representative mobile width, keyboard use, English/Bangla and light/dark modes keep filters, line editor, payment controls and document actions reachable and clearly labeled.

## Implementation handoff

1. Record decisions above, especially arithmetic/allocation/authorization. Split this parent ticket into list/forms, collection/funds, discounts, documents, and access implementation tasks.
2. Establish dedicated fixtures with approved exact expected amounts and backend balance verification. Fix shared login/validation-submit prerequisites separately and preserve existing worktree edits.
3. Start list/client scoping and due invoice happy path; then reviewed money scenarios; then failures/documents and presentation. Use real isolated Laravel API for money integration, controlled server-reachable stubs for failures. Browser `page.route` cannot intercept server-action outbound API fetches.
4. Use semantic locators scoped to invoice/line/dialog, stable IDs only when needed. No arbitrary sleeps, positional first-option choices, production helpers for expected money, hidden swallowed errors, unconditional skips or success-toast-only assertions.
5. Generate host/persona auth state at runtime, keep secrets out of version control and artifacts, isolate mutable fund/account fixtures per worker, and clean up even after failure. No real outbound notifications or gateway payments.
6. Every scenario links to a spec or explicitly reviewed blocker/deferral. Report exact commands/environment/results, pass/fail/skip counts and traces. Independent reruns and enabled parallel execution must not collide.

## Definition of done and current verification

All reviewed cases have meaningful assertions proving persistence, identity, monetary effects and denied side effects. Product/backend defects are separate fixes, never expected permissive behavior or frontend-only security workarounds. Required repository checks are executed when implementing, artifacts are reviewed where output matters, and `.ai/report.md` is updated. Installs/push/deploy require approval.

Executable nonmutating slices now live in `tests/e2e/invoices/`, with `playwright.invoices.config.ts` and `npm run test:e2e:invoices`. Exact verification and limitations are recorded in [implementation status](IMPLEMENTATION.md) and [execution evidence](EXECUTION.json). Financial mutation scenarios remain incomplete; no whole parent scenario is credited passing from these slices. Frontend inspection and selected read denials do not prove complete tenant isolation.
