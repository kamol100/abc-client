# ISP Referral Partner Program implementation workflow

Status: RF-001 through RF-008 implemented · Browser acceptance passed 19 November 2026

Use the [BDT-only SQL schema](schema.sql) as the data design. Implement in the Laravel backend and Next.js frontend using the sequence below. The program credits one seller for each new ISP tenant, makes the contracted commission payable on final platform approval, and marks it paid when finance records the completed transfer.

## Execution order

1. [RF-001 — Schema and models](#rf-001--schema-and-models)
2. [RF-002 — Seller enrollment and contracts](#rf-002--seller-enrollment-and-contracts)
3. [RF-003 — Referral capture and pending panel API](#rf-003--referral-capture-and-pending-panel-api)
4. [RF-004 — Final sale approval and commission](#rf-004--final-sale-approval-and-commission)
5. [RF-005 — Payout recording and earnings history](#rf-005--payout-recording-and-earnings-history)
6. [RF-006 — Tenant removal and financial history](#rf-006--tenant-removal-and-financial-history)
7. [RF-007 — Seller and platform admin UI](#rf-007--seller-and-platform-admin-ui)
8. [RF-008 — End-to-end acceptance](#rf-008--end-to-end-acceptance)

RF-001 through RF-008 have implementation and verification evidence. See the acceptance record below for environment and baseline check limitations. Complete each task's acceptance checks before building on it. Record the task ID, test IDs, commands and results, and any blocked checks in the report for each repository edited. Read both AGENTS.md files, the applicable workflows, and the [backend tenant architecture](../../../../isp-backend/docs/architecture/multi-tenancy.md). Inspect the actual route, service and resource before implementation. Use `scripts/ai/status` before editing and `scripts/ai/diff` plus `scripts/ai/status` afterward.

## Required implementation conventions

- **Frontend.** Follow [Zones](../../../components/zones) for straightforward management forms and tables, and [Expenses](../../../components/expenses) for filtered lists and totals. Keep App Router pages thin like the existing [Zones page](../../../app/(dashboard)/zones/page.tsx) and [Expenses page](../../../app/(dashboard)/expenses/page.tsx). Place referral code in a feature folder under `components/`. Follow the existing file split for types, form schema, form, columns, table, and filter schema where needed. Reuse `FormBuilder`, `DataTable`, `useApiQuery`, `useApiMutation`, and the project's dialog and button wrappers. Keep permission checks and English/Bangla translation keys in the usual places.
- **Backend.** Follow the existing [Expense controller](../../../../isp-backend/app/Http/Controllers/V1/Admin/ExpenseController.php), [service](../../../../isp-backend/app/Services/Expenses/ExpenseService.php), [filter pipeline](../../../../isp-backend/app/Services/Filters/Expenses/Filters.php), [resource](../../../../isp-backend/app/Http/Resources/ExpenseResource.php), and [collection](../../../../isp-backend/app/Http/Resources/ExpenseCollection.php). Use FormRequests for validation, thin controllers for orchestration, feature services for business rules and transactions, the existing filter pipeline for list filtering, and API Resources/Collections for serialization and pagination. Wrap them in the standard controller response envelope. Start the filter pipeline from the referral query already scoped to the authorized seller or platform capability. Calculate totals from that authorized scope. Keep models, requests, controllers, services, filters, and resources in their existing Laravel layer directories.
- **Task review.** Compare new files with the reference modules before marking a task complete. Record any necessary structural deviation and its reason in the task evidence.

## Product and API contract

- A seller can be a tenant manager, reseller representative, or independent salesperson. A seller profile belongs to one existing admin identity. A new standalone salesperson uses existing admin authentication with referral-only access. Existing platform sales staff can also enroll, retaining their existing roles and permissions. For the first version, the enrolled seller is the payout recipient.
- A referral retains the seller contract effective at submission. Contracts are either a positive fixed amount in poisha or a rate from 1 to 10,000 basis points. The confirmed sale value is the percentage base. All monetary values are positive BDT amounts stored as integer poisha, except an optional estimate may be omitted. Use integer arithmetic and round percentages half up to the nearest poisha.
- A submitted referral is **Pending**. A fixed contract shows the agreed amount, a percentage contract with an estimate shows the estimated commission, and a percentage contract without an estimate shows **TBD**. A rejected referral remains visible as **Rejected** and contributes nothing to earnings totals.
- **Approve Sale** is an explicit platform action. Demo approval can provision and link a new tenant. A subscription invoice, payment, wallet recharge or renewal leaves the referral's commission state as it was. For assisted sales, use a company created for the referred sale through the platform onboarding flow. Final approval creates one commission and makes it **Payable**. Finance records one full completed transfer, which makes it **Paid**.
- Use the standard API envelope and list pagination. Use UUIDs for referral routes exposed to browsers. Derive seller identity from the authenticated user or validated public code. Resolve tenant identity through trusted provisioning records or an explicitly authorized platform target. Return only the minimum customer information a seller needs. Preserve separate list totals for Pending estimates, Payable and Paid.
- Define concrete route names when the Laravel endpoints are introduced. Use matching permissions in Next.js. Seller routes require ownership, platform actions require platform identity and the relevant permission, and audit events identify the actor and action. Verify referral-only users can reach their authorized referral screens on the real login, session and subscription path.
- The initial payout records a transfer sent through the existing finance process. Reconcile payments using the recorded reference. Automated transfers, split payouts, recurring commissions, buyer discounts and contract payees other than the enrolled seller are outside this first version.

## RF-001 — Schema and models

**Deliverable.** Add Laravel migrations and models for `referral_sellers`, `referral_contracts`, `referrals`, `referral_commissions` and `referral_payouts`. Use the planned SQL keys and foreign-key deletion behavior. Adapt migration syntax to the supported engines. Use explicit relationship names for origin company and referred company. Keep the platform records outside ordinary tenant operations and retain company provenance for the later purge work.

**Required tests**

- **RF-001-T01** · Apply the migrations through the isolated SQLite test runner and verify the five tables and relations against existing fixture users, resellers, companies and demo requests.
- **RF-001-T02** · Verify unique normalized referral codes, one seller profile per user, and one contract start for a seller at a given time.
- **RF-001-T03** · Verify multiple unlinked referrals are allowed. Verify duplicate demo-request attribution, customer company ID or historical company UUID, commission per referral and payout per commission are rejected.
- **RF-001-T04** · Verify invalid fixed/percentage shapes and monetary bounds through the validation layer. Check the schema for integer monetary fields and zero currency-code columns. Exercise MySQL-specific constraints in a disposable environment where available and record any engine coverage gap.

**Complete when** the checked-in migrations, models and constraints match the agreed schema and the isolated backend tests pass.

## RF-002 — Seller enrollment and contracts

**Deliverable.** Add platform endpoints to enroll or deactivate a seller, show seller details, and create immutable contract versions. Reuse the existing admin account lifecycle for independent sellers. Validate tenant/reseller enrollment context from the selected user's assignments. Choose the latest version effective at submission. Audit enrollment, deactivation, and contract creation.

**Required tests**

- **RF-002-T01** · Enroll a tenant manager, a reseller representative and an independent seller with a valid admin identity. Reject mismatched company/reseller assignments, duplicate user enrollment, and duplicate codes even with case differences.
- **RF-002-T02** · Save fixed and percentage versions. Reject negative or fractional raw amounts, rates outside bounds, mixed terms, and conflicting effective dates.
- **RF-002-T03** · Select the version effective at the exact start time, where future versions exist, and after a later version becomes effective. Verify a seller without an effective contract cannot create an attributed referral.
- **RF-002-T04** · Deny anonymous users, subscribers, regular tenant users, sellers and platform users missing the enrollment permission. Verify an independent seller can authenticate with the referral role and receives no platform management capabilities.
- **RF-002-T05** · Deactivate a seller and verify the code stops accepting new referrals. Verify existing contracts and history are retained.

**Complete when** all three seller types can be enrolled, their terms are deterministic, and platform enrollment is permission-gated.

## RF-003 — Referral capture and pending panel API

**Deliverable.** Extend the existing public `POST /demo-request` flow to accept an optional referral code. A submitted code must resolve to an active seller and current contract. Return a generic validation message for an invalid code so the prospect can remove it and continue. Record demo submission and attribution together. Support direct seller submission and platform-assisted attribution before final approval. Link through the existing demo provisioning result or an authorized platform company selection. Expose paginated seller and admin reads with status, allowed display fields, estimates, totals and permitted actions.

**Required tests**

- **RF-003-T01** · Submit a demo with a valid code and verify exactly one pending referral tied to the demo and active contract. Submit without a code and verify the existing demo behavior and response. Invalid or inactive codes return a generic 422 without a partial demo/referral.
- **RF-003-T02** · Submit directly as a seller and record a platform-assisted referral. Verify fixed, percentage with estimate, and percentage without estimate display amounts. Reject supplied authority fields that attempt to change seller, contract, approval status, commission or chosen tenant.
- **RF-003-T03** · Approve the referred demo. Verify the new `companies.id` and UUID are linked and the referral stays Pending. Failed provisioning leaves attribution and commission data consistent. Reject attempts to link a conflicting demo or previously credited tenant.
- **RF-003-T04** · Change the seller's rate after referral submission. Verify the saved contract and pending estimate continue to use the original terms.
- **RF-003-T05** · Test list, totals and detail with two sellers in the same company, a seller in a different tenant, an independent seller, a subscriber, and a restricted platform account. Verify each seller sees only their rows and totals. Verify response fields omit private demo data and internal finance fields beyond the seller's own payout information.
- **RF-003-T06** · Replay attribution on the same saved demo. Verify a single referral. Check pagination, status filters and stable ordering with mixed seller data.

**Complete when** public, direct and platform-assisted paths create a correctly attributed Pending referral, and seller totals and details stay isolated.

## RF-004 — Final sale approval and commission

**Deliverable.** Add platform sale approval and rejection actions. Approval requires a linked, eligible new ISP tenant and a positive confirmed sale value. Lock the pending referral, calculate from its saved contract and create the commission in the same transaction as the approval. Record the actor, time and decision. Reject self-referrals and attempts to credit the same tenant twice. Rejecting a referral closes it with a reason and no earning.

**Required tests**

- **RF-004-T01** · Confirm a fixed contract pays its stored amount. Confirm 10% of ৳20,000 produces 200,000 poisha. Test half-poisha rounding, zero rounded commission, invalid sale values, and schema/application numeric boundaries.
- **RF-004-T02** · Reject approvals for a missing, mismatched, duplicate, existing ineligible or self-referred tenant. Verify a new tenant provisioned for a demo remains eligible for its own referral. Verify sellers, finance-only users, and platform staff without approval permission cannot decide a referral.
- **RF-004-T03** · Approve the same referral twice and submit competing approvals for the same tenant. Verify one commission. Force commission persistence to fail and verify the referral remains Pending with no success audit. Test simultaneous submissions in an isolated shared database when available. A serial retry alone does not establish concurrency coverage.
- **RF-004-T04** · Reject a pending referral and verify status, review reason and no commission. Verify approval/rejection cannot rewrite a terminal decision through this flow.
- **RF-004-T05** · Verify existing demo approval, subscription invoice payment, free trial, wallet recharge, and renewal flows leave referral earnings alone. After explicit sale approval verify Payable status and correct totals, with approver and timestamp recorded.

**Complete when** one authorized decision reliably produces one payable commission and retry/failure tests pass.

## RF-005 — Payout recording and earnings history

**Deliverable.** Add a finance-authorized action to record one full settled transfer against a payable commission. Under a lock, derive the amount from the commission and require the method, transfer reference and payment date. Record the finance actor and expose paid status, amount and reference to the owning seller. The interface records the completed transfer after it happens.

**Required tests**

- **RF-005-T01** · Record the full payout for a payable commission. Verify DB amount equality, actor/time/reference, the seller's Paid row, and the move from Payable total to Paid total.
- **RF-005-T02** · Reject blank references, invalid dates or methods, inconsistent amounts and payout attempts for a Pending or Rejected referral. Deny the seller and any platform user without finance permission.
- **RF-005-T03** · Retry the same recording and try a conflicting reference. Verify one payout row, one successful payout event, and no value increase. Verify a failed insert leaves the commission Payable.
- **RF-005-T04** · Try to view or record another seller's payout using a known referral UUID. Verify denial and no leakage through lists or totals. Verify the seller cannot submit a Paid state directly.

**Complete when** finance can reconcile the recorded transfer and the owning seller can see accurate earnings history.

## RF-006 — Tenant removal and financial history

**Deliverable.** Integrate platform referral cleanup with explicit tenant and relevant account deletion paths. Inspect the existing company export/purge implementation, which disables foreign-key handling while purging. Deactivate affected seller profiles and detach live references that would become dangling. Preserve contract versions, the referred company's UUID, commission amounts, completed payouts and the authorized history. Keep referral finance records out of tenant exports.

**Required tests**

- **RF-006-T01** · Purge a referred tenant with a payable or paid commission. Verify the tenant FK is cleared, historical UUID survives, the finance records still reconcile, and reuse of the same UUID cannot create a second commission.
- **RF-006-T02** · Purge a seller's original company, reseller or user through supported delete paths. Verify the code/login loses access through the old identity and finance still has authorized access to retained records.
- **RF-006-T03** · Verify demo deletion clears the optional link and preserves valid attribution/history. Verify unrelated sellers and customers retain their live links. Verify a tenant export contains no platform referral ledger or payout data.

**Complete when** existing purge and export behavior passes regression checks and referral financial history survives deletion.

## RF-007 — Seller and platform admin UI

**Deliverable.** Implement the approved mockup inside the existing dashboard. The seller view shows the share link, Add Referral action, status filters, earnings totals and referral/payout detail. Platform views manage sellers and contract versions, attribute referrals, approve or reject sales, and record payouts. Integrate the optional public referral code into the existing demo form. Use the Zones and Expenses structure and shared components described above, with route-derived permissions and English/Bangla labels.

**Required tests**

- **RF-007-T01** · Cover fixed and percentage contract form validation, poisha/BDT formatting, honest Pending/TBD estimates and final approval previews. Verify API validation errors map to the relevant fields.
- **RF-007-T02** · Cover public referral-link capture and normal demo submission without a code. A rejected code can be cleared and the prospect can resubmit. Direct seller submission refreshes their list and totals.
- **RF-007-T03** · Verify action visibility and direct navigation for seller, restricted staff, approver and finance. Confirm the UI sends no tenant or seller authority fields on seller requests. An impersonation change, logout or different login clears the previous user's referral results.
- **RF-007-T04** · Verify approval, rejection, and payout invalidate the relevant rows and totals. Exercise empty, loading, error and retry states. Check keyboard operation, mobile and desktop, light/dark, and English/Bangla. Verify dialogs and refreshed data do not jump the page scroll.

**Complete when** all live UI paths use authorized backend endpoints and the checked views match the approved design and repo conventions.

## RF-008 — End-to-end acceptance

**Deliverable.** Add and run a Playwright referral suite using a running local or disposable frontend/API and seeded role accounts. Use unique fixture records, separate authenticated contexts for each actor, and a controlled tenant provisioning path. Record payout references as test data. No real money movement, customer notifications or equipment access is required for the suite.

**Required scenarios**

- **RF-008-E01** · As platform admin enroll a tenant manager, reseller and independent seller. Confirm their unique codes, then sign in as each seller and verify they land in their own referral panel.
- **RF-008-E02** · Follow a referral link and submit a demo. Confirm Pending in the seller panel. Review and approve the demo to provision the new tenant, confirm the seller still sees Pending, then explicitly approve the sale at ৳20,000 on a 10% contract. Verify Payable ৳2,000. Record the full payout as finance and verify Paid with the same reference after the seller reloads.
- **RF-008-E03** · Submit a direct or assisted lead on a fixed contract. Verify exact Pending commission and captured terms after a rate change. Approve the sale and verify the fixed amount. Reject another lead and verify no earning.
- **RF-008-E04** · Attempt to credit the same tenant a second time or repeat sale approval/payout. Verify the single earning and the single payout survive retries without changes to totals.
- **RF-008-E05** · Exercise direct URL/API denial as another seller, reseller peer, anonymous browser and unauthorized platform account. Verify no leaked rows, totals, customer details or payout references.
- **RF-008-E06** · Exercise the seller and admin flow at desktop and mobile widths. Check keyboard operation and verify English/Bangla and light/dark in representative screens. Confirm ordinary demo submissions still work.

**Complete when** the required backend, frontend and end-to-end checks have recorded results and required scenarios pass. If environment or fixture access blocks a check, record the exact prerequisite and scenario. Keep the feature status open until acceptance is verified.

## Check commands and evidence

- **Backend:** Run `scripts/ai/backend-test` for the affected Pest feature files and run the repository's changed-file Pint/PHPStan checks. Backend tests use the configured SQLite test database. Use any additional database only under the applicable repository approval and test-environment rules.
- **Frontend:** Run `scripts/ai/frontend-check` for TypeScript and Vitest. Run the dedicated referral Playwright spec in RF-008 with the documented isolated environment and fixtures. Keep separate evidence for unrelated baseline failures and any referral regression.
- **Acceptance record:** For each task, capture the commit or diff reviewed, fixture and environment description, exact command, pass/fail or blocked result by test ID, and any follow-up decision. Store sanitized evidence without credentials or customer data.

All eight tasks have been implemented. Use the API notes below and the acceptance record for review and release preparation.

## Implemented API handoff · RF-001 through RF-003

- `GET /api/v1/platform-referral-sellers` lists sellers. `POST` enrolls an existing admin user by `user_uuid`, `seller_type`, and `code`. Use the seller's numeric ID for detail, `PATCH /{seller}/deactivate`, and `POST /{seller}/contracts`. Contract creation accepts `effective_at`, `commission_type`, and either `fixed_amount_minor` or `rate_bps`. Amount input is capped at 999,999,999,999 poisha so percentage arithmetic stays within signed integer bounds.
- `POST /api/v1/demo-request` accepts optional `referral_code`. A valid code and the demo request are saved in the same transaction. Invalid, inactive and contractless codes share the same validation message.
- `GET /api/v1/referrals` returns the seller's own rows, their profile/code, totals and actions. `POST` accepts `prospect_name` and optional `estimated_sale_minor`. `GET /api/v1/referrals/{uuid}` returns one owned lead.
- `GET /api/v1/platform-referrals` and `GET /api/v1/platform-referrals/{uuid}` return authorized platform records. `POST /api/v1/platform-referrals` attributes `referral_code` with an optional `demo_request_id`, an optional estimate, and `prospect_name` when there is no demo ID. An identical attribution returns the existing referral. Attach a new attribution before the demo provisions its company.
- Demo approval links the company in the existing provisioning transaction. A company created directly by authorized platform staff can link a standalone pending referral by sending `referral_uuid` to `POST /api/v1/companies`. This operation also requires the existing company-create permission. A linked referral stays Pending.
- List filters accept `status=pending|payable|paid|rejected`. Totals cover the full authorized scope across all statuses, independent of the selected list filter and page. Amount fields are in poisha. The sale decision and payout actions below create Payable and Paid records.
- The seller's authenticated capabilities are returned by `/api/v1/user-settings`. The existing platform permission catalog sync includes the new admin names for delegated access. Deployment must apply the new migration before the new API code serves requests. This implementation was exercised only in the test environment.

## Implemented API handoff · RF-004 through RF-006

- `POST /api/v1/platform-referrals/{uuid}/approve` requires `platform-referrals.approve`, `approved_sale_minor`, and optionally `decision_note`. It approves the linked active new tenant, calculates the commission from the saved contract, and returns the Payable referral. An exact retry returns the same decision. A changed amount or note on an already decided referral is rejected.
- `POST /api/v1/platform-referrals/{uuid}/reject` requires `platform-referrals.reject` and a `decision_note`. It closes a pending referral with no commission.
- `POST /api/v1/platform-referrals/{uuid}/payout` requires `platform-referrals.payout`, `method` (`bank`, `bkash`, `nagad`, `rocket`, or `cash`), `transfer_reference`, and `paid_at` (ISO 8601). The API derives the full payout amount. An exact retry returns the original record, and conflicting transfer details are rejected. RF-007 should label this action as recording a completed transfer.
- Platform list responses expose `can_approve`, `can_reject` and `can_record_payout` under `actions`. Read the row's `status` and `tenant_available` along with those capabilities. `tenant_linked` remains true for the historical UUID after purge. The platform resource includes the final sale value, decision date and note. The owning seller sees amount, payout method, reference, and date.
- Company, reseller and account deletion detach affected live references and preserve the referral ledger. Removed sellers lose the old profile's access and code. A purged customer's UUID remains reserved, including after a tenant export is restored. Ledger records stay out of company and reseller exports.

## RF-007 and RF-008 acceptance · 19 November 2026

The frontend includes `/referrals`, `/platform-referrals` and `/platform-referral-sellers`. It follows Zones and Expenses with thin pages, FormBuilder dialogs, DataTable lists, scoped API queries and permission-gated actions. The public demo form captures a referral link's code and lets the prospect correct or clear an invalid code. Platform staff can enroll an existing user, add contract versions, attribute demos or direct leads, provision their company, approve or reject the sale, and record a completed payout.

The referral fields display BDT amounts and percentages. Their payloads use integer poisha and basis points. English/Bangla translations cover the feature, with light/dark and narrow-width verification. Shared form labels now point to their controls so keyboard and assistive-technology users can identify them.

Run `npm run test:e2e:referrals` from the frontend repository. The [runner instructions](../../../tests/e2e/referrals/README.md) explain the disposable backend and scratch frontend setup. The runner verifies real browser login and real Laravel requests on the registered tenant hosts, with generated accounts and external side effects faked.

- **RF-007-T01** passed amount/percentage parsing, half-up previews, schema payloads, and server validation shown beside fields.
- **RF-007-T02** passed link capture, invalid-code clearing, direct referrals, assisted attribution and public demo submission.
- **RF-007-T03** passed restricted/approver/finance UI checks, exact seller payload inspection, and logout followed by a different seller in the same browser.
- **RF-007-T04** passed mutation/list/totals updates, empty/loading/error/retry states, keyboard dialogs, 390 px mobile and desktop, English/Bangla, light/dark, and scroll position checks.
- **RF-008-E01 through E06** all passed in the disposable Chromium run. The [acceptance evidence](evidence/RF-008.json) records commands, results and source hashes. [Desktop](evidence/seller-paid-desktop.png) and [mobile Bangla/dark](evidence/seller-mobile-bangla-dark.png) screenshots were visually inspected.

Typecheck passed. The focused Vitest run passed 27 tests. The backend regression run passed 56 tests and 576 assertions. The full frontend check reports 19 existing failures across nine files, matching an archived starting revision run. The global coverage checker still detects three pre-existing unmapped Help Management pages. The new referral scenario IDs, paths, route mappings and evidence were checked independently. MySQL concurrency and live migration/deployment checks remain outside this disposable SQLite/browser verification.

## Existing local application showcase — 19 November 2026

`ReferralOverviewSeeder` has been run on the user's existing local Laravel/MySQL app.
See the [backend seed instructions](../../../../isp-backend/docs/referral-demo-seeding.md).
The administration [sales overview](http://app.isp.test/platform-referrals) and
[seller profiles](http://app.isp.test/platform-referral-sellers) now contain:

- `sales-man` on app.isp.test: `DEMO-SALESMAN`, commission 15%, existing Sells man role.
- `vpc` on vp.isp.test: `DEMO-VP-MANAGER`, commission 10%, existing VP owner account.
- `vp-reseller` on vp.isp.test: `DEMO-VP-RESELLER`, fixed BDT 1,500 per tenant.

Each has five `[Referral Demo]` examples, including an approved demo/linked tenant
whose referral is still Pending. There are 6 Pending, 3 Payable, 3 Paid and 3
Rejected referrals. Initial overview totals: Pending BDT 14,250, Payable BDT 9,000,
Paid BDT 11,500. Demo payout references begin `DEMO-NO-TRANSFER`; no money moved.
Seller panels are at `/referrals` on their own hosts. Existing account credentials
are unchanged. The new local sales-man account uses the demo password documented
in the backend seed instructions. Repeating the seed preserves existing entries
and later decisions; its live ledger fingerprint was verified unchanged.

The actual Chrome administration page showed the seeded records and correct totals.
Seven new isolated seeder tests and the other referral tests passed (31 tests,
479 assertions). Backend formatting and application/seeder static analysis passed.
No frontend application code changed for this showcase. The earlier browser
acceptance evidence remains a record of its recorded revision; the additional
existing-staff enrollment behavior is covered by the new backend tests.
