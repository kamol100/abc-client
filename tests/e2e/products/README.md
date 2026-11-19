# Product acceptance suite

Run `npm run test:e2e:products`. Optional `PRD_E2E_ARTIFACT_DIR` selects the output folder; `PRD_E2E_CHROMIUM` selects an already-installed Chromium binary. Pass Playwright arguments after `--`.

The runner starts an in-memory Laravel fixture and a scratch Next.js checkout on ephemeral ports. Browsers authenticate on the registered `cp.isp.test` host. The separately authenticated MK API persona uses `mk.isp.test` as its tenant login host. Credentials are generated per run and kept in memory. It does not use the existing local database, development server, passwords, router, or financial providers. The root `npm run test:e2e` dispatcher includes this suite.

The fixture creates known CP/MK products, stock lots, serials, vendors, staff and clients. Separate full, read-only, denied and stock-out-report-only personas exercise actual Laravel authorization. Every HTTP request boots a fresh application against the fixture connection. Queue, notification, HTTP and storage integrations are faked. Tests inspect fresh persistence through an authenticated fixture-only snapshot and exercise the feature through the browser where applicable. Test controls bind to loopback and require the generated fixture secret.

`PRODUCTS-001` scenario IDs appear in test titles. The suite covers CRUD, all six routes, stock reconciliation and atomic rollback, serial protection, scoped relations, product/report filters, date boundaries, pagination, column visibility, error recovery, background refresh stability, repeat submission, identity changes, keyboard access, and mobile English/Bangla light/dark forms.

The SQLite fixture serializes HTTP requests. Competing-request and rollback tests do not constitute a real MySQL row-lock/concurrency test. Backend instructions forbid directing tests at MySQL. Queue assertions verify the asynchronous invoice payload and committed stock, while invoice-worker execution/retry belongs to the invoice worker's separate verification. No print/export controls or stock-movement edit UI are exposed, so this suite does not invent them.

See [reviewed acceptance and evidence](../specifications/products/PRODUCTS-001.md).
