## PS-003 image transport — 2026-11-13

Added the same-origin upload, delete, and image routes for requester and platform support. The browser posts `FormData` to a fixed path and never receives the Sanctum bearer. The route handler checks `Origin` against `Host` and `X-Requested-With` on POST and DELETE, stops a body over 6 MiB, and forwards only the session bearer, `Accept`, `Content-Type`, and `X-Requested-With`. Image responses are `private, no-store` and `nosniff`. Error codes map to `platform_support.errors` in English and Bangla. `next.config.ts` was not given a larger server-action body limit. There is no composer or preview screen. That stays in PS-005 and PS-006.

The API behavior and Pest evidence are in the sibling `.ai/report.md` and in `tasks/PS-003-images.md`. This checkout's PHP CLI still reports `upload_max_filesize=2M` and `memory_limit=128M`. Those settings need approval before a real 5 MiB upload will pass PHP.

### Checks

- `scripts/ai/frontend-check` — typecheck passed. The full Vitest run then failed in date-picker, menu, maps, pay, client-dashboard, reseller-client, and column-visibility tests. Those files were not part of this change and were not investigated.
- `npx vitest run tests/unit/platform-support/attachment-transport.test.ts tests/unit/platform-support/attachment-proxy.test.ts` — 10 passed.
- `scripts/ai/status` and `scripts/ai/diff` inspected after the edits.

No browser session, dependency install, or push. The proxy was not clicked through a page.

## PS-002 core API record — 2026-11-13

Updated the platform-support contract and PS-002 task to match the isp-backend implementation. Recorded the `context` column, receipt `result_resumed`, reseller-id storage without a foreign key, the text-only 422 boundary, and the actual 200 envelopes. Added the disposable MySQL concurrency plan to PS-009 without starting that task. Adjusted the PS-001 remaining-blocker sentence because core thread routes no longer return 204. No frontend application code, types, or translations changed. Backend checks are in the sibling `.ai/report.md`. No dependency install, browser run, or push.

## PS-001 authorization record — 2026-11-13

Updated `.ai/features/platform-support/tasks/PS-001-authorization.md` to reviewable and recorded the isp-backend evidence there. No frontend application code, types, or translations changed. `AppPermission` is already `string`, and the settings envelope was left unchanged. Backend implementation and checks are in the sibling `.ai/report.md`. No dependency install, browser run, or push.

## HTML visual design for platform help/support — 2026-11-13

Created `design/platform-support/` as an isolated buildless HTML/CSS/JavaScript prototype: Help Centre/search/articles/FAQ/video presentation, persistent contextual Help drawer, own/company/reseller issue lists, issue creation/details/replies, image previews and image-only messages, resolve/reopen, chat with linked issue conversion, and app-tenant multi-tenant inbox with filters, assignment and read-only agent presentation. Includes English/Bangla (304 matching keys via existing i18next browser distribution), light/dark tokens and responsive layouts. Native controls and isolated HTML are intentional for the user's requested pre-coding design; production implementation must use project React wrappers and public/lang translations. Added design-reference links to the feature specification README; all implementation task statuses remain not started.

Preview is served on loopback `http://127.0.0.1:4177/` from this folder and opened in the browser. It also works by opening index.html directly. No API calls, actual uploads, socket connections, backend records, external fonts/CDNs, or localStorage; messages/images/roles are in-memory design simulations. Video presentation explicitly notes no real reviewed tutorial URL has been supplied. Synthetic invoice SVG contains only fictional sample data. Vendored the already installed i18next UMD build with its license; no package/dependency installation or application code changes.

Verification executed: node --check for app.js/locales.js passed; final 30 local jsdom interaction/source checks passed covering localization parity, search/FAQ/drawer/video, own/reseller/company/platform sample scope views, text escaping, local replies/resolve/reopen/conversion/history, image-only issue creation/max-five feedback, assignment/read-only controls, theme and Bangla article. Local HTML asset checks and PostCSS parsing (323 top-level nodes) passed. Earlier DOM runs stopped on test-navigation assumptions (new-issue button absent on detail; retained video tab before article lookup); corrected the test navigation and reran successfully without weakening assertions. Actual desktop Chrome visual inspection confirmed rendered Help Centre and issue list. Initial in-app browser attachment/native permission delays resolved via native Chrome; mobile/dark/Bangla rendering was not visually verified, and DOM checks do not prove browser layout or real authorization. No application Vitest/typecheck/Playwright suite run because this is standalone pre-coding design with no production app integration.

Inspected scripts/ai/diff and scripts/ai/status; checked new prototype assets separately because they are untracked. Preserved ongoing reseller suite/config/package/register/inventory/specification changes and prior report history, previous architecture/specification files, plus codex event/log files. No edits in isp-backend, production configuration, push or deployment. Updated this report as required.

## RESELLER-001 implementation — 2026-11-13

Added a partial reseller Playwright suite: `playwright.resellers.config.ts`, `npm run test:e2e:resellers`, and `tests/e2e/resellers/` (list, forms, detail, access, actions). The all-suite runner discovers the config. Login stays on CP and MK tenant hosts. No successful create, package reassignment, recharge settlement, purge, or import is submitted. Settings are toggled and restored. Invalid recharge calls are denied and the balance is read again.

Final verification:
- CP: `PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright E2E_RESELLER_ARTIFACT_DIR=/tmp/isp-resellers-cp npm run test:e2e:resellers` — 30 passed, 1 failed, 0 skipped (59.4s).
- MK: `PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright E2E_TENANT=mk E2E_RESELLER_ARTIFACT_DIR=/tmp/isp-resellers-mk npm run test:e2e:resellers` — 30 passed, 1 failed, 0 skipped (59.7s).
- The failure on both tenants is `RS-L02 username filter keeps only matching usernames and an unknown username is empty`. An unknown username returned total 1. `app/Services/Filters/Resellers/Filters.php` has no Username filter, so the query is ignored. The assertion stays at total 0.
- `scripts/ai/typecheck` passed.
- `npm run test:e2e -- --list` passed: 121 tests (clients 32, legacy 11, invoices 36, resellers 31, support tickets 11).
- `python3 tests/e2e/specifications/check_coverage.py` passed. Recorded pass coverage stays 0 because review is pending. RS-L02 is failing; ST-A03 was already failing.
- `scripts/ai/status` and `scripts/ai/diff` were inspected after the edits.

Both local companies have one reseller, so page 2 and the second-reseller client switch did not run. The linked reseller user is an Admin, so impersonation enter/leave did not run; the suite records the denial and leaves the staff list in place. The import dialog is not mounted. Client-wallet UUID masquerade is not on ClientResource. Page size was not changed.

Register and inventory record partial slices only. No parent scenario is passing. Review-blocked financial, identity, package, purge, and import scenarios stay unimplemented. Evidence is in `tests/e2e/specifications/resellers/EXECUTION.json`.

Preexisting `.ai/features/`, `.ai/support-architecture.md`, and codex log files were left untouched. No dependency install, backend write, commit, push, or deploy.

## Platform-support sequential feature specification — 2026-11-13

Created `.ai/features/platform-support/` with 14 Markdown files: README, product decisions/defaults, authorization contract, data/API contract, source evidence and nine ordered implementation tasks (PS-001–009). Covers a separate platform-support domain with issues/chat, linked chat-to-issue conversion, tenant/reseller/company permission scopes, app-tenant inbox, five private JPEG/PNG/WebP images per message at 5 MiB each, bounded incremental polling, per-reader unread/notifications and English/Bangla Markdown Help Centre/FAQ/video support. Existing customer/tenant tickets are explicitly preserved; the prior architecture alternatives are superseded by this specification.

User confirmed permission-based visibility, separate chat/issues with conversion, permitted app administrators/staff and image/polling/in-app defaults. Explicit implementation defaults cover baseline own access, optional exact-reseller/company scope, no implicit reseller hierarchy widening, lifecycle, image transport/staging and absent optional real video URLs. All schemas/routes/permission names are marked proposed; task statuses and execution evidence remain not started/pending. Backend work is described for the sibling checkout without changing it. Platform aggregate inbox requires a narrow documented tenancy exception; per-record actions stay constrained to trusted parent ownership. No legacy ticket fixes or general subscription/auth rewrite are silently included.

Verification executed: local Python consistency check passed across 14 Markdown files, all nine tasks indexed, local Markdown links resolved, task status/implementation record/acceptance sections present, selected source reference files exist. Reviewed lifecycle/read-cursor/idempotency/attachment ownership contract consistency. Inspected scripts/ai/diff and scripts/ai/status; reviewed newly untracked specification files separately. No application code, dependency installs, backend writes, migrations, live API calls, browser execution or application tests performed for this documentation-only task. Existing report history and `.ai/support-architecture.md` preserved; unrelated codex-events.jsonl, codex-repair-events.jsonl, codex-repair-stderr.log and codex-stderr.log left untouched. No push/deploy.

## Help Centre and platform-support architecture review — 2026-11-13

Analyzed frontend layouts, permission/i18n/query wrappers, ticket threads and marketing FAQ; inspected sibling Laravel ticket models/controllers/requests/routes, subscription mapping and canonical tenancy architecture. Delivered `.ai/support-architecture.md` and a managed comparison canvas. Recommended private en/bn Markdown with a shared permission catalog, server-authorized article/search/media delivery, contextual help throughout the staff app and a separate Laravel platform-support inbox. Existing subscriber-to-ISP tickets are a separate audience. Proposed DB-backed messages/read cursors, adaptive Query polling, incremental history and future private socket events. Alternatives: deliberate ticket-domain extension or separate docs/help-desk integration.

Static findings relevant to reuse: generic TicketMessage endpoints lack authorized-parent scope; nested ticket message routes omit permission middleware; ticket relation IDs lack tenant-scoped validation. These were reported, not changed or reproduced. Platform support needs explicit participant/reseller boundaries and audited platform access; no browser company-id authorization or writable ownership fields proposed. Documentation content can be tenant-independent, but authorized responses and chat caches must remain identity-scoped. No network-device operations proposed.

Verification: source review and official Next.js/TanStack Query/YouTube documentation; inspected scripts/ai/diff and scripts/ai/status. No application changes, dependencies, backend writes, browser actions, live requests to the ISP API, or application tests. Proposal details distinguish future routes/models from existing ones. Preserved prior report entries and unrelated untracked codex-events.jsonl, codex-repair-events.jsonl, codex-repair-stderr.log and codex-stderr.log. No commit/push/deploy performed.

## INVOICE-001 implementation

Partially implemented the invoice specification with 36 nonmutating Playwright checks across list, forms, documents, payments-dialog and access files. Added playwright.invoices.config.ts and npm run test:e2e:invoices; the existing all-suite runner discovers it automatically. Reused explicit CP/MK login/profile-verified in-memory auth without requesting the owned-client mutation fixture. Independent Zod resource schemas preserve invoice UUID identity under id and verify UI/API rows, relation dropdowns and rendered currency without importing production calculations as the oracle.

Coverage includes list/date/client/type/status/amount/reload, track/status/type/client/zone/creator/combined filters, actual pagination boundaries, UUID client history, no-match recovery, anonymous routes, selected bidirectional foreign UUID detail/search denial, invalid form recovery/defaults/cancel, unsaved lines/quantity totals, paid/partial field requirements, due edit hydration/cancel, oversized multibyte note rejection, document identity/lines/note/total, instrumented browser print/cleanup, delete cancellation and payment-dialog identities/select-all totals/cancel. No valid invoice create/update/delete/payment/discount, fund change or customer notification was submitted.

Final verification executed:
- E2E_INVOICE_ARTIFACT_DIR=/tmp/isp-invoices-cp npm run test:e2e:invoices: 36 passed, zero failed/skipped (about 1.3 minutes).
- E2E_TENANT=mk E2E_INVOICE_ARTIFACT_DIR=/tmp/isp-invoices-mk npm run test:e2e:invoices: 36 passed, zero failed/skipped (about 1.4 minutes).
- scripts/ai/typecheck: passed.
- npm test -- tests/unit/invoices: 12 files / 48 tests passed.
- npm run test:e2e -- --list: passed; 90 tests collected (clients 32, legacy 11, invoices 36, support tickets 11), no feature/legacy overlap. Full all-suite browser execution was not claimed; existing client mutation prerequisites remain.
- python3 tests/e2e/specifications/check_coverage.py: passed inventory/link/register validation; target remains unmet.
- scripts/ai/diff and scripts/ai/status inspected after edits.

Earlier runs caught and corrected test locator/assumption errors: dotted IDs rather than name attributes; untranslated static-option search keys; composite client dropdown labels; unlabeled delete trigger; missing creator field; single-page fixtures; payment button availability versus selection behavior. Superseded failures are not application defects. Final reports remain in /tmp/isp-invoices-{cp,mk}/results.json with sanitized exact titles/timestamps/source hashes in tests/e2e/specifications/invoices/EXECUTION.json.

Updated invoice README/spec/IMPLEMENTATION.md and register/inventory with 19 partially implemented parents. All other invoice parents retain explicit policy/fixture/implementation blockers. No complete parent scenario was credited passing; review remains pending. Financial arithmetic/allocation/concurrency/discount rules require the parent ticket decisions, disposable owned invoices, fake external integrations, independent fund/payment/client-balance checks and restricted personas. Current single-page datasets do not execute the multi-page branch. Creator filtering proves UI/API agreement only because InvoiceResource omits creator identity.

Source findings: InvoiceResource returns UUID under id while production row schema declares numeric id. View passes invoice.uuid, preventing lazy detail hydration for id-only resources; rendered fallback content was checked independently, but no hydration freshness coverage is claimed. Discount/due authorization questions from the ticket remain unverified source observations. Ordinary company tests never substitute platform administration. Known foreign invoice read denials do not prove reseller/zone or mutation isolation; no writable company_id/reseller_id was added. API remains the security boundary.

Existing login-form/auth helper/integration/session, opencode.json, client suite/config/specification, support-ticket suite/config/specification and prior runner work were preserved. This task adds only invoice suite/config, its npm script, its documentation/register entries and invoice guidance in tests/e2e/AGENTS.md. No dependencies installed, production settings edited, commits/push/deploy or backend mutations performed. Earlier task reports follow.

## Diagnosis: four isolated client failures

Inspected playwright-report/client-suite/results.json and the isolated fixture guard. All four clients-isolated tests failed with the same configuration error: Isolated client tests require E2E_CLIENT_MUTATIONS=1 and E2E_CLIENT_FIXTURE_FILE; no live router/customer mutations permitted. These failures do not establish a client UI defect: the tests stopped at their prerequisite guard before their create/edit actions.

Required setup is a disposable database, fake router/notification adapters, and a real tenant-owned network/package fixture JSON described in tests/e2e/clients/README.md. Both environment variables must reference that actual setup; setting attestations alone does not provision it. No guards changed, no tests skipped, no browser or mutation tests rerun. All-suite command remains inclusive as requested. Existing unrelated changes preserved. Ran scripts/ai/status and scripts/ai/diff; only this report changed during diagnosis.

## Correction: standard command includes every suite

User clarified npm run test:e2e must run all tests, including clients. This supersedes the prior client-only command decision below.

Added scripts/run-e2e.mjs, which discovers root-level playwright*.config.ts files, runs every suite sequentially with its own config/auth/report settings, continues after suite failure and exits nonzero if any suite fails. Standard test:e2e and test:e2e:ui use this runner; UI windows open sequentially. Focused suite scripts remain available. The legacy config now collects root-level specs only, preventing duplicate collection of client and support-ticket directories. Preserved existing legacy port/baseURL edits and new support-ticket work. Updated client README, agent instructions and initial guidelines. All client projects, including four guarded mutations, are included; absent fixtures fail explicitly.

Verification executed:
- npm run test:e2e -- --list: passed; collected 54 tests across three configs: clients 32 (28 nonmutating + four isolated), legacy 11, support tickets 11. No overlapping spec files.
- npm run test:e2e -- --list --grep '^E2E_RUNNER_NO_MATCH_SENTINEL$': intentionally returned exit 1 after all three suites reported no matching tests; proves continuation and aggregate failure without browser/database actions.
- node --check scripts/run-e2e.mjs: passed.
- scripts/ai/typecheck: passed.
- scripts/ai/diff and scripts/ai/status: inspected after edits.

Full browser execution was not repeated: isolated client mutation fixtures remain unavailable. This correction establishes full-suite selection and truthful failure reporting, not a claim that all 54 tests pass. Existing client CP/MK execution evidence remains below. No dependencies installed, no application changes or fixture guard weakening. Existing login-form/auth helper/integration/session, opencode.json and support-ticket changes were left intact.

## SUPPORT-001 Playwright coverage

Added `playwright.support-tickets.config.ts` and `tests/e2e/support-tickets` for the staff ticket list, create, conversation, and access scenarios that do not depend on an open review decision. Login uses CP and MK on their registered hosts, with credentials from the ignored tenant env and sessions kept in memory. `npm run test:e2e:tickets` runs this project. The default `npm run test:e2e` command is unchanged.

Owned tickets are created and deleted during the run. Creation writes in-app staff notifications. It does not send customer SMS. Review-blocked scenarios (ST-F08, ST-U01, ST-C06, ST-P05, ST-A02, ST-A04, ST-D01) were not implemented. Subscriber checks were not written because no subscriber credentials were supplied.

Command: `PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright E2E_TICKET_ARTIFACT_DIR=/tmp/isp-support-tickets npm run test:e2e:tickets`

Result at 2026-11-12T15:07:19Z on revision 64fcbb7: 10 passed, 1 failed, 26.5s. Evidence: `tests/e2e/specifications/support-tickets/EXECUTION.json` and `/tmp/isp-support-tickets/results.json`.

Passed: ST-L01, ST-L04, ST-F01, ST-F03, ST-C01, ST-C02, ST-C03, ST-A01, the ST-A03 read/search/open/reply/delete denial, and ST-A05. These stay `implemented` with pending review, so they are not passing coverage.

Failed: `ST-A03 a foreign client id cannot replace the ticket client`. A CP update with an MK client's numeric id removes the original visible client. `UpdateTicketRequest` accepts `client_id` without a company-scoped exists check. Cleanup writes the original client id back and deletes the ticket. The assertion was not weakened.

Empty subject on create currently shows the raw Zod text "Expected number, received nan" and prevents "Client is required" from appearing. ST-F03 therefore selects a subject and checks the client and message errors. Missing-subject behavior remains unasserted until review.

Specification checker passed. `scripts/ai/typecheck` is recorded after the fixture typing fix. No dependencies were installed. No application ticket code was changed.

Unrelated dirty files left in place: `components/login/login-form.tsx`, `playwright.config.ts`, `playwright/.auth/user.json`, `tests/e2e/auth-integration.spec.ts`, `tests/e2e/helpers/auth.ts`, `opencode.json`, and the existing client-suite files. Prior client-suite notes follow.

## Follow-up: standard Playwright command wiring

The reported 27 failures were collected under the legacy chromium project: npm run test:e2e previously invoked playwright test with the original config, which discovered client specs with the wrong base URL/setup and included isolated mutations without required fixture controls. The dedicated client config had passed independently but was not wired into the standard npm command.

Updated package.json so test:e2e, test:e2e:ui and test:e2e:clients select the nonmutating clients-chromium project. Added test:e2e:clients:isolated for guarded mutations and test:e2e:legacy for existing auth/vendor/zone tests. Added only the client exclusion to the already modified legacy config; preserved its preexisting port/baseURL edits. Updated client README and agent guidance. Default command currently covers the ready client project, not all features or legacy tests. No tests were deleted or weakened.

Verification: E2E_CLIENT_ARTIFACT_DIR=/tmp/isp-client-default-command npm run test:e2e passed 28 tests in 46.1 seconds against default CP. Report: /tmp/isp-client-default-command/results.json. Discovery checks selected 28 default checks, four isolated tests, and 11 legacy tests without overlap. scripts/ai/typecheck passed. Specification checker passed integrity checks; coverage target remains unmet. Isolated mutation and legacy tests were not executed in this follow-up. No dependencies installed. Unit tests were not repeated for script/config-only changes; previous failures remain recorded below.

Unrelated login-form, auth integration/helper, tracked auth-state and opencode.json changes were preserved. The preexisting default config changes were preserved alongside the explicit exclusion. Prior implementation details follow.

## Summary

Partially implemented CLIENT-001 in tests/e2e/clients with an independent tenant-aware playwright.clients.config.ts. Added explicit CP/MK credential loading, strict same-origin UI login and independent REST profile verification, host-specific in-memory sessions, independent transport contracts, owned-client setup/cleanup guards, and scenario IDs in test titles. Default Playwright config/global setup/auth helper and existing application changes were preserved.

28 nonmutating browser checks cover list/total/reload; name/PPPoE/phone search; status and billing filters; month deep link; empty results; detail links/name/package; phone/WhatsApp targets; missing fields and minimum name; create cancel/defaults; four anonymous route denials; and bidirectional CP/MK known foreign UUID read/search denial. Four isolated mutation tests cover UI create, edit/preserve billing, cancel edit and optional IP clearing; collected/typechecked but not executed without isolated fake-backed fixtures.

Added runner README, all-48-scenario IMPLEMENTATION.md and sanitized EXECUTION.json with exact test titles, run commands, timestamps and source hashes. Updated CLIENT-001/register/inventory and agent guidelines to identify the separate runner. No whole parent scenario was credited as passing from incomplete slices; 16 parents have implemented slices and 32 remain blocked/pending prerequisites. This is not full CLIENT-001 completion or >90% coverage.

## Executed checks

- scripts/ai/typecheck: passed after implementation.
- CP: client Chromium project: 28 passed; command/timestamp in EXECUTION.json. Raw report /tmp/isp-client-e2e-cp/results.json.
- MK: client Chromium project: 28 passed; command/timestamp in EXECUTION.json. Raw report /tmp/isp-client-e2e-mk/results.json.
- Isolated project --list: four tests collected; no mutation execution.
- scripts/ai/test: failed in ten unchanged unit-test files (date pickers, menu, column persistence, reseller-client list/filter, client dashboard info, pay, maps); no fixes to those files included.
- Specification checker: inventory, links, IDs and register integrity passed.
- Earlier browser runs exposed fixture schema/selector/hydration issues; corrected and superseded by final passing CP/MK runs. Shared report directory was cleared during verification, so final evidence uses isolated run-specific output folders.

## Findings / prerequisites

API returns numeric SID/payment_deadline whereas application schema expects strings; tests use independent transport schema without changing application code. Desktop filter trigger lacks an accessible name; tests identify its rendered funnel icon. Create bootstrap can lose early typed values/native-submit before asynchronous defaults settle, so helper waits at create bootstrap only. Next-SID hint is configured but not rendered by current shared field code; no passing hint coverage claimed.

Full mutation tests need disposable database and fake router/SMS/Telegram adapters, tenant-owned network/package fixture and cleanup permissions. Restricted staff/subscriber/reseller/zone accounts and controlled server errors were not supplied. Review-blocked billing/locking/deletion/image cases remain explicit. Asked for fixture location while continuing independent checks; no reply received. No valid client save, customer notification, payment or hardware mutation was executed.

Tenant A/B read denial was verified for selected known clients; this does not prove all API mutation paths or full tenant isolation. APP administration was not substituted for company personas.

## Existing changes left untouched

components/login/login-form.tsx, playwright.config.ts, playwright/.auth/user.json, tests/e2e/auth-integration.spec.ts, tests/e2e/helpers/auth.ts and untracked opencode.json. Existing feature workspaces preserved except CLIENT-001 status/register links and suite guidance. Updated this report as required.


## Cursor platform-support execution guidance — 2026-11-13

Reviewed the platform-support README, nine task specifications, frontend feature workflow and architecture rule to answer how to instruct Cursor. The specification already requires PS-001 through PS-009 sequentially, with upstream acceptance evidence before downstream implementation. Recommended opening both sibling repositories, planning the current task against actual source, implementing one task per checkpoint and recording tests/blockers before advancing. PS-008 retains its six sequential content batches. No feature implementation or task-status changes performed.

Verification: ran scripts/ai/status before the report addition, and scripts/ai/diff plus scripts/ai/status afterwards. Application tests were not run for guidance/report-only work. Existing report entries preserved. Unrelated package.json, e2e guidance/register/inventory/reseller files, platform-support specifications/design, reseller suite/config and Codex logs were left untouched. No backend edits, dependency installations, commit, push or deployment.
