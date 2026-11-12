# EXPENSE-001 — Expense management, approval, and fund integrity

- Status: Draft for review; every scenario remains unimplemented.
- Investigated: 2026-11-12, static source inspection only.
- Goal: Staff record and manage correctly scoped expenses; approval and changes produce only the intended fund effects, and unrelated financial records remain intact.
- Scope: `/expenses`, create/edit dialogs, inline status control, deletion, `/reports/expenses`, dashboard expense integration.
- Follow-ups: expense-type CRUD, salary generation, full fund/ledger management, exports not established in inspected expense UI, and notification-provider delivery.

## Source evidence

Frontend: `app/(dashboard)/expenses/page.tsx`, `app/(dashboard)/reports/expenses/page.tsx`; `components/expenses/{expense-table,expense-form,expense-column,expense-reports}.tsx`, `{expense-type,expense-form-schema,expense-filter-schema,expense-fund-access}.ts`; shared `components/invoices/payment-fund-access.ts`. Existing unit tests: `tests/unit/expenses/expense-fund-access.test.tsx`, `expense-status-select.test.tsx`. No expense-specific Playwright coverage found.

Backend sibling: `../isp-backend/routes/api.php`; `app/Http/Controllers/V1/Admin/ExpenseController.php`; `app/Http/Requests/{StoreExpenseRequest,UpdateExpenseRequest}.php`; `app/Services/Expenses/ExpenseService.php`; `app/Jobs/ExpenseFundJob.php`; `app/Http/Resources/ExpenseResource.php`; `app/Services/Filters/Expenses/{Filters,Any}.php`. Frontend workflow and canonical tenant architecture apply; do not infer backend authorization from UI controls.

## Observed contracts

- API paths relative to `/api/v1`: `GET /expenses` → `expenses.access`; `POST /expenses` → `expenses.create`; `GET /expenses/{expense}` → `expenses.show`; `PUT /expenses/{expense}` → `expenses.edit`; `DELETE /expenses/{expense}` → `expenses.delete`.
- Inline status: `PUT /expense-status/{expense}` → `expense.status.update` (singular). Frontend status visibility uses `expenses.approval`; status options pending/approved/declined. Route is outside the primary route-permission middleware group; inspected action has no explicit capability check or status validator.
- Resource returns UUID under `id`; frontend ExpenseRowSchema and edit props declare numeric IDs. Browser tests must retain API UUID identity and expose contract failures rather than coerce to NaN/numeric guesses.
- Form requires amount ≥1, staff, and expense type; fund/zone/voucher/date/note are nullable/optional. Create initializes date to today and defaults status pending. Empty voucher resolves to `no-voucher` on backend creation; expense display ID is generated and protected from update in service.
- Backend create/update accept amount ≥0, optional staff/type, voucher max255, note max1000, optional date, status pending/approved/rejected. Frontend allows arbitrary status string in schema but dropdown offers declined, not rejected. Requiredness/status parity needs review.
- Create fund choice: Admin/Super Admin OR `expenses.fund.update` can choose. Other users are locked to staff-assigned fund and blocked if no fund; profile-loading state also blocks. Edit allows fund selection with `expenses.edit` alone. Inspected request validators contain no equivalent assigned-fund enforcement or scoped relation existence checks.
- Status form/inline menu uses `expenses.approval`, while backend `resolveStatus` preserves requested status only for roles matching admin text; other roles receive pending on create/update. Inline update bypasses that resolver.
- Table passes create form based on `showCreateAction`, not a local `expenses.create` permission check. Row edit is gated by `expenses.edit`; delete modal has no local `expenses.delete` gate in ExpenseActions. Shared components/effective API authorization must be checked before claiming full behavior.
- Filters: any search (voucher/display expense ID/amount including formatted currency value), expense-date range, staff, zone, fund, type, status. Reports show total/pending amounts over filtered query, not just current page. Backend sums stored amount divided by100; confirm model conversion and expected money units when implementing.
- `/reports/expenses` reuses the table with create hidden; edit/status/delete controls are still the same column components. Do not assume report route is read-only.
- Approved create with fund dispatches ExpenseFundJob. Ordinary edit dispatches when fund exists; inline status dispatches only when new status is approved. Job creates expense transaction if approved and balance sufficient; insufficient balance sends notification. Nonapproved job path attempts reversal. No duplicate guard is visible in the inspected job.
- Service delete queries ALL FundTransaction rows with matching fund_id, deletes them, then deletes expense. This is a serious suspected financial-integrity defect; model observers/scopes must be examined before implementation, and unrelated-record preservation is the required regression intent.

## Review decisions and defects to resolve

1. Choose canonical negative status (`declined` or `rejected`) and allowed transitions. Align create/edit/inline/API validation and filter behavior; do not turn inconsistent accepted strings into intended requirements.
2. Define approval authority: `expenses.approval`, route permission, roles, or an approved combination. Confirm whether a non-admin approver can approve on create/edit and whether editing a previously approved expense resets it to pending.
3. Confirm required fields, zero/fractional amounts, date order/backdating, nullable fund, voucher default/uniqueness, note length, and validation copy.
4. Confirm fund permissions on create versus edit and enforce backend parity. Foreign/invalid staff/fund/type/zone identifiers must not bypass tenancy or assignment through API payloads.
5. Approve fund accounting: when debit occurs, how insufficient balance is represented, how amount/fund changes adjust old transactions, and whether approved→pending/negative reverses debit. Specify queue completion and exact expected balances.
6. Fix/audit deletion scope before any shared-data execution: deleting one expense must not delete another expense/payment/transfer transaction in the same fund. Regression intent is secure financial preservation even if current service fails it.
7. Define idempotency, repeated approval, queued retries, concurrent approvals, atomicity and rollback. Job currently shows no explicit duplicate prevention; inline reversal may not dispatch for nonapproved status.
8. Resolve UUID/numeric mismatch and null relations in resource hydration. Confirm expense display-ID uniqueness scope without asserting gap-free sequences.
9. Confirm report permissions and whether row mutation actions belong there. Confirm dashboard/report inclusion of pending/negative/approved expenses; do not infer total means approved spending only.

Financial cases remain review-blocked until exact expected behavior is recorded. Application/backend fixes are separate tasks, not permission to weaken tests or silently approve defects.

## Fixtures/environment

Dedicated database, queue worker (or approved deterministic queue mode), cache/storage namespace, and two registered company hosts. Personas: company admin, ordinary creator with assigned fund, creator with fund-change permission, creator without fund, editor without fund-change permission, approver without admin role, read-only staff, no-expense-access staff, reseller, zone-restricted staff, foreign tenant user, subscriber.

Seed local/foreign staff, funds, expense types and zones; pending/approved/canonical-negative expenses; unique vouchers/display IDs; dates inside/outside range; enough records for pagination; optional/null relationships. Distinguish internal numeric relation IDs from expense UUID and display expense_id.

For approval review propose starting fund A=1000, expense=100, expected approved balance=900; editing amount to150 should follow approved reconciliation (e.g.850), not duplicate full debit. For deletion/reversal seed an unrelated transaction in the same fund and assert its exact identity and amount survive. These are proposed reviewed fixtures, not authorization to apply production transactions.

Every mutation owns records AND funds/transactions per test or worker. Never run delete tests against shared development funds; current delete implementation may remove all their transactions. Teardown must use isolated fixture mechanisms, avoid defective deletion as general cleanup, and preserve diagnostic evidence on failure. Fake Telegram/other outbound delivery. Capture baseline/final transaction identities and balances through supported fresh backend reads. Use consistent backend/browser Asia/Dhaka time; browser clock does not control Laravel.

## Scenarios

P0 = money/access integrity; P1 = main workflow; P2 = extended regression. Each ID is independently tracked; all currently pending.

### List, filters, and reports

- EX-L01 [P1]: Authorized staff sees seeded expense display IDs, date, voucher, staff, fund, zone, type, amount/status, pagination count and expected records.
- EX-L02 [P1]: Search independently by known expense ID, voucher, and human-readable amount; included/excluded fixture identities match; clearing search restores baseline.
- EX-L03 [P1]: Apply date range, staff, zone, fund, type, and each approved status independently then combined; verify fixture inclusion and reset behavior.
- EX-L04 [P1]: Pagination/page-size changes preserve scope without duplicates; restrictive filtering from later page returns matching records rather than stale empty page.
- EX-L05 [P0, review-blocked]: Report total and pending amount match independently approved full filtered dataset across pages; date/status filters correctly update both figures.
- EX-L06 [P1]: Empty and no-match lists are usable; reset recovers known records. Failed query is distinct from valid zero-expense results.
- EX-L07 [P1, review-blocked]: `/reports/expenses` has report title and no create action; edit/status/delete availability follows approved permissions and report policy, with the same filtered totals.

### Create/edit and validation

- EX-F01 [P1]: Assigned-fund creator records valid expense; reloaded row/edit shows correct UUID/display ID, amount, selected staff/type/fund/zone, voucher, date, note and approved default status.
- EX-F02 [P1]: Missing amount/staff/type and amount below1 fail current frontend validation; form stays open and no expense appears. Zero/fractional acceptance follows reviewed policy rather than backend looseness.
- EX-F03 [P1]: Create initializes today's date; user choices survive dropdown/profile load; cancel creates nothing. Blank voucher produces approved default and optional values remain truthful after reload.
- EX-F04 [P1]: Edit seeded UUID with only row ID input; hydration shows original fund/staff/type/date/status before changes. Save amount/voucher/note/date; reopen confirms persistence and immutable display ID.
- EX-F05 [P1]: Clear optional zone/note/voucher under approved rules; no literal undefined/null markers are persisted or rendered. Null relation fixtures must not crash row/detail hydration.
- EX-F06 [P1]: Voucher >255 and note >1000 are rejected with recoverable field/form error and no save; accepted Bangla text persists. Confirm exact backend length semantics before boundary assertions.
- EX-F07 [P1]: Cancel edit or server rejection preserves original persisted values; draft remains recoverable where appropriate and no false success is shown.
- EX-F08 [P1]: Rapid repeated create/save produces one intended expense; independently created expenses receive unique stable display IDs in approved scope, without assuming contiguous numbers.

### Fund access

- EX-U01 [P0]: Ordinary create user sees only assigned fund locked; attempts to change/forge fund are rejected server-side under approved policy. Saved expense cannot reference alternate fund.
- EX-U02 [P1]: No-fund creator sees warning and cannot save; delayed/unknown profile blocks premature submit without falsely claiming permanent lack of access.
- EX-U03 [P0, review-blocked]: Admin or holder of `expenses.fund.update` may select allowed tenant fund during create; foreign/invalid fund is denied. Requiredness of nullable fund follows approved policy.
- EX-U04 [P0, review-blocked]: Editor without create fund-change permission can change fund only if approved edit policy permits; verify API parity, hydrated selection, and precise old/new fund effects for approved expense.

### Status and accounting

- EX-S01 [P1, review-blocked]: Authorized approver changes pending→approved; status persists after reload and exactly one intended transaction/debit completes after controlled queue processing.
- EX-S02 [P0, review-blocked]: Approved→pending and approved→canonical-negative follow approved reversal policy; original expense transaction is reconciled once, unrelated transactions untouched.
- EX-S03 [P0, review-blocked]: Repeat approval, select same status, retry queued job, and concurrent approval do not double debit. Verify transaction IDs/counts and final fund balance, not only status badge.
- EX-S04 [P0, review-blocked]: Edit approved expense amount/fund; approved delta/reversal/new-debit logic is correct, old transactions are not left as extra debits, and other records remain intact.
- EX-S05 [P1, review-blocked]: Insufficient fund follows approved rejection/pending/failure state; no unbacked success or misleading completed debit. Verify expense and ledger after job settles.
- EX-S06 [P1]: Delayed inline request disables conflicting change; failed update restores original displayed status, reports error and leaves saved status unchanged.
- EX-S07 [P0, review-blocked]: Without approval capability, badge is noninteractive and form status control unavailable; forged inline/create/edit status is denied or normalized according to approved authority model.
- EX-S08 [P0, review-blocked]: Invalid/missing status and stale approved expense updates fail safely with no ledger corruption; create/edit and inline agree on canonical values and allowed transitions.

### Delete and cross-feature results

- EX-D01 [P1]: Cancel deletion preserves target expense, fund balance, and transactions; dialog closes and reopen remains usable.
- EX-D02 [P0, review-blocked]: Delete isolated pending expense; only target is removed and unrelated same-fund expense/payment/transfer transactions survive unchanged. Current broad fund transaction deletion is a suspected defect this test must catch.
- EX-D03 [P0, review-blocked]: Delete approved expense under approved retention/reversal policy; exact target accounting is reconciled once, every unrelated same-fund record survives, and reports reflect approved totals.
- EX-D04 [P1]: Failed deletion shows truthful error and retains expected row/state after reload; do not remove prerequisites to force success.
- EX-D05 [P1, review-blocked]: Create/approve/change expense updates list report and dashboard expense metrics by reviewed exact deltas after refresh; independently seed fixtures rather than depend on DASHBOARD-001 execution.

### Access, tenancy, and resilience

- EX-A01 [P0]: Anonymous expense/report access requires staff login; subscriber session cannot read/mutate staff expense APIs.
- EX-A02 [P0]: Remove access/create/show/edit/delete separately; controls and direct endpoints honor approved capability. Creation/delete lack obvious local gates, so verify actual shared-component/backend behavior and report defects rather than bless visibility.
- EX-A03 [P0]: Tenant A cannot list/search/hydrate/edit/delete/change status of tenant B expense by UUID or reference foreign staff/fund/type/zone; no foreign financial data or side effects.
- EX-A04 [P0, review-blocked]: Reseller/zone-limited staff sees/mutates only approved scope across lists, dropdowns, show hydration, status, report totals, and fund jobs. Backend direct authorization tests remain required.
- EX-A05 [P0]: Logout/login on other tenant host and browser back/reload cannot restore previous user's rows, report totals or hydrated edit values.
- EX-R01 [P1]: Slow/failing dropdown/list/edit hydration remains recoverable; successful empty options are distinguished from failed requests, and stale options do not persist an incorrect relation.
- EX-R02 [P1]: Expired session/subscription denial during save/status uses approved recovery with no false success or mutation under a subsequent identity.
- EX-R03 [P2]: At representative mobile width, keyboard navigation, English/Bangla and light/dark modes, list/filter/create/edit/approval controls remain reachable and labels/statuses are understandable. Wait for animated report values using assertions rather than fixed sleeps.

## Handoff and definition of done

Review status/fund/approval/deletion decisions before financial implementation. Split parent ticket into list/forms, fund access, approval/ledger, deletion/integration and access tasks. Start with isolated list/create happy paths; backend fixes for financial/security gaps should land with regressions asserting correct behavior.

Repair shared auth/validation-submit helpers separately while preserving existing changes. Use semantic locators and scoped rows/dialogs, run/worker/test fixture identities, runtime-generated auth state excluded from commits/artifacts, and safe deterministic queue completion. Next.js server-action outbound API calls cannot be intercepted by browser `page.route`; use isolated real backend or server-reachable controlled stub. No arbitrary sleeps, swallowed failures, production accounting helpers for expected values, unconditional skips or weakened assertions.

Every ID links to executable coverage or reviewed blocker/deferral. Verify persistence, exact financial deltas and unchanged unrelated transaction identities with fresh reads. Independent reruns/parallel workers must not share mutable fund fixtures. Report commands/environment, pass/fail/skip counts and artifacts; run appropriate repository checks when implementing; update `.ai/report.md`. No new dependencies/push/deploy without approval.

Current verification: documentation only; no application/test/config/backend data changed, no tests executed. Static frontend/backend inspection does not prove tenant isolation or effective exploitability of suspected gaps.
