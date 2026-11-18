# RESELLER-001 browser suite

Read the reseller ticket and `tests/e2e/AGENTS.md` before extending these tests.

```sh
npm run test:e2e:resellers
E2E_TENANT=mk npm run test:e2e:resellers
```

`npm run test:e2e` discovers `playwright.resellers.config.ts` with the other feature suites. Company tests default to CP. MK is the other company. APP administration is not a substitute for company isolation. Credentials come from the ignored tenant env file. Login uses `http://cp.isp.test/admin` or `http://mk.isp.test/admin`.

## Implemented scope

31 checks cover list identity and reload, name/phone/status/zone/network/combined filters, username exclusion, pagination bounds, an unmatched name, create validation, duplicate username, edit hydration and cancel, agent commission validation, detail profile and package tabs, the clients tab, anonymous routes, foreign UUID denial, Admin-role switch denial, delete cancel, recharge cancel and invalid amounts, invalid or foreign funds, an unknown wallet, and the termination setting.

These are partial parent scenarios. See [implementation status](../specifications/resellers/IMPLEMENTATION.md) and [execution evidence](../specifications/resellers/EXECUTION.json).

The username exclusion check fails on CP and MK. The filter form sends `username`, and `app/Services/Filters/Resellers/Filters.php` does not apply it, so an unknown username leaves the company list in place. The assertion stays at total 0.

No successful create, package reassignment, recharge settlement, purge, or import is submitted. Settings are toggled and restored. Invalid recharge requests are denied and the balance is read again.

## Dataset and test design

Requires CP and MK staff who can list resellers, open create and edit, view clients, recharge, change settings, and start impersonation. Each current local company has one reseller. The linked user is an Admin, so a successful switch cannot run. A second reseller is required before the client-tab switch and page-2 branch run. Page size is not changed.

Authentication reuses the client fixtures: a worker login, a fresh context per test, and a REST token that is not the impersonation token. Reports default to `playwright-report/resellers/`. Set `E2E_RESELLER_ARTIFACT_DIR` for a private run folder. This machine needs `PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright` when the sandbox browser cache has no Chromium.
