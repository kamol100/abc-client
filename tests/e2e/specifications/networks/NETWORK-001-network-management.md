# NETWORK-001 — Network configuration and connection status

- Status: Draft for review; all scenarios unimplemented.
- Investigated: 2026-11-12 through static source inspection.
- Goal: Authorized staff manage the intended router configuration, distinguish configured activity from connectivity, and preserve tenant/dependency boundaries without unintended router operations or credential disclosure.
- Scope: `/networks`, create/edit dialogs, row connection/status display, filters/pagination/actions, network dropdown and package integration at representative client/reseller entry points.
- Follow-ups: full MikroTik package/client sync, arbitrary command execution, NOC/monitoring, OLT/device management and complete client/reseller suites.

## Source evidence

Frontend repository-relative: `app/(dashboard)/networks/page.tsx` loads `components/network/network-table.tsx` (singular folder); network form/schema/type/columns/actions/filter/connection-status/status components in that folder. Existing `tests/unit/mikrotik-sync/mikrotik-sync-filter-schema.test.ts` is adjacent sync coverage, not network CRUD coverage. No dedicated network unit/e2e spec found in inspected tests.

Backend sibling: `../isp-backend/routes/api.php`; `app/Http/Controllers/V1/Admin/NetworksController.php`; `app/Http/Requests/NetworkRequest.php`; `app/Http/Resources/NetworkResource.php`; `app/Models/Networks.php`; `app/Jobs/MikrotikPackageSyncJob.php`. Frontend architecture and canonical tenant rules apply; Networks uses company tenant scope without the usual reseller scope trait.

## Observed contracts

- API paths relative to `/api/v1`: `GET /networks` (`networks.access`), `POST /networks` (`networks.create`), `GET /networks/{networks}` (`networks.show`), `PUT /networks/{networks}` (`networks.edit`), `DELETE /networks/{networks}` (`networks.delete`). Model route binding uses UUID and resource returns UUID under `id`; frontend row/form/connection props declare numeric IDs.
- Form fields: name, IP/address, MikroTik username, optional password, web port, active/inactive status, notes. Form defaults active. Frontend validation requires name≥2, address length≥5, username≥2, optional nonempty password≥5; port merely coerces number; status 0–1.
- Backend NetworkRequest only requires name/address and validates optional status0/1. It does not establish IP/hostname syntax, port range, username/password policy or field length parity.
- Schema includes automation flags `auto_client_mikrotik_status`, `auto_sync_status`, `graph_status`, default1; these are absent from visible field config. Existing nondefault flags must not silently reset during edit.
- Backend create writes `graph` from `graph_status`, but model fillable/resource/update use `graph_status`. Inspect persistence before accepting automation defaults as correct.
- List controller orders newest first and paginates, without applying name/IP/status query filters in inspected method. UI offers those filters; expected filtering should expose this gap, not accept unchanged results.
- Create button requires networks.create; edit/delete row controls require networks.edit/delete separately. Edit supplies only ID and hydrates detail; API show permission may be independently needed. There is no standalone network detail page in inspected route.
- Connection cell runs viewport-enabled `GET /network-status/{UUID}` with ten-second stale time; connected means API `data.message === connected`. Other results/errors currently appear disconnected. API route name is literally `network.` and sits outside primary route-permission group; effective authorization requires audit.
- Router connectivity comes from getMikrotikClient; operational active/inactive status is a separate badge. Inactive network behavior may throw NetworkInactiveException through router helper, so review API/UI semantics before testing.
- Create dispatches MikrotikPackageSyncJob and sends Telegram notification. Saving a record is not proof of successful router sync. Fake transport/provider and deterministic queue handling are required.
- Dropdown `GET /dropdown-networks` uses numeric IDs/names; package options `GET /dropdown-network-packages/{network_id?}` use numeric network ID. Do not substitute UUID into relation-ID filters or numeric IDs into bound network routes.
- Delete rejects networks with related clients; otherwise deletes network. Packages/other dependencies are not explicitly checked in inspected controller and require policy review.
- Resource includes MikroTik username/password; form renders password as text. Model activity logging logs all dirty attributes except numeric ID/company/reseller IDs, without an explicit password exclusion. Credential exposure/redaction needs review using synthetic test values only.

## Decisions and gaps for review

1. Resolve UUID/numeric type mismatch across list/actions/edit/connection, without masking invalid identifiers in tests.
2. Implement/approve name/IP/status filtering and matching rules; current list method does not apply filters. Confirm whether address supports IPv4/IPv6/hostname/host:port and what web_port means.
3. Approve create/edit password behavior: blank means retain or clear? Should credentials be returned to read-only viewers, masked in forms, or omitted/redacted in activity logs? Keep synthetic secrets out of traces/screenshots/logs when possible.
4. Approve automation defaults and edit preservation; investigate create graph versus graph_status mapping before writing expected persistence.
5. Define active/inactive versus connected/disconnected/unreachable/error meanings, connection endpoint permission name/authorization, retry/freshness and inactive-network router behavior.
6. Define tenant/reseller/zone visibility. Networks are company-scoped and can contain shared router credentials; do not invent reseller-owned isolation when backend intentionally shares networks, but explicitly approve who may read secrets or mutate shared configuration.
7. Approve dependencies for delete: clients, packages, reseller assignments, sync jobs and monitoring; restrict destructive changes and preserve other records. Decide concurrent client assignment versus deletion behavior.
8. Define create success when package sync fails, retry/idempotency of job, edit connectivity refresh, and rollback if notification/job dispatch fails after record creation.
9. Confirm show permission requirement for editor-only persona and direct API restrictions; hidden UI is not backend authorization.

Dependent cases remain review-blocked until decisions are recorded. Known gaps should fail the intended regression or be tracked as explicit blockers, never redefined as correct behavior.

## Fixtures and environment

Dedicated backend database/cache/queue and two registered tenant domains. Personas: network admin, read-only viewer, creator, editor without delete, editor without show, delete-only where supported, no-network-access staff, reseller, zone-restricted staff and subscriber.

Seed connected/disconnected/timeout/auth-failure/inactive networks through a backend-controlled fake router adapter; local and foreign tenant networks with distinct names/addresses/UUIDs, nondefault automation flags, optional blank fields, notes and synthetic credentials. Seed an unused network, client-bound network, package-bound network and known dropdown relation IDs; enough networks for pagination and viewport checks.

Create/update/delete operate on owned records. Drain/inspect test jobs deterministically, fake Telegram and avoid all production routers, real usernames/passwords or arbitrary address probes. A dedicated test stub hostname/address must terminate in the test adapter; browser page.route cannot intercept Laravel router transport or Next.js server-action fetches. Do not run network create until fake package-sync adapter is active.

Prepare through supported APIs or separately approved backend fixtures, not invented endpoints. Baseline linked clients/packages/router fake state and record permitted side effects. Auth state is runtime-generated and uncommitted; redact synthetic secrets from published artifacts too. Consistent browser/backend Asia/Dhaka dates where relevant.

## Scenarios

P0 = credential/access/data integrity; P1 = primary workflow; P2 = extended regression. All cases pending.

### List/filter/discovery

- NW-L01 [P1]: Authorized user sees expected names, addresses, operational status and row identities; pagination total matches seeded company records.
- NW-L02 [P1, review-blocked]: Filter name/address/active/inactive independently and combined; include/exclude identities match approved rules. Reset restores baseline. Current missing backend filtering is a tracked defect.
- NW-L03 [P1]: Pagination/page-size changes show expected records without duplicates; applying restrictive filter from later page returns valid matching page after filter support exists.
- NW-L04 [P1]: Empty/no-match state is usable; failed list query is distinct from successful empty data and recovery restores fixtures.
- NW-L05 [P2]: Column toggles operate only on allowed columns; fresh context prevents persisted visibility from hiding required actions during other cases.

### Create/edit

- NW-F01 [P1]: Create network using synthetic valid config and active default; row and reopened edit preserve correct UUID/name/address/user/port/notes/status after reload. Fake sync receives only intended network identity.
- NW-F02 [P1]: Missing/short name/address/username and short nonempty password produce approved validation; dialog remains open and no network/job is created.
- NW-F03 [P1, review-blocked]: Valid approved address formats and port boundaries save; invalid syntax/nonfinite/fractional/out-of-range port and invalid status are rejected in UI/API without unintended connection attempt.
- NW-F04 [P1]: Create cancel has no saved record/job/router effect. Server validation failure preserves recoverable input and does not show save success.
- NW-F05 [P1]: Open edit with ID-only row data; hydration matches saved config before changes. Edit name/notes/port/status; reload retains changes and stable identity without affecting another network.
- NW-F06 [P0, review-blocked]: Edit without changing password retains approved credential state; intentional change affects only target synthetic router credentials; approved clear behavior is tested separately.
- NW-F07 [P0, review-blocked]: Edit unrelated name/note with automation flags0; persisted flags remain0. Create stores approved graph_status and all defaults under correct backend column rather than graph typo.
- NW-F08 [P1]: Cancel edit and rejected save leave original persisted config unchanged. Rapid submit produces exactly one intended record/change and no duplicate sync effects.
- NW-F09 [P1, review-blocked]: Package sync failure after create follows approved saved/pending/error policy; retry creates no duplicate network/packages. Notification/job dispatch failure does not cause misleading duplicate retry behavior.

### Connection status

- NW-C01 [P1]: Visible connected/disconnected fake rows show matching labels independently of active/inactive status; response keyed to each UUID never appears on adjacent row.
- NW-C02 [P1]: Delay one status response; that cell shows loading while list and other row actions remain usable; response eventually resolves without layout-blocking failure.
- NW-C03 [P1]: Offscreen rows do not initiate viewport-gated probe until entering view; scrolling into view fetches correct UUID. Use explicit scroll/assertions and controlled backend call counts, not arbitrary sleeps.
- NW-C04 [P1, review-blocked]: Timeout/auth/network/invalid response maps to approved error/disconnected behavior; retry recovers. Do not accept failed query as proof of a reachable disconnected router unless that UX is approved.
- NW-C05 [P1, review-blocked]: Inactive network follows approved no-probe/denied-status behavior; disabled network must not trigger forbidden router work merely by opening list.
- NW-C06 [P1, review-blocked]: Change address/credentials/status, reopen/reload and refetch under approved freshness policy; old cached connection result does not remain authoritative for changed config.

### Dependency and integration

- NW-D01 [P1]: Cancel delete preserves unused network; confirm eligible isolated delete removes only target and refreshes list/dropdowns after reload.
- NW-D02 [P0]: Client-bound network delete is rejected with truthful error; network/client/package and fake router state remain intact. Do not remove client just to force success.
- NW-D03 [P0, review-blocked]: Package/reseller/job-bound network deletion follows approved dependency policy; no orphaned references or unrelated router resources are removed.
- NW-D04 [P1]: Permitted client/reseller form network dropdown offers allowed seeded networks using numeric relation IDs; bound CRUD routes continue using UUIDs. Network-package filtering returns expected package identities under approved selection behavior.
- NW-D05 [P0, review-blocked]: Concurrent dependent-client creation and deletion cannot leave a client referencing missing network; verify database outcome with fresh backend reads under approved conflict policy.

### Access, credentials and tenancy

- NW-A01 [P0]: Anonymous access requires staff login; subscriber cannot access staff network CRUD/probe APIs.
- NW-A02 [P0]: Independently remove create/edit/delete permissions; relevant controls are absent and direct endpoints deny forbidden mutation; list/read follows networks.access/show policy.
- NW-A03 [P0, review-blocked]: Editor without show follows approved hydration behavior, without unintended broad read permission or missing credentials falsely causing overwritten values.
- NW-A04 [P0]: Tenant A cannot list/search/hydrate/edit/delete/probe tenant B network by known UUID or obtain foreign network/package options; no foreign credential appears in response/UI.
- NW-A05 [P0, review-blocked]: Reseller/zone-restricted user sees only approved shared network information/capabilities; direct probe and credential read cannot exceed approved authority. Backend tests independently verify endpoint enforcement.
- NW-A06 [P0, review-blocked]: Read-only list/detail/activity access follows approved credential-redaction policy; secrets do not leak to unauthorized fields/logs/error text. Use synthetic secret marker and redact test artifacts.
- NW-A07 [P0]: Logout/identity switch and back/reload never restore previous tenant's network rows, hydrated credentials or probe data.
- NW-R01 [P1]: Expired session/subscription denial during save/delete/probe shows reviewed recovery with no false success or operation attributed to next signed-in user.
- NW-R02 [P2]: Representative mobile width, keyboard, English/Bangla, light/dark checks keep filters/create/edit/delete and status labels reachable; connected state is understandable beyond icon/color alone.

## Implementation and completion

Review contracts first. Start list/create/edit using backend fake router, then probes/dependencies and approved access/credential cases. Fix identified API/type/filter/default defects with regressions rather than altering tests to tolerate them. Shared login/validation-submit helpers remain a separate prerequisite; preserve existing worktree edits.

Use semantic labels/scoped row/dialog locators, unique run/worker/test fixtures, runtime host/persona sessions and failure-safe teardown. No fixed waits, swallowed errors, first-row/first-button shortcuts, unconditional skips, screenshots as sole state proof, or real-router access.

Every scenario must link to an executable spec or reviewed blocker/deferral. Verify saved config through reload/fresh reads, job/router fake side effects through deterministic evidence, and unchanged dependent records. Record commands/environment/pass-fail-skip counts and sanitized traces. Run required checks when implementing and update .ai/report.md. Installs/push/deploy require approval.

Current verification: documentation-only task; no application/config/data changes and no browser/unit/type/backend tests executed. Static inspection does not establish effective backend authorization or tenant isolation.
