# RESELLER-001 — Reseller management and scoped operations

- Status: Partial Playwright coverage on CP/MK. Review remains pending, so these runs are not passing coverage. See [implementation status](IMPLEMENTATION.md) and [execution evidence](EXECUTION.json). Review-blocked scenarios are not implemented. Successful create, package reassignment, recharge settlement, purge, and import are not executed. Username exclusion fails because the reseller filter pipeline ignores `username`.
- Investigated: 2026-11-12 through static source inspection.
- Goal: Authorized staff manage the intended reseller account, packages, settings and wallet; switching identity and deleting/exporting data preserve scope and unrelated records.
- Scope: `/resellers`, `/resellers/create`, `/resellers/edit/[id]`, `/resellers/view/[id]`; linked permissions, settings, private images, wallet recharge and scope switching.
- Conditional scope: export-file import component and backend export/purge. Establish a reachable frontend import entry point before browser implementation.
- Follow-ups: complete permissions editor, reseller company-profile branding, subscriber recharge costing, platform tenant billing, full agent accounting and full reseller-client reports (cross-reference CLIENT-001/DASHBOARD-001).

## Evidence

Frontend repository-relative: `components/resellers/` list/filter/form/schema/type/row-actions/view, package/client tables, settings dialog, image fields, wallet recharge/form schema and import dialog; `app/(dashboard)/resellers/`; `hooks/use-start-impersonation.ts`; `tests/unit/resellers/` form/schema/settings/switch-scope and existing wallet recharge tests. Existing wallet tests concern related flows and must not be counted as coverage of this exact row action without checking their target.

Backend sibling: `../isp-backend/routes/api.php`; `app/Http/Controllers/V1/Admin/ResellerController.php`, `WalletsController.php`; `app/Http/Requests/{StoreResellerRequest,UpdateResellerRequest,ResellerWalletRechargeRequest,ImportResellerExportRequest}.php`; `app/Services/Reseller/ResellerTenantExportPurgeService.php`. Canonical tenant architecture and frontend workflow apply. No reseller-management e2e spec currently exists.

## Observed contracts

- API paths relative to `/api/v1`: list/create `/resellers` (`resellers.access`/`resellers.create`), detail/update/delete `/resellers/{reseller}` (`resellers.show`/`resellers.edit`/`resellers.delete`). Reseller identity in frontend is a string UUID; distinguish numeric relation IDs, wallet UUID and user UUID.
- Filters: name, username, phone, network, zone, active/inactive. Create action requires `resellers.create`. Row detail link accepts show OR edit, but backend detail route is named `resellers.show`; confirm effective permission aliases.
- Full-page accordion form includes identity, company/contact, network/package/zone, prefix/status, prepaid/postpaid, overdue/auto-recharge, termination hour/minute, serial start, agent/commission, personal/contact/date and images. Create requires name ≥2, username/password, phone ≥11 and network; agent selection requires nonnegative integer commission. Edit omits credential fields from normal form schema; backend update supports nonempty credential changes.
- Images `avatar`, `nid_front`, `nid_back` are removed from normal form payload and handled separately under `/resellers/{reseller}/images/{field}` with `resellers.image.upload/remove/show` permissions.
- Backend create uses a transaction to create login User, reseller, package assignments and Staff, and dispatches delayed ResellerConfigJob. Login readiness may depend on queued setup; do not assume response completion proves provisioning complete.
- Create validates company-scoped unique username and company email policy. General request validation is narrower than frontend form fields; update/relations need parity review.
- Package assignment clears existing reseller assignment and reassigns selected company packages by numeric ID, bypassing ResellerScope but keeping company filter. This mutates package ownership, not merely a harmless many-to-many selection. Existing assignments to another reseller need explicit business review.
- Detail has profile/packages tabs; clients tab requires `resellers.client` and queries `/resellers/client/{reseller}`. A second same-pattern GET route later uses `{package}` and `resellers.client.package`; effective route matching requires verification because parameter names do not distinguish the URL shape.
- Row permissions link requires `permissions.access` plus `resellers.edit`; destination `/permissions/{uuid}?type=reseller`.
- Settings requires `resellers.settings`; reads/writes `/company/settings` using explicit `reseller_uuid`. Current control is `auto_inactive_reseller_client_termination_date` with immediate save, pending lock and restored synced value on failure. This scoped administration must be authorized server-side; it is not tenant switching.
- Recharge UI accepts `reseller-wallet.recharge` OR `wallets.edit`, requires wallet and posts `/reseller-wallet-recharge` with walletUuid/balance/fund/note. Backend route name is `reseller-wallet.recharge`, outside primary permission middleware. Request validates positive balance and caller company/reseller-scoped fund; controller selects company-owned reseller wallet, computes commission and transactionally adds balance, synchronously dispatches agent commission and records recharge receipt.
- Recharge can fail if agent is invalid or Reseller Bill invoice type is unconfigured. Exact commission split and receipt/fund effects require underlying wallet-service review before approval of expectations.
- Switch scope requires `impersonate.start`, non-reseller resolved role scope, reseller UUID and user UUID. Hook posts impersonation API, refreshes identity/settings/permissions and coordinates cache/session updates. Verify complete enter/leave behavior against auth implementation during implementation, without storing tokens in test artifacts.
- Delete uses exportAndPurge with export default true, returning export paths when present. Purge covers linked data beyond one reseller row. Treat as destructive tenant-subtree operation in disposable test environment only.
- Export listing/import: `GET /resellers/export-files` and `POST /resellers/import`; permission names match. Import request restricts path shape to `reseller-exports/<filename>.sql`; path validation alone does not establish tenant ownership. Inspected listing enumerates local export directory. Broader service/authorization review required before exposing foreign files.

## Decisions required

1. Approve field validation/defaults: username/email uniqueness scope, phone format, password policy, package requiredness, serial/prefix rules, termination bounds, billing defaults and optional/null behavior.
2. Confirm package ownership: may staff select packages already assigned to another reseller? What happens to original reseller/client access? Prevent unintended package theft even inside same company.
3. Confirm hierarchy: company versus reseller users, direct children versus deeper descendants, allowed client report scope, creation parent, locked/inactive accounts and impersonation eligibility.
4. Confirm show/edit permission parity, image access and permissions editor rights; frontend form has no obvious local create/edit denial, so direct routes/API must still enforce policy.
5. Approve recharge authority (including wallets.edit alternative), allowed target wallet scope, commission calculation/count_commission, currency precision, receipt/fund effects, idempotency and concurrency. Scoped fund validation is not proof of scoped wallet authority.
6. Approve settings read/write authority for explicit reseller_uuid and effective inheritance; another reseller/company's settings must never be overwritten.
7. Confirm destructive deletion retention, affected child records/users/packages/financial data, export storage confidentiality, import conflict/id remapping and rollback. No purge is executed as part of this specification task.
8. Establish import UI reachability and effective routing for duplicated `/resellers/client/{...}` GET definitions; report gaps instead of inventing endpoints or adding an import button inside tests.
9. Decide inactive reseller effects on login and existing sessions, whether password updates belong in this feature, and delayed config job completion criteria.

Mark dependent scenarios review-blocked until answers are recorded. Observed behavior does not authorize weak security or incorrect accounting assertions.

## Environment and fixtures

Dedicated disposable backend database/queue/cache/storage with two registered companies/domains. Personas: full company admin, read-only viewer, editor-only, package manager, settings-only, recharge-only, impersonator, no-permission staff, parent reseller, child reseller, unrelated reseller, tenant-B user and subscriber.

Seed known networks/zones; unassigned packages and another reseller's package; reseller with/without wallet, linked user, active/inactive clients and packages, agents with commission configurations, allowed/foreign funds, Reseller Bill invoice type present/missing variants. Record reseller/user/wallet UUIDs separately from relation IDs.

Create every mutation's own reseller/package/fund/agent fixtures. Queue processing must complete deterministically for login provisioning. Use synthetic credentials and images; runtime-generated host-specific storage states must not be committed. Fake network/SMS/Telegram/payment integrations. Calendar dates use consistent browser/backend Asia/Dhaka assumptions.

For recharge propose starting wallet100, input200 and a separately approved commission rule; record expected wallet, agent, receipt, fund and transaction deltas explicitly before implementing. Do not compute expected split through production wallet helpers.

Purge/import uses a fully disposable dataset with sibling-reseller and foreign-company sentinel records and separate export directory. Do not use broad purge as ordinary teardown. Test isolation must include wallets/package ownership/export files, not just browser cookies.

## Scenarios

P0 = access/data or money integrity; P1 = main workflow; P2 = extended regression. Each ID is a separate tracked case, currently pending.

### List and discovery

- RS-L01 [P1]: Permitted user sees expected reseller identities, user/contact/status, client/package counts and wallet values where displayed; totals/pagination match fixtures.
- RS-L02 [P1]: Filter name/username/phone/network/zone/status independently and combined; assert included/excluded identities, then reset restores baseline.
- RS-L03 [P1]: Pagination and page-size changes retain scope; filtering from later page resets to valid results without duplicates/stale empty page.
- RS-L04 [P1]: Empty/no-match and request failure remain distinguishable and recoverable; optional missing user/wallet/zone does not crash table actions.

### Create/edit and provisioning

- RS-F01 [P0]: Create with valid identity/network and approved packages; list/reopened edit/detail preserve company, billing, contacts and selected package relationships under returned UUID.
- RS-F02 [P1]: Missing/short name, missing create credentials, short phone and missing network show approved validation; no reseller/login/staff side effects occur on rejected create.
- RS-F03 [P1]: Duplicate username within company is rejected preserving draft. Company email policy failures display correctly. Cross-company duplicate policy is tested only after approval.
- RS-F04 [P0, review-blocked]: Complete queued provisioning, then log in with newly created reseller in a separate context; correct reseller role/profile/permissions/wallet readiness appears without exposing parent-company data.
- RS-F05 [P1]: Open edit directly using UUID; saved fields hydrate before changes. Change contact/date/billing fields; reload persists choices, zero values and unrelated fields without resetting to create defaults.
- RS-F06 [P1]: Cancel create/edit produces no new account or persisted changes; server rejection preserves recoverable form and no false success.
- RS-F07 [P1]: Agent selection requires commission; negative/fractional commission rejected by approved policy; unset agent/null commission and count_commission choices persist correctly after reload.
- RS-F08 [P1, review-blocked]: Billing prepaid/postpaid, auto-recharge, overdue, termination time, serial start and prefix persist within approved boundaries; invalid inputs are rejected server-side without partial account changes.
- RS-F09 [P0]: Rapid duplicate submit creates one intended reseller/login/staff set; injected provisioning failure follows approved rollback and leaves no orphan usable account.

### Packages, detail and clients

- RS-P01 [P1]: Detail opens correct UUID from list, shows profile/status and package assignments; back/edit destinations retain correct reseller identity.
- RS-P02 [P0, review-blocked]: Assign/remove approved company packages, reload and verify ownership/client visibility changes exactly as approved. No foreign package can be assigned by forged ID.
- RS-P03 [P0, review-blocked]: Selecting another reseller's assigned package is rejected or transferred only under explicit approved authority, with original reseller/client records reconciled; never silently accept unexpected reassignment.
- RS-P04 [P0]: Clients tab requires resellers.client and shows only selected reseller's records/counts across pages. Switching reseller detail must not reuse prior client rows; verify duplicate-route resolution first.
- RS-P05 [P1]: No-package/no-client detail states remain usable; failed client-tab fetch does not hide successfully loaded profile/package data.
- RS-P06 [P0, review-blocked]: Permission-editor link requires approved combined capabilities and targets correct reseller; updates cannot grant permissions beyond caller's delegated scope. Full editor matrix is a follow-up.

### Scoped settings and private images

- RS-S01 [P1]: Open settings loads selected reseller termination setting; toggle saves immediately and reopen/reload confirms persistence without changing sibling/company default settings.
- RS-S02 [P1]: Slow save blocks repeated toggles; failure restores last synced value and no success; rapid reseller dialog switching never saves to stale UUID.
- RS-S03 [P0]: Without settings authority, action/API read/write is denied. Forged foreign reseller_uuid cannot expose or overwrite another company's settings.
- RS-S04 [P1, review-blocked]: Upload/replace/remove avatar and each NID image on saved reseller; reload confirms only intended field changes. Standard form payload excludes private image fields.
- RS-S05 [P0]: Missing image permissions/foreign UUID prevents private image access/mutation; invalid or oversized image content rejects without replacing original. Read actual upload validator limits before specifying boundaries.

### Wallet collection and commission

- RS-W01 [P1]: Recharge action appears only with approved capability and wallet; dialog shows selected reseller/current balance; cancel does not change wallet/agent/fund/receipt data.
- RS-W02 [P1]: Nonpositive/invalid amount or missing fund blocks submit; API validation failure preserves input and original balance.
- RS-W03 [P0, review-blocked]: Valid recharge produces exact approved wallet/commission/fund/receipt deltas once; reopening reflects persisted balance. Include commission enabled/disabled and no-agent variants as independent cases.
- RS-W04 [P0, review-blocked]: Missing agent or required invoice type rejects with approved atomic rollback across wallet/agent/fund/receipt; no partial success despite error.
- RS-W05 [P0]: Foreign/invalid fund or client wallet masquerading as reseller wallet is denied with no balances changed. Validate target UUID belongs to allowed reseller scope, not just same company.
- RS-W06 [P0, review-blocked]: Duplicate click/retry/concurrent recharge follows approved idempotency/transaction policy; independently verify payment/receipt identities and no duplicated credit.

### Impersonation and tenancy

- RS-A01 [P0]: Anonymous and subscriber sessions cannot access staff reseller list/create/edit/mutations.
- RS-A02 [P0]: Access/create/show/edit/delete gates and direct API permissions match approved policy independently; editor-only view-link behavior cannot leak detail if show is denied.
- RS-A03 [P0]: Tenant A cannot list/search/view/edit/delete or access images/packages/clients of tenant B by known UUID or forged relation IDs.
- RS-A04 [P0, review-blocked]: Parent reseller can operate only on approved direct descendants; unrelated reseller/deeper descendant cannot be used to expand scope through management/report/recharge/settings APIs.
- RS-A05 [P0]: With impersonate.start and eligible reseller/user UUID, switch enters correct identity and permission scope; leave restores original identity. Back/reload and deferred data never show stale parent/sibling records.
- RS-A06 [P0]: No impersonation permission, missing linked user, or reseller current scope hides switch as designed; direct forbidden target is denied. Repeated click while switching cannot create stacked unintended sessions.
- RS-A07 [P1, review-blocked]: Inactive reseller login/existing session/actions follow approved policy; reactivation restores only intended permissions.

### Export, purge, import and resilience

- RS-D01 [P1]: Cancel delete preserves reseller and every linked fixture; failed request reports truthfully without claiming complete purge.
- RS-D02 [P0, review-blocked]: Confirm purge on disposable reseller; approved linked records and account access are removed, export created per policy, sibling/foreign sentinel data survives unchanged.
- RS-D03 [P0, review-blocked]: Export listing/import require their exact capabilities and authorized tenant ownership; known foreign filename/path traversal/invalid SQL selection cannot import or reveal data. Test backend isolation independently.
- RS-D04 [P1, review-blocked]: If reachable import UI is confirmed, approved exported fixture restores intended records/links in disposable environment; empty selection/cancel do nothing. Invalid/missing/conflicting export follows approved rollback/error policy with no partial import.
- RS-R01 [P1]: Delayed/failed list/detail/dropdowns/settings and session expiry have recoverable loading/error/auth states, no false success or stale cross-identity values.
- RS-R02 [P2]: Representative mobile, keyboard, English/Bangla and light/dark coverage keeps filter/form tabs, settings, actions and recharge controls reachable with clear labels.

## Handoff and completion

Review decisions before implementing financial/identity/destructive cases. Start list/create-edit/detail with isolated fixtures, then package/settings/images, approved recharge/impersonation, and separately disposable export/purge/import. Reuse established e2e fixtures; repair shared auth/submit prerequisites separately and preserve existing uncommitted work.

Use semantic locators/scoped rows and stable UUID identities. No arbitrary sleeps for config jobs, swallowed auth errors, first-option shortcuts, production commission helpers for expected answers, unconditional skips or weakened security assertions. Next.js server-action API calls require isolated real backend or server-reachable stub; browser page.route cannot intercept outbound server fetches.

Every scenario links to executable spec or reviewed blocker/deferral. Verify persistence, exact financial effects, permission boundaries, account readiness and unchanged unrelated records through fresh reads. Run relevant specs/checks and record environment/commands/pass-fail-skip counts/traces; keep credentials/private images/exports out of artifacts. Update .ai/report.md; installs/push/deploy require approval.

Current verification: static documentation only; no browser/unit/type/backend tests executed, no application/config/data changed. Effective backend security and tenant isolation are not established by this inspection.
