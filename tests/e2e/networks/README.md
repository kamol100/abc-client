# NETWORK-001 browser suite

Read the network ticket and `tests/e2e/AGENTS.md` before extending these tests.

```sh
npm run test:e2e:networks
E2E_TENANT=mk npm run test:e2e:networks
```

`npm run test:e2e` discovers `playwright.networks.config.ts` with the other feature suites. Company tests default to CP. MK is the other company. Credentials come from the ignored tenant env file. Login uses `http://cp.isp.test/admin` or `http://mk.isp.test/admin`.

## Implemented scope

20 checks cover list identity and reload, filters, pagination bounds, column visibility, create validation and cancel, edit hydration and cancel, connection labels, anonymous login, foreign UUID denial, logout, delete cancel, client-bound delete denial, numeric dropdown ids, and a 390px layout.

The name, address, inactive, combined, and unknown-name checks fail on CP and MK. `NetworksController::index` does not apply those filters, and the assertions stay on the filtered result. See [implementation status](../specifications/networks/IMPLEMENTATION.md).

No successful create, saved edit, or confirm delete of an unused network is submitted. Client-bound delete is rejected and the row is read again.

## Dataset and test design

Requires CP and MK staff who can list, create, edit, and delete networks, and who can open client and reseller create. Each current local company has two active simulator networks and one page. The suite refuses to render the list when an active network is not `127.0.0.1:8728`.

Authentication reuses the client fixtures: a worker login, a fresh context per test, and a separate REST token. Reports default to `playwright-report/networks/`. Set `E2E_NETWORK_ARTIFACT_DIR` for a private run folder. This machine needs `PLAYWRIGHT_BROWSERS_PATH=$HOME/Library/Caches/ms-playwright` when the sandbox browser cache has no Chromium.
