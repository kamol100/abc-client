# PS-001 — Authorization and always-available support

Status: not started
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

Changed files: pending. Commands/results: pending. Acceptance evidence: pending. Remaining blockers: pending.
