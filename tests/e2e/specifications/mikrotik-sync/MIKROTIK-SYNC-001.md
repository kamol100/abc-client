# MIKROTIK-SYNC-001 — Mikrotik Sync

- Status: Both reproduced bugs fixed; 3 focused Playwright regressions pass. Broader acceptance scenarios remain drafts.
- Date: 2026-11-12.
- Workflow: investigate → specify → review → implement → verify.
- Scope routes: `/mikrotik-sync/import/[id]`, `/mikrotik-sync`

## Source evidence and investigation limits

Pages and nearest feature files were statically inventoried. The evidence file records literal fields, permission checks, API templates and matching backend route declarations. These are observed references, not proof of active UI reachability, effective middleware, valid payloads or approved behavior. Detailed controller/service/validator and business review remains required before implementing ambiguous cases. Do not invent CRUD for read-only screens.

- [Source trace](source-evidence.md)
- Existing unit candidates: `tests/unit/mikrotik-sync/mikrotik-sync-filter-schema.test.ts`

## Personas, fixtures, and review

Use dedicated test database/cache/storage/queue, tenant A and B registered hosts, full-feature actor, restricted/read-only actor, reseller/zone actor when applicable, and subscriber owner/non-owner for portal features. Public pages use anonymous contexts. Seed known included/excluded rows, stable identifiers and relation IDs; create test-owned mutation fixtures per worker with failure-safe cleanup.

Record exact required fields/defaults/validation boundaries and permissions from source trace, then verify them against Laravel requests/resources/services. Decide dependencies, duplicate handling, relation ownership, monetary units, date boundaries and failure recovery. Selectors/API templates are clues, not new endpoint definitions. Cross-tenant direct API enforcement needs backend tests as well.

For money/stock/subscription/permissions/identity changes, approve independently calculated expected effects before implementation. Use sandbox/fake router, provider, payment and notification adapters; never send real customer messages or mutate real devices. Coordinate backend/browser Asia/Dhaka time. Generated auth state is secret and stays out of commits/artifacts.

## Feature-specific acceptance scenarios

- FT033-01 [P1, pending review]: Resolve/import matched and unmatched router records with explicit company/reseller/package targets.
- FT033-02 [P1, pending review]: Bulk selection, duplicate usernames, resolve conflicts and retry do not duplicate clients or leak another network data.
- FT033-03 [P1, pending review]: Open every scoped route as intended actor, assert named feature-specific content and seeded identity/value, then reload; a visible body or HTTP200 alone is insufficient.
- FT033-04 [P1, pending review]: Exercise actual filters independently and combined: any, client, client_status_mikrotik, disabled, mikrotik_match, reseller_id, syncd_status. Assert included AND excluded fixture identities; clear restores baseline and pagination resets appropriately.
- FT033-05 [P1, pending review]: Pagination/page size and permitted column visibility work on known data; summary totals represent approved full filter scope, not just visible rows. Do not invent controls absent from this screen.
- FT033-06 [P1, pending review]: For each actually exposed create/edit/save form: valid payload persists after fresh read/reload; edit hydrates saved relations before changing them, cancel leaves saved state unchanged.
- FT033-07 [P1, pending review]: Required/invalid/boundary input stays recoverable with approved field errors; server rejection and delayed save produce no false success or duplicate persisted mutation. Use exact feature fields/constraints from reviewed schemas.
- FT033-08 [P0, pending review]: For each exposed capability, test allowed actor and separately denied actor, including direct URLs/API calls; absent menu/button does not prove backend protection. Public pages must remain available without inventing staff permissions.
- FT033-09 [P0, pending review]: Known foreign tenant/owner identifiers cannot expose or mutate protected data or relations; identity switch/back/reload cannot restore previous user data. Public-host data is isolated by approved host rules.
- FT033-10 [P1, pending review]: Controlled delay/failure/empty response has distinct truthful loading/error/no-data state; retry recovers and stale earlier responses cannot replace latest selection.
- FT033-11 [P1, pending review]: Rapid submission/retry and interrupted session do not duplicate side effects or record them under a subsequent user. For read-only features assert no mutations are offered rather than fabricate an action.
- FT033-12 [P2, pending review]: Representative mobile width, keyboard, English/Bangla and light/dark checks keep actual primary controls usable; inspect exported/printed artifacts where present instead of treating screenshot existence as correctness.

## Owner-requested bug reproductions (2026-11-25)

These tests use the real UI/server actions and Laravel controller/service/job path in a disposable SQLite fixture. The original red run is retained in run.json. Both fixes now pass the same correctness assertions; fixed-run.json records the passing run. These focused results do not establish full feature acceptance.

- FT033-13 [P1, approved for reproduction]: Given CP has visible-only-client on Router A and hidden-do-not-import on Router B, and search shows only the first row, when the operator selects that row and imports as own client, then exactly visible-only-client must be persisted. The hidden client must remain absent and MK's sentinel must be unchanged. Inspect the submitted all_import/import_id payload and actual queued UUIDs independently of the UI count.
- FT033-14 [P1, approved for reproduction]: Given MK has two packages with profile shared-gold, Router A Gold (BDT 3,000) inserted before Router B Gold (BDT 800), and router-b-client belongs to Router B, when its mismatch is resolved through Individual Sync, then its package must be Router B Gold and its package network must equal the client's network. Show the resulting package on /clients and independently inspect persisted IDs.

Executable tests: `tests/e2e/mikrotik-sync/bugs.spec.ts`. Run: `MKS_E2E_SLOW_MO=650 npm run test:e2e:mikrotik-sync -- --headed`. Registered hosts are CP/MK with ephemeral fixture ports and generated credentials; no existing local records or real routers are used. Videos and sanitized evidence accompany the actual run. The root runner includes this fixture automatically.

- FT033-15 [P1, approved regression]: Given remaining unimported CP rows, when the operator opens the bulk dialog on a 390px viewport, then Selected clients only must be the default. Choosing All unimported clients in this company explicitly submits all_import=true and no UUID list, imports eligible CP rows, preserves MK data, and keeps the dialog inside the viewport.

Fix behavior: profile lookup now constrains company, reseller, and network for individual/bulk resolution. Normal import always sends selected UUIDs and its count reflects those UUIDs. Filter changes clear selection. Whole-company import remains available through the explicit scope choice; it intentionally covers the company rather than the active filter. Scope labels exist in English and Bangla.

## AI implementation handoff / done criteria

Review exact feature fields, source-linked backend contracts and domain decisions first. Split multi-surface/financial cases into independent Given/When/Then tests and expand the coverage register before coding. Do not count generic draft cases as implemented coverage. Shared prerequisites: strict login assertion, validation-safe submit helper, persona sessions, isolated fixture cleanup and controlled integrations. Preserve existing uncommitted work.

Use semantic locators scoped to correct row/dialog and exact UUID/relation types. Next.js server-action outbound calls cannot be intercepted with browser page.route; use real isolated backend or a server-reachable stub. No fixed sleeps, swallowed errors, first-option guesses, unconditional skips, production calculation helpers as expected answers, or weakened assertions to accept defects.

Each case needs reviewed expected values, linked spec/test title, executed run evidence and final status. Blocked/skipped/failing cases remain uncovered. Document backend contract/security gaps separately. Run appropriate checks and record environment/commands/results/artifacts and .ai/report.md. No installs/push/deploy without required approval.

Current verification: 3 headed Playwright cases passed with 0 failed/0 skipped on 2026-11-25. [Passing evidence](evidence/fixed-run.json) includes selected UUID payloads and the corrected Router B package/network IDs; [historical failure evidence](evidence/run.json) is retained. Focused backend tests: 44 passed (204 assertions); frontend unit tests: 3 passed. Typecheck, Pint, and production-service PHPStan passed. Desktop before/after and mobile dialog screenshots were inspected; loading submission was exercised through the existing 15-second hold. No existing local records or routers were mutated.

Count-label update (2026-11-25): both scope options append their live counts. Selected count comes from explicit UUIDs; company count comes from the list API unimported_count, matching company-wide queue eligibility independently of active filters. [Latest count-label evidence](evidence/count-run.json): all 3 browser checks pass, including desktop 1 selected / 2 company and mobile counts. The API count is covered for tenant isolation, eligible reseller rows, imported/linked exclusions, and parity with queued rows.
