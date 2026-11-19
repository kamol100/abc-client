# Fund report acceptance

Run `npm run test:e2e:fund-reports` from the frontend checkout. This focused suite
is also discovered by `npm run test:e2e`.

The runner boots the sibling Laravel fixture through `scripts/ai/backend-test`
using SQLite in memory, isolated storage/cache, and faked HTTP/notifications/queue.
It starts a scratch copy of Next.js with a server-reachable API broker and uses
registered `cp.isp.test`, `mk.isp.test`, and `app.isp.test` browser origins on an
allocated port. It uses generated temporary credentials, normal UI login, actual
middleware, FormBuilder and server actions. No installed dependencies or local
business database are changed. Everything is discarded on exit, including after
failures. CP editor, reader, denied staff, CP reseller, MK and platform users are
separate personas with separate browser state.

If the default Playwright browser is unavailable, point `FR_E2E_CHROMIUM` at an
already installed Chromium executable. `FR_E2E_ARTIFACT_DIR` selects the report
folder. The runner prints its artifact directory; it never prints credentials.

The twelve FT063 scenario IDs correspond to the reviewed
[specification](../specifications/reports-funds/REPORTS-FUNDS-001.md).
The fixed CP balances are BDT 100.25, 200.50, -50.75, 0 and 1 through 8, totalling
286 across twelve funds. Foreign MK 9,999, reseller 777 and platform 333 must never
contribute to CP company funds. No money movement is tested or initiated.

The report exposes editing and transaction detail according to permissions, but
no creation, date/status filter, export or print. Tests check these absences rather
than inventing unsupported actions. Tests never click a transaction save or delete.
Fresh direct API reads validate persistence; backend FundReportAcceptanceTest
covers totals, permission denial, cross-tenant/reseller UUIDs and foreign staff
assignment. Artifacts and source hashes are linked from the specification workspace.
