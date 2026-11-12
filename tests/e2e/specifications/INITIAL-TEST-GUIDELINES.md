# Initial guidelines AI agents must follow

## Start every task

Read root AGENTS.md, tests/e2e/AGENTS.md, the relevant feature specification/source evidence and COVERAGE-POLICY.md. Run scripts/ai/status before editing. Inspect existing helpers/config and the frontend/backend implementation. Identify scenario IDs, exact persona, origin, fixture ownership, required permissions and approved expected results before implementation.

Use investigate → specify → review → implement → verify. Continue approved independent work; do not ask repeatedly about decisions already authorized. Escalate unresolved business rules instead of inventing billing, deletion, privilege or ownership semantics.

## Local login hosts — required

These hosts were explicitly supplied by the user for local testing:

- Company CP: http://cp.isp.test/admin; username cp; variable prefix E2E_CP.
- Company MK: http://mk.isp.test/admin; username mk; variable prefix E2E_MK.
- Administration APP: http://app.isp.test/admin; username kamol; variable prefix E2E_APP.

Passwords are stored in the ignored root file `.env.e2e.tenants.local` supplied for this workspace. Use `<PREFIX>_BASE_URL`, `<PREFIX>_USERNAME`, `<PREFIX>_PASSWORD`. Never put passwords in tickets, committed config/tests, logs or screenshots. CI uses equivalent injected secrets and registered test origins; do not assume local hostnames exist in CI.

**Login at localhost:3000 does not work. Do not substitute localhost:3001, 127.0.0.1, an IP URL or a different tenant to make authentication pass.** A local Next.js process can listen on localhost behind a reverse proxy, but browser origin and login hostname must remain the registered tenant host. Hostnames are tenant hints used by backend login; changing only HTTP headers while browsing localhost is not equivalent.

CLIENT-001 now has a separate tenant-aware `playwright.clients.config.ts`; see `tests/e2e/clients/README.md` for its exact project commands. It loads the tenant credential file, validates CP/MK origins, and keeps auth in memory. The standard `npm run test:e2e` command discovers all root-level `playwright*.config.ts` suite configs and runs each, including both client projects. Use `npm run test:e2e:clients` for only nonmutating client checks; the full run requires isolated mutation fixtures. Feature suites retain their own authentication and report directories.

The legacy `playwright.config.ts` loads `.env.e2e` and defaults baseURL to localhost:3001; current helper falls back to vp and accepts /admin as a successful destination. These are known prerequisites to fix in a separate implementation change, preserving current edits. `.env.e2e.tenants.local` is NOT automatically loaded by the current config. Do not claim tenant setup works merely because this file exists.

For a single-tenant run, explicitly load the chosen local variables securely and map base URL/username/password into the currently supported PLAYWRIGHT_BASE_URL/E2E_AUTH_USERNAME/E2E_AUTH_PASSWORD environment before starting the runner. Prefer a future typed tenant fixture/config loader that reads this credential source and fails on missing values. Never echo/export passwords as literal shell command arguments or use a vp/default-password fallback. Multi-tenant tests need contexts whose login origins and credentials are explicitly selected, rather than one global credential pair.

## Company versus administration scope

CP and MK are ordinary company tenants. The authenticated company_id determines their data boundary; they must not read/mutate the other company's protected business data. Do not hardcode numeric company IDs or send company_id/reseller_id as authorization input to hop scope. Obtain expected fixture identity through supported setup/authenticated profile and independently verify known included/excluded records.

APP is the administration tenant. Its authorized platform workflows may intentionally view or manage CP/MK data. Test allowed cross-tenant platform access separately from ordinary company isolation. An administrative hostname, company_id=1, or a broad-looking UI is never proof that the current user has the required platform permission. Include a platform user without that capability to verify denial once such a fixture exists.

The supplied accounts are baseline local logins, not proof they represent every role. Inspect effective profile/permissions. Provision restricted staff, reseller/zone users, subscribers and platform-without-permission fixtures through approved mechanisms; do not silently reuse the broad admin account for negative permission cases.

## Before and after login

1. Confirm selected host resolves and serves the intended frontend, backend is reachable and environment/tenant record exists. Check runtime behavior; do not edit hosts/proxy/production env or install dependencies as an unrequested workaround.
2. Use fresh browser context and explicit baseURL for chosen host; visit /admin and use selected username/password. UI login is tested explicitly; other feature tests may reuse validated host/persona-specific runtime storage state.
3. Assert eventual dashboard destination on the SAME origin, an authenticated page landmark and expected profile/tenant/permissions. Redirect to /admin, missing permission/profile, failed callback, or a cookie alone cannot satisfy success.
4. Fail with sanitized environment/login evidence on failure. Do not catch and navigate manually to dashboard to mask failed login, accept /admin as success, retry on a different host, or continue as another account.
5. Keep storage state separate by tenant/persona/worker as needed; never share cookies between CP, MK and APP. Generate states at runtime in an ignored location; current tracked/dirty playwright/.auth/user.json is not a safe universal fixture. Preserve it and remediate tracking separately.
6. After logout/impersonation leave/switch, verify identity and permissions plus cache isolation. Clear/rebuild browser/query/service-worker state according to real app flow, and assert previous protected data does not reappear through back/reload.

## Test-writing requirements

- Name tests with scenario IDs. Split parameter variants into explicit registered cases so one success does not stand for all roles, statuses or inputs.
- Use semantic roles/labels and scope row/dialog by fixture identity. No first-row/first-option shortcuts or fixed sleeps; use retrying assertions and controlled queue completion.
- Use backend-owned run/worker/test fixtures and failure-safe teardown. Separate browser contexts do not isolate shared funds, stock, accounts or database state.
- Create prerequisites through existing supported APIs/approved seed infrastructure. Drive the actual feature through UI. Read Laravel requests/resources/routes/services before asserting payloads, identifiers or permissions.
- Assert persistence and domain outcomes through reload/fresh reads, exact target identity, independently calculated money/stock values and absence of forbidden side effects. Success toast/dialog closure alone is insufficient.
- Keep valid-empty, loading, failed and denied states distinct. Do not alter expected behavior to fit a product bug, silently skip failures or calculate expected totals using the production helper under test.
- Next.js server-action outbound fetches and Laravel device/provider calls cannot be intercepted by browser page.route. Use isolated real backend or server-reachable test adapter.
- Fake router/SNMP/CLI, SMS/email/Telegram, gateway and other external effects. Use disposable scoped datasets for purge/import/deletion and preserve unrelated-record sentinels.
- Frontend tests supplement direct backend authorization tests; neither hidden UI nor the APP host proves tenant isolation or valid platform access.

## Finish

Run relevant specs and repository-required checks; report only commands actually executed, with selected host/persona (no secrets), environment, counts and sanitized artifacts. Run scripts/ai/diff and scripts/ai/status. Update ticket/register with real evidence and `.ai/report.md`. Draft specs are not passing coverage. Installs, dependencies, production env edits, push and deploy need required approval.
