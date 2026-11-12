# CROSS-FEATURE-JOURNEYS-001 — Cross Feature Journeys

- Status: Source-inventoried draft; business and detailed backend review pending; no tests implemented.
- Date: 2026-11-12.
- Workflow: investigate → specify → review → implement → verify.
- Scope routes: Shared/embedded behavior; no standalone page.

## Source evidence and investigation limits

Pages and nearest feature files were statically inventoried. The evidence file records literal fields, permission checks, API templates and matching backend route declarations. These are observed references, not proof of active UI reachability, effective middleware, valid payloads or approved behavior. Detailed controller/service/validator and business review remains required before implementing ambiguous cases. Do not invent CRUD for read-only screens.

- [Source trace](source-evidence.md)
- Existing unit candidates: None found by feature/path matching; inspect shared coverage.

## Personas, fixtures, and review

Use dedicated test database/cache/storage/queue, tenant A and B registered hosts, full-feature actor, restricted/read-only actor, reseller/zone actor when applicable, and subscriber owner/non-owner for portal features. Public pages use anonymous contexts. Seed known included/excluded rows, stable identifiers and relation IDs; create test-owned mutation fixtures per worker with failure-safe cleanup.

Record exact required fields/defaults/validation boundaries and permissions from source trace, then verify them against Laravel requests/resources/services. Decide dependencies, duplicate handling, relation ownership, monetary units, date boundaries and failure recovery. Selectors/API templates are clues, not new endpoint definitions. Cross-tenant direct API enforcement needs backend tests as well.

For money/stock/subscription/permissions/identity changes, approve independently calculated expected effects before implementation. Use sandbox/fake router, provider, payment and notification adapters; never send real customer messages or mutate real devices. Coordinate backend/browser Asia/Dhaka time. Generated auth state is secret and stays out of commits/artifacts.

## Feature-specific acceptance scenarios

- FT017-01 [P1, pending review]: Client→invoice→partial/full collection reconciles invoice/client/fund/dashboard and receipt once.
- FT017-02 [P0, pending review]: Stock purchase→expense approval and stock issue→client invoice reconcile stock/financial records atomically under approved rules.
- FT017-03 [P0, pending review]: Salary→expense→fund and reseller recharge→agent commission preserve independent approved amounts and foreign records.
- FT017-04 [P0, pending review]: Restricted persona and host/impersonation switch cannot regain prior identity permissions through cached pages.
- FT017-05 [P1, pending review]: Open every scoped route as intended actor, assert named feature-specific content and seeded identity/value, then reload; a visible body or HTTP200 alone is insufficient.
- FT017-06 [P0, pending review]: For each exposed capability, test allowed actor and separately denied actor, including direct URLs/API calls; absent menu/button does not prove backend protection. Public pages must remain available without inventing staff permissions.
- FT017-07 [P0, pending review]: Known foreign tenant/owner identifiers cannot expose or mutate protected data or relations; identity switch/back/reload cannot restore previous user data. Public-host data is isolated by approved host rules.
- FT017-08 [P1, pending review]: Controlled delay/failure/empty response has distinct truthful loading/error/no-data state; retry recovers and stale earlier responses cannot replace latest selection.
- FT017-09 [P1, pending review]: Rapid submission/retry and interrupted session do not duplicate side effects or record them under a subsequent user. For read-only features assert no mutations are offered rather than fabricate an action.
- FT017-10 [P2, pending review]: Representative mobile width, keyboard, English/Bangla and light/dark checks keep actual primary controls usable; inspect exported/printed artifacts where present instead of treating screenshot existence as correctness.

## AI implementation handoff / done criteria

Review exact feature fields, source-linked backend contracts and domain decisions first. Split multi-surface/financial cases into independent Given/When/Then tests and expand the coverage register before coding. Do not count generic draft cases as implemented coverage. Shared prerequisites: strict login assertion, validation-safe submit helper, persona sessions, isolated fixture cleanup and controlled integrations. Preserve existing uncommitted work.

Use semantic locators scoped to correct row/dialog and exact UUID/relation types. Next.js server-action outbound calls cannot be intercepted with browser page.route; use real isolated backend or a server-reachable stub. No fixed sleeps, swallowed errors, first-option guesses, unconditional skips, production calculation helpers as expected answers, or weakened assertions to accept defects.

Each case needs reviewed expected values, linked spec/test title, executed run evidence and final status. Blocked/skipped/failing cases remain uncovered. Document backend contract/security gaps separately. Run appropriate checks and record environment/commands/results/artifacts and .ai/report.md. No installs/push/deploy without required approval.

Current verification: source inventory and documentation checks only; no application/test/runtime changes or test runs.
