# CLIENT-001 browser suite

Read `tests/e2e/AGENTS.md` and the client specification first.

## Standard commands

`npm run test:e2e` runs all root-level `playwright*.config.ts` suites, including legacy, clients (both projects), and support tickets. Each suite retains its own configuration and runs even if another fails; the overall command fails if any suite fails. `npm run test:e2e -- --list` lists every suite. New feature suites must use a root-level `playwright.<feature>.config.ts` file with a distinct test directory and report directory. `npm run test:e2e:ui` opens each suite UI sequentially (close one to open the next).

`npm run test:e2e:clients` selects only the nonmutating client project. The full command includes the four isolated mutation tests: without the prerequisites below, those tests fail explicitly rather than being silently excluded.

`npm run test:e2e:clients:isolated` selects the four mutation tests and still requires the isolated fixture prerequisites below. `npm run test:e2e:legacy` retains the older auth/vendor/zone suite with its existing configuration and prerequisites; it collects only root-level specs, excluding feature suites with their own configs. No existing legacy tests were deleted or claimed passing.

## Nonmutating local checks

```sh
./node_modules/.bin/playwright test --config=playwright.clients.config.ts --project=clients-chromium
E2E_TENANT=mk ./node_modules/.bin/playwright test --config=playwright.clients.config.ts --project=clients-chromium
```

The independent config loads only required credential/backend keys from ignored local environment files, defaults to CP, refuses unsupported hosts, and does not run the existing global setup or alter the tracked auth file. CP/MK UI login is verified against same-origin dashboard and an authenticated landmark; independent REST authentication verifies profile username/company domain. API reads verify UI identity/filter results. REST verification tokens are revoked on teardown. Browser auth state lives only in memory and is isolated by host/persona.

These tests read the supplied local dataset, which must have at least one named visible client with PPPoE ID and phone. They do not provision/reset the database, submit valid client saves, change user preferences, or perform payment/device actions. API snapshots test UI/backend agreement, not independent correctness of backend business calculations. Dynamic local data can change between snapshot and browser read; use controlled seeded data for CI. List rendering can trigger the application's normal read/poll behavior; no explicit router mutation is exercised.

Current cases cover list identities/totals/reload, name/PPPoE/phone search, status and billing filters, current-month deep link, empty search recovery, both detail links, detail identity/package, phone/WhatsApp targets, required-field/min-name validation, create cancellation/defaults, four anonymous routes, and bidirectional CP/MK foreign UUID read/search denial. These are scenario slices, not complete coverage of all CLIENT-001 criteria.

## Isolated mutation project

```sh
E2E_CLIENT_MUTATIONS=1 E2E_CLIENT_FIXTURE_FILE=/absolute/path/client-fixtures.json ./node_modules/.bin/playwright test --config=playwright.clients.config.ts --project=clients-isolated
```

Both variables are required. Without them, mutation preflight fails explicitly before any client mutation. Running config without `--project` selects both projects, including this prerequisite check. No unconditional skips are used.

Use a separately provisioned disposable database, fake router and fake SMS/Telegram/notification adapters. The booleans below are operator attestations, not automatic detection that integrations are fake. Do not assert them for a shared/live setup. Example fixture shape (replace synthetic labels/IDs with actual isolated fixtures):

```json
{
  "isolatedDatabase": true,
  "fakeRouterAndNotifications": true,
  "tenant": "cp",
  "network": { "id": 100, "name": "E2E Fake Network" },
  "package": { "id": 200, "name": "E2E Fake Package" },
  "clientPayload": {
    "billing_type": "manual",
    "billing_term": "prepaid",
    "payment_term": 1,
    "payment_deadline": 11,
    "status": 0
  }
}
```

No writable company/reseller IDs are allowed in fixture payload. Network/package IDs must belong to selected tenant and use fake transport. Fixture creation generates unique name/PPPoE/password, disables client SMS flags and cable invoice, resolves returned client by unique PPPoE (store API returns a message, not UUID), and creates its own edit target. Teardown deletes only owned client then archived record. Persona needs clients.create/show/edit/delete and archived-clients.delete for those cases. If dependent records prevent cleanup, preserve diagnostic identity and investigate; never delete unrelated data to force cleanup.

Implemented mutation cases: UI create and fresh detail verification; edit hydration/name/billing preservation; cancel edit; optional IP clearing. They remain unexecuted until isolated fixture prerequisites are supplied.

## Limits and diagnostics

Application/login behavior is unchanged. Package scripts select the dedicated config, and the legacy config excludes client specs; preexisting configuration changes are preserved. Desktop filter/search buttons currently lack accessible names, so tests use their specific rendered icon classes with an explanatory comment. Create-form interactions wait for the initial bootstrap network to settle because the page has no hydration-ready marker and typing/submitting earlier can lose input or trigger native GET submission. This wait is limited to create bootstrap; polling list/detail screens do not use it. No arbitrary fixed sleeps are used.

The backend returns numeric SID/payment deadline despite the application ClientRowSchema expecting strings. Tests use a small independent transport schema rather than production validation as their oracle. This mismatch is recorded, not patched in application code. Next-SID schema hint is not rendered by current shared field code; billing-default test does not claim hint coverage.

No subscriber/restricted staff/reseller/zone credentials or financial/router/image failure fixture controls were supplied. Those scenario variants remain explicitly tracked in the implementation status document. Backend direct authorization coverage remains necessary; successful CP/MK read denial alone does not prove complete tenant isolation.

Default reports: `playwright-report/client-suite/html/` and `playwright-report/client-suite/results.json`; artifacts live in the sibling `artifacts/` directory. Set E2E_CLIENT_ARTIFACT_DIR to a private run-specific folder to protect evidence from other test commands. Recorded final runs use `/tmp/isp-client-e2e-cp/` and `/tmp/isp-client-e2e-mk/`. Traces/screenshots/video are disabled to avoid capturing login secrets/private client fields; browser actions in worker login are not traced. Treat generated reports/error contexts as private local artifacts. Tests must not print bearer tokens or passwords.
