# PRODUCTS-001 — Products

Status: reviewed and implemented; executed evidence and remaining verification are recorded below. Scope: `/products`, `/products/in`, `/products/out`, `/products/in/[id]`, `/products/out/[id]`, `/products/reports`.

Run `npm run test:e2e:products`. Tests: [products.spec.ts](../../products/products.spec.ts). Fixture and runner details: [suite README](../../products/README.md). [Source inventory](source-evidence.md) and [coverage policy](../COVERAGE-POLICY.md) remain applicable.

## Reviewed contracts and decisions

- Products use UUID route keys; stock-entry payloads and dropdowns use numeric database identifiers. The UI hydrates product category/unit relations before editing. Name is trimmed, 2–255 characters; description is at most 255 characters; VAT is nonnegative; category and unit must belong to the authenticated company/reseller scope. Writable company/reseller fields are prohibited. Serial mode comes from the saved product.
- Stock-in and stock-out quantities must be positive. Serialized quantities must be whole, with an available, distinct serial per item. An incoming serial cannot repeat on the same product. The selected outgoing lot must belong to the selected product. The remaining quantity is checked while the lot is locked; unavailable serials are rejected while locked. A failed later line rolls back all earlier changes in the request.
- Displayed money and API payloads use BDT major units. Stored prices/expense amounts use integer poisha. Independent examples: three items at BDT 100 cost BDT 300; issuing two at BDT 150 records BDT 300 and leaves one. Snapshot checks expect 30,000 poisha.
- **User decision, 19 November 2026:** keep the existing invoice calculation. For quantity 2 at BDT 150, VAT 10%, discount BDT 20, the stock line can be BDT 310 while the queued invoice retains base BDT 300 minus BDT 20 = BDT 280. This suite explicitly asserts that existing calculation.
- **User decision, 19 November 2026:** keep committed stock-out when asynchronous invoice creation fails, allowing queue retry. Do not replace that workflow with synchronous invoice/stock rollback. Synchronous validation/transaction failures still leave no partial stock changes. The suite fakes queue execution and verifies its payload; it does not claim successful invoice delivery or retry.
- Products with stock or serial history cannot be deleted, matching the existing UI restriction. An unused test-owned product can be deleted. No stock-movement edit flow, print or export control is exposed; none is fabricated.
- Product filters: search, category, unit, serial flag. Movement/report filters: product where exposed, vendor, entering staff, purchaser/receiver, status and local calendar-date range; client exists on outgoing movement filters/API. `entry_by` resolves the staff selector to the stored entering identity. Same-day date ranges include the whole date. Summaries cover the complete filtered dataset, not one page.
- CP and MK use registered tenant origins and isolated sessions. Full, read-only, denied and out-report-only actors are separate users with exact grants. Direct API authorization tests supplement hidden controls and URL checks. Reseller relation enforcement has separate backend coverage.

## Acceptance groups and executable cases

Each test title names its explicit child scenario. The coverage register expands these groups rather than treating one generic case as proof of every variant.

- FT051-01: browser-created serialized product preserves unit, category, VAT and serial mode after fresh API read and reload.
- FT051-02: browser stock-in/out reconciles quantity, vendor/staff and expense persistence; the separately approved invoice payload retains its exact calculation.
- FT051-03: negative/zero quantities, duplicate incoming/existing serials, already-issued serials, mismatched lots, remaining-stock limits and multi-line rollback. Concurrent HTTP submissions are checked in the serialized fixture. Real database concurrency remains a separate blocked case.
- FT051-04: inventory, both create forms, both product-specific movement routes and combined reports expose named fixture content and survive reload.
- FT051-05: product filters independently and combined, reset/empty states, report filters including entering staff and outgoing client, and inclusive/exclusive date boundaries with exact quantities/prices.
- FT051-06: known product rows paginate, page changes preserve identities, and permitted column visibility works. Full-filter report totals are checked independently of page contents.
- FT051-07: edit hydration, cancel, save/reload, unused-product deletion, and protection of stock history.
- FT051-08: required fields remain recoverable; a controlled save failure preserves the draft and retry creates one record.
- FT051-09: full/read-only/denied/out-only users, direct reads/reports/mutations, anonymous access, and direct form URLs. No host or company-id privilege shortcuts.
- FT051-10: known foreign UUID/numeric reads and deletion, forbidden relationship/company fields, reseller boundaries, same-host logout/login and back/reload.
- FT051-11: truthful failed/empty/loading states, retry and held background requests; loaded rows and scroll remain stable, and the latest filter wins.
- FT051-12: Enter during a delayed valid save produces one mutation; same-host identity change cannot restore the former user's write controls.
- FT051-13: mobile keyboard-opened forms, correct focus, English/Bangla placeholders, and light/dark appearance with inspected screenshot evidence.

## Verification and limits

Fresh run details, source hashes, exact test titles and inspected screenshots are in [evidence/run.json](evidence/run.json). The register records the same evidence and the six route mappings. Failed early runs were used to reproduce defects; they are not passing evidence.

The browser fixture is real Laravel plus Next.js, using SQLite `:memory:` and faked external integrations. The backend mandates SQLite and prohibits MySQL tests. Real MySQL lock scheduling therefore remains unverified and is retained as a blocked scenario rather than excluded. Queue-worker invoice delivery/retry is not claimed by a fake-queue assertion. Global frontend unit failures are compared separately against an archive of HEAD; passing feature checks do not imply the whole repository passes.

### Latest executed result

The final source-matched run passed all 50 browser/API acceptance cases with no skips or flaky results. Backend product regressions passed 70 tests and 283 assertions; Pint and PHPStan passed on all 17 changed backend files. Product unit tests passed nine tests. Typecheck passed. The full frontend check ran 769 tests: 749 passed and 20 failed; an isolated archive of HEAD reproduced the same 20 failures and failure headings.

The expanded product register records 51 evidence-backed passes (including the separate reseller backend case), one blocked real-database concurrency case, 100% review readiness, 98.08% recorded scenario pass coverage, 96.77% critical coverage, and all six routes executed. The overall release target is **not** marked met because critical database concurrency remains unverified. The global inventory checker separately stops on three existing unmapped Help Management pages, also reproduced against HEAD; product links, hashes, scenario references and route mappings were checked independently.
