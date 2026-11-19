# REPORTS-FUNDS-001 — Reports Funds

- Status: reviewed against current source; implementation in `tests/e2e/reports-funds/funds.spec.ts`.
- Reviewed: 19 November 2026. Scope: `/reports/funds` and its exposed edit/detail dialogs.
- Source: [reviewed contract](source-evidence.md). Runtime: [isolated runner](../../reports-funds/README.md).
- Evidence: [execution record](evidence/run.json). No live MySQL, real transfers or external messages.

## Fixtures and independent expectations

CP company editor/reader/denied staff, CP reseller, MK company user and platform
Super Admin are distinct personas. Normal login and middleware remain active.
CP has twelve company-owned funds: 100.25, 200.50, -50.75, zero and 1 through 8
BDT. Full report = 286.00. Name alpha = 300.75; account MATCH = 49.50;
alpha + MATCH = 100.25; Alice staff = 116.25. MK's 9,999, reseller's 777 and
platform's 333 are excluded from CP company totals. Amounts persist as poisha,
API/UI values are BDT. Named staff, account numbers and UUIDs are fixture-owned.

## Reviewed scenarios

- FT063-01 [P0, approved]: Given all known funds, open the CP report; assert decimal, negative and zero values, full-scope total 286 and exclusion of foreign company/reseller records. A fresh API read must agree with independent expected totals.
- FT063-02 [P0, approved]: Given populated and valid-empty periods of this current-balance report, assert export/download/print and date controls are absent. There is no exported artifact or date period contract on this screen; no P0 scenario is excluded.
- FT063-03 [P1, approved]: Open/reload the exact report route and assert named fund, account and staff; open its exposed transaction detail dialog and assert the fixture's empty transaction list, then close without losing the fund.
- FT063-04 [P1, approved]: Apply name, account and staff independently and name+account together. Check exact totals and both included/excluded fund identities. Reset restores baseline rows.
- FT063-05 [P1, approved]: Navigate to page 2; total remains 286 across all twelve funds. Change exposed page size from 10 to 25; invalid page resets and all records return. Hide Account Number via the actual column control.
- FT063-06 [P1, approved]: Edit the owned alpha fund; assert saved account/name/staff hydration. Cancel retains original account. Save changes it, then confirm through a fresh API read; restore the suite-owned value.
- FT063-07 [P1, approved]: A one-character fund name keeps edit open with the actual field error. API empty required fields returns 422 and preserves balance. The report has no create form. Backend scope validation is also exercised in FT063-09.
- FT063-08 [P0, approved]: Editor can edit; reader sees report without edit/create and gets 403 on direct update. Denied staff get 403 on direct GET and a visible failure state/no protected rows on the direct report URL. No generic HTTP200/cookie-only login assertion.
- FT063-09 [P0, approved]: CP cannot read MK/reseller UUIDs; backend also rejects update/delete by these UUIDs. Reject foreign-company staff assignment with 422. Reseller total is 777; platform total is its own 333, not a cross-tenant aggregate. Sign out, sign in as MK on its registered host, reload and assert only MK rows.
- FT063-10 [P1, approved]: Distinguish valid empty from failed requests. Hold a real server-action read, assert previously loaded rows and table position remain stable, then abort reads. A translated error must appear. Remove fault and use Retry to recover current filtered results with no stale excluded row.
- FT063-11 [P1, approved]: Rapid beta→alpha searches leave alpha results only; fresh read confirms twelve funds and balance 286. Creation/transfer submission is not offered by this report; no fabricated duplicate payment workflow.
- FT063-12 [P2, approved]: At 390px use actual filter drawer and keyboard; set the supported dark theme cookie and switch through the real Bangla control. Assert dark rendering and no raw fund translation key; capture and inspect the rendered mobile view. Desktop evidence is captured by FT063-01.

## Domain review and limits

No new business accounting rules are invented: this is the existing current
balance report, with immutable test-owned financial fixtures and metadata-only
edit. Creation, transfers, deleting active funds, transaction exports and date
reporting belong to their separate feature tickets. Existing scope/permission
requirements come from the repository's tenant constitution. No scenario is
removed from the denominator. These checks establish workflow behavior, not code
line/branch coverage or production financial reconciliation.

The tests exposed and fixed foreign staff assignment, invalid page after resizing,
and missing translated query failure/retry state. Backend FundReportAcceptanceTest
adds direct checks alongside the existing FundControllerTest. Backend tests only
use SQLite memory; real MySQL concurrency and other browsers are not established.

Some preexisting icon buttons have no accessible name; tests use their specific
icons scoped to the fund row/toolbar rather than guessing a first button. Naming
shared controls throughout the application is outside this feature's changes.

Final execution counts, exact commands, source hashes and actual scenario status
are in evidence/run.json and coverage-register.json; failed attempts earn no credit.
