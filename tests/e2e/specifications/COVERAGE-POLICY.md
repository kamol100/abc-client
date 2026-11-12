# Coverage policy and AI implementation procedure

Read [mandatory initial guidelines](INITIAL-TEST-GUIDELINES.md) before implementation. Browser login must use CP/MK company hosts or APP administration host with explicit credentials/personas; localhost authentication is unsupported.

## What “more than 90%” means

Primary acceptance target: strictly more than 90% of the reviewed, applicable workflow scenarios pass with linked executable tests and fresh run evidence; 100% of P0 access, money, destructive-operation and identity scenarios must pass. Also require 100% of current pages mapped to an owning ticket and at least one meaningful executed behavior for each applicable route before calling the full suite complete.

Route mapping is planning completeness, not test coverage. A hundred page-load tests do not establish business correctness. This task maps the current page inventory but creates no executed coverage. New feature changes must add routes/scenarios to the register. Review/exclusion decisions must not silently remove failures from the denominator.

Code coverage is a different measurement. If >90% lines/branches/functions is also desired, separately approve instrumentation and file exclusions for browser and server execution plus Vitest coverage. Browser-only Playwright instrumentation does not measure Next.js server actions or Laravel authorization. This specification task neither installs instrumentation nor claims code coverage.

## Register states and evidence

`coverage-register.json` contains every currently identified scenario, initially `review=pending`, `status=draft`, empty `test_refs`, and no `last_run`. One scenario can require multiple parameter variants; split those into explicit child scenarios during review so a single passing variant cannot represent all cases.

Review values: pending, approved, excluded. Execution states: draft, ready, implemented, passing, failing, blocked, skipped. Exclusion requires nonempty `exclusion_reason` and `approved_by`; retain it in the register. Unsupported/defective features are blocked, not excluded simply to improve a score. P0 exclusions need explicit human scope approval.

A passing entry requires approved review; test_refs containing real spec path and exact test title; and last_run with passed result, environment, command, timestamp, source revision/worktree identity and artifact reference. Run evidence must correspond to current test/application state. The checker validates evidence shape, not truth or freshness: reviewers must verify the actual report and reject stale runs or source changes. Raw credentials/tokens/private customer data must not appear in evidence.

Report two percentages: readiness (approved applicable / all nonexcluded scenarios) and executed scenario pass coverage (evidence-backed passes / all nonexcluded scenarios). Pending-review scenarios stay uncovered so unfinished investigation cannot inflate coverage. Report P0 coverage separately. Publish blocked/failing/skipped counts and reasons, and route execution coverage separately. Do not claim overall target met before review is complete and every applicable route has execution evidence.

## Each AI task

1. Read feature ticket, source evidence, nearest implementation, shared conventions and relevant backend validators/resources/services/middleware. Resolve literal API templates to actual reachable calls. Check related unit/e2e coverage.
2. Expand proposed scenarios into explicit Given/When/Then, exact fixtures, included/excluded records and independent expected results. Resolve review questions; billing, privileges and destructive changes need human business review before those dependent scenarios are implemented.
3. Establish runtime persona/host auth, supported fixture setup, cleanup and controlled integrations. Fix strict login and validation-submit helpers in a separate prerequisite change, preserving existing edits.
4. Implement one feature/scenario group, title tests with scenario IDs, run independently and record actual evidence. Do not write the entire inventory as one giant PR.
5. Verify persistence, correct identity, independent money/stock totals, error/denial side effects and unrelated-record preservation. Do not mirror a production calculation to compute expected output or weaken tests to accept a product defect.
6. Update register, ticket spec links and `.ai/report.md`; run relevant specs and required checks. Only real completed runs earn passing status.

## Test layers and environments

Vitest owns exhaustive schema/helper/component branches and boundary combinations. Playwright owns assembled browser behavior. Real isolated Laravel integration covers session/server-action contracts and business persistence. Dedicated backend tests prove direct authorization and ownership; UI hiding cannot do that.

Dedicated test database/cache/storage/queue and registered tenant domains are required. Use disposable worker-owned funds/accounts/stock/packages for mutable cases, not only isolated browser contexts. Fake SMS/Telegram/email/payment/router/SNMP/CLI/map services as needed; no live production side effects. Server-action outbound API calls cannot be intercepted with browser page.route; use server-reachable stubs or backend test adapters.

No new dependencies, installs, production environment changes, push or deployment without required approval. Do not run Laravel commands from the frontend repository. Credentials and generated auth state stay out of source and artifacts.

## Rollout

- Foundation: auth/public setup separation, strict login assertions, validation-safe submit helper, role/tenant sessions, deterministic fixtures, teardown and trace/report artifacts.
- First gate: authentication, application shell, clients/invoices/payments/expenses/funds, permissions and tenant boundaries; all applicable P0 cases before money/destructive releases.
- Next groups: support, reseller/staff, stock/payroll/agents, subscription/platform administration, router/OLT/ONU/import with fakes.
- Then: remaining CRUD/lookups, communication, maps/reports, subscriber portal, public pages/settings and representative presentation checks.
- Pull requests: types, unit tests, Chromium smoke and changed-feature scenarios. Nightly: full Chromium regression, role/tenant/error variants; release: agreed Firefox/WebKit/mobile scope and sandbox integrations. Exact CI scope requires runtime validation and no silent flaky-test acceptance.

## Implementation prompt template

Implement the approved scenarios for `<ticket path>` and IDs `<IDs>`. First inspect referenced frontend/backend contracts and existing worktree changes. Do not implement unresolved business decisions; continue independent approved cases and report blockers. Use runtime role/tenant fixtures and fake external integrations. Keep tests independent; use semantic locators and fresh persistence assertions. Run relevant checks, report exact commands/results/artifacts, update coverage-register.json with truthful evidence and .ai/report.md. Preserve unrelated work. Do not install dependencies, push or deploy without required approval.
