# PS-001 — Authorization and always-available support

Status: reviewable
Repository: isp-backend; shadcn-client only for typed effective capability/settings output when necessary.
Depends on: product and authorization contracts reviewed.

## Goal

Establish the exact identity, capability, scope and subscription rules before exposing data endpoints. Read 00-product.md, 01-authorization.md and 02-data-and-api.md. No legacy ticket changes.

## Work

1. Add module permission constants/catalog and one effective capability resolver. Baseline own-support grants are tied to active User eligibility; optional scope/action permissions use existing role grants and teams. Expose effective named capabilities through existing settings/profile output without leaking tokens or changing its envelope.
2. Add dedicated requester middleware and platform authorization guard/policies. Resolve impersonation through the effective principal, not an original stored platform identity. Never let an impersonated tenant session retain the platform inbox. Prohibit Client principals.
3. Seed all proposed route names. Explicitly separate always-available tenant support permissions from platform-only administrative permissions in FeatureSeeder, subscription entitlement/permission assignment and UI permission catalogs. Ensure future company/reseller/user provisioning receives baseline access without requiring a paid support feature. Optional broad scopes remain off unless explicitly granted.
4. Integrate the narrow support-availability exception in subscription checks, including optional granted company/reseller actions. Preserve active-account, permission, tenant and reseller checks. Do not silently use a global prefix exemption that includes unrelated endpoints.
5. Document the limited aggregate platform-support inbox exception in canonical multi-tenancy.md; other cross-tenant APIs retain single-target constraints. Establish a guarded query entry point with audited authorization, not a global tenant disable. Actual thread queries arrive in PS-002.
6. Add module policies for own/exact-reseller/company scopes and per-record action abilities. Define named route registration before permission discovery if seeders discover routes. Avoid route aliases that diverge from API names.

## Acceptance

- PS-001-A: active tenant and reseller users, owners without Staff, and users with no operational role can obtain baseline own capabilities; Client/anonymous/locked accounts cannot.
- PS-001-B: plan without support, expired plan and no subscription all preserve own-support access; legacy plan rules are unchanged.
- PS-001-C: reseller scope does not reach parent/child/sibling; company scope requires non-reseller actor plus explicit permission; reply/manage requires visibility too.
- PS-001-D: ordinary company-1 user and non-platform Super Admin cannot access platform routes. Platform admin and explicitly authorized platform agent can use only their effective administrative capabilities.
- PS-001-E: tenant role editors/plans cannot grant platform admin permissions. Revoking an optional role permission affects the next API authorization and effective capability response. Existing settings consumers remain compatible.
- PS-001-F: impersonation drops platform powers; capability names correspond exactly to the proposed route contract. No bearer token is added to browser data.

## Verification and handoff

Pest coverage with tenant A/B, same-company company/reseller actors, company-1 ordinary user and true platform agent. Create platform fixture first so ordinary tenant tests do not accidentally run as company 1. Run backend test and changed-file checks; typecheck if frontend types change. Demonstrate that the dedicated middleware applies only to this module. Do not mark route registration itself as proof of record isolation.

## Implementation record

Changed files: isp-backend authorization catalog, resolver, ownership policy, inbox grant, requester and platform middleware, named routes, subscription exception, feature and permission seeders, `update:permission` list, settings and permission-catalog guards, and `docs/architecture/multi-tenancy.md` §§6 and 8.1. Tests: `tests/Feature/PlatformSupportAuthorizationTest.php`. No shadcn-client application code. No ticket, client-portal, or migration files.

Commands/results:

- `scripts/ai/backend-test tests/Feature/PlatformSupportAuthorizationTest.php tests/Feature/CheckSubscriptionMiddlewareTest.php tests/Feature/RolePermissionControllerTest.php` — 41 passed (281 assertions).
- `scripts/ai/lint` on the changed PHP files — Pint passed.
- PHPStan level 5 on the new authorization code, seeders, subscription service, permission controllers, bootstrap, and routes — no errors. `UserController.php` still has the same four pre-existing errors as `HEAD` (`syncRoles`, company model type on `filterRolePermissions` and `summary`, and `resolveUser`). Those lines were not introduced here.
- `scripts/ai/status` and `scripts/ai/diff` inspected. Unrelated working-tree files were not present.

Acceptance evidence: `tests/Feature/PlatformSupportAuthorizationTest.php`.

- PS-001-A: role-less owner with no Staff, reseller user, anonymous 401, Client token 403, inactive Staff `account_locked`.
- PS-001-B: no subscription, plan without support, and expired plan keep own-support writes. `tickets.access` still returns 402 when support is absent or expired. `invoices.create` and `duplicate.username` still return 402 after expiry. Unknown `platform-support.not-a-route` is not exempt.
- PS-001-C: parent, child, and sibling reseller threads are hidden. A reseller with `company.access` is denied that route and scope. Team reply and manage do nothing without visibility. Moving `reseller_id` drops the old thread.
- PS-001-D: ordinary company-1 user and a Super Admin outside company 1 receive 403 on admin routes. Company-1 Super Admin receives every admin capability. A company-1 agent with only `platform-support-admin.reply` is denied access and assign. Inbox open writes an activity row and leaves the tenant id in place. A tenant open throws.
- PS-001-E: tenant editors, a tenant Super Admin, and a platform Super Admin writing a tenant role cannot add `platform-support-admin.access`. Optional `company.access` can be added without a plan. Feature sync rejects both admin and optional names. Revoking `company.access` changes the next route and `get.user.settings`. The settings envelope stays `settings`, `profile`, `permissions`, `subscription`.
- PS-001-F: a real impersonation token loses admin routes and admin names, keeps baseline access, and the settings JSON does not contain the bearer token. All 30 catalog names are registered. `tickets.access` still uses `permissions` and not the new middleware.

Remaining blockers: summary, read, upload, and attachment routes still return 204 and no record. Core thread routes now return the PS-002 payloads, so 204 is no longer the gate for those actions. Summary counts are not implemented. `User.status = 0` without an inactive Staff row is still not a global lock. Assignment rejects that user; other routes do not. `permissions.add` still does not prove an arbitrary role belongs to the caller; platform-admin names are rejected unless the actor is a company-1 Super Admin and the role is company 1. Do not run `update:permission` or seeders against MySQL without approval. No package install, migration, or push was performed.
