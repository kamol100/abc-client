# SETTINGS-DASHBOARD-001 — Settings Dashboard

- Status: Source-inventoried draft; business and detailed backend review pending; no tests implemented.
- Date: 2026-11-12.
- Workflow: investigate → specify → review → implement → verify.
- Scope routes: `/settings/dashboard`

## Source evidence and investigation limits

Pages and nearest feature files were statically inventoried. The evidence file records literal fields, permission checks, API templates and matching backend route declarations. These are observed references, not proof of active UI reachability, effective middleware, valid payloads or approved behavior. Detailed controller/service/validator and business review remains required before implementing ambiguous cases. Do not invent CRUD for read-only screens.

- [Source trace](source-evidence.md)
- Existing unit candidates: `tests/unit/settings/payment-deadline.test.ts`, `tests/unit/settings/expense-id-prefix.test.ts`, `tests/unit/settings/client-auto-inactive-time.test.ts`, `tests/unit/settings/invoice-print-settings.test.tsx`, `tests/unit/resellers/reseller-settings.test.tsx`, `tests/unit/theme/theme-settings.test.ts`, `tests/unit/notifications/notification-settings.test.tsx`

## Personas, fixtures, and review

Use dedicated test database/cache/storage/queue, tenant A and B registered hosts, full-feature actor, restricted/read-only actor, reseller/zone actor when applicable, and subscriber owner/non-owner for portal features. Public pages use anonymous contexts. Seed known included/excluded rows, stable identifiers and relation IDs; create test-owned mutation fixtures per worker with failure-safe cleanup.

Record exact required fields/defaults/validation boundaries and permissions from source trace, then verify them against Laravel requests/resources/services. Decide dependencies, duplicate handling, relation ownership, monetary units, date boundaries and failure recovery. Selectors/API templates are clues, not new endpoint definitions. Cross-tenant direct API enforcement needs backend tests as well.

For money/stock/subscription/permissions/identity changes, approve independently calculated expected effects before implementation. Use sandbox/fake router, provider, payment and notification adapters; never send real customer messages or mutate real devices. Coordinate backend/browser Asia/Dhaka time. Generated auth state is secret and stays out of commits/artifacts.

## Feature-specific acceptance scenarios

- FT077-01 [P0, pending review]: Save dashboard settings through the actual exposed controls; reload and fresh session confirm intended company/user/reseller scope.
- FT077-02 [P1, pending review]: Invalid/unsupported setting values and unauthorized writes are rejected without resetting unrelated settings; failed autosave restores approved last-saved state.
- FT077-03 [P1, pending review]: Open every scoped route as intended actor, assert named feature-specific content and seeded identity/value, then reload; a visible body or HTTP200 alone is insufficient.
- FT077-04 [P1, pending review]: Pagination/page size and permitted column visibility work on known data; summary totals represent approved full filter scope, not just visible rows. Do not invent controls absent from this screen.
- FT077-05 [P1, pending review]: For each actually exposed create/edit/save form: valid payload persists after fresh read/reload; edit hydrates saved relations before changing them, cancel leaves saved state unchanged.
- FT077-06 [P1, pending review]: Required/invalid/boundary input stays recoverable with approved field errors; server rejection and delayed save produce no false success or duplicate persisted mutation. Use exact feature fields/constraints from reviewed schemas.
- FT077-07 [P0, pending review]: For each exposed capability, test allowed actor and separately denied actor, including direct URLs/API calls; absent menu/button does not prove backend protection. Public pages must remain available without inventing staff permissions.
- FT077-08 [P0, pending review]: Known foreign tenant/owner identifiers cannot expose or mutate protected data or relations; identity switch/back/reload cannot restore previous user data. Public-host data is isolated by approved host rules.
- FT077-09 [P1, pending review]: Controlled delay/failure/empty response has distinct truthful loading/error/no-data state; retry recovers and stale earlier responses cannot replace latest selection.
- FT077-10 [P1, pending review]: Rapid submission/retry and interrupted session do not duplicate side effects or record them under a subsequent user. For read-only features assert no mutations are offered rather than fabricate an action.
- FT077-11 [P2, pending review]: Representative mobile width, keyboard, English/Bangla and light/dark checks keep actual primary controls usable; inspect exported/printed artifacts where present instead of treating screenshot existence as correctness.

## AI implementation handoff / done criteria

Review exact feature fields, source-linked backend contracts and domain decisions first. Split multi-surface/financial cases into independent Given/When/Then tests and expand the coverage register before coding. Do not count generic draft cases as implemented coverage. Shared prerequisites: strict login assertion, validation-safe submit helper, persona sessions, isolated fixture cleanup and controlled integrations. Preserve existing uncommitted work.

Use semantic locators scoped to correct row/dialog and exact UUID/relation types. Next.js server-action outbound calls cannot be intercepted with browser page.route; use real isolated backend or a server-reachable stub. No fixed sleeps, swallowed errors, first-option guesses, unconditional skips, production calculation helpers as expected answers, or weakened assertions to accept defects.

Each case needs reviewed expected values, linked spec/test title, executed run evidence and final status. Blocked/skipped/failing cases remain uncovered. Document backend contract/security gaps separately. Run appropriate checks and record environment/commands/results/artifacts and .ai/report.md. No installs/push/deploy without required approval.

Current verification: source inventory and documentation checks only; no application/test/runtime changes or test runs.
