# INVOICE-001 browser suite

Read the invoice ticket and `tests/e2e/AGENTS.md` before extending these tests.

```sh
npm run test:e2e:invoices
E2E_TENANT=mk npm run test:e2e:invoices
npm run test:e2e -- --list
```

The standard `npm run test:e2e` automatically includes `playwright.invoices.config.ts`, together with the other feature and legacy suites. The focused command runs only invoices. Company tests default to CP; MK is also supported. APP administration is not a substitute for company-isolation personas. The application/backend must already run at the registered local tenant hosts. Credentials are loaded from ignored local environment files using the existing tenant loader; no localhost login or committed session state is used.

## Implemented scope

36 nonmutating checks: list identity/date/client/type/status/amount rendering and reload; invoice ID, status, type, client, zone, creator and combined filters; pagination boundaries (next/previous branches when fixtures have multiple pages); client-UUID history and reload; no-match recovery; anonymous routes; bidirectional CP/MK foreign invoice detail/search denial; invalid form fields, defaults and cancellation; unsaved line add/remove/quantity totals; paid/partial field requirements and return to due; due edit hydration and cancellation; oversized UTF-8 note rejection; document identity/lines/note/total; instrumented browser print and cleanup; delete cancellation; payment-dialog identities, deselect-all totals and cancellation.

These are partial parent scenarios, not full INVOICE-001 coverage. See the [implementation status](../specifications/invoices/IMPLEMENTATION.md) and [execution evidence](../specifications/invoices/EXECUTION.json).

No valid invoice create/edit/delete, payment, discount, SMS or fund mutation is submitted. Invalid create tests keep required client/type unset and assert validation plus list identity/count stability. Cancellation tests compare fresh invoice details. These checks do not prove absence of all ledger/notification side effects; financial mutation scenarios need dedicated fixtures and independent ledger verification.

## Dataset and test design

Requires CP and MK profiles with invoice access/show/create/edit/pay/delete and dropdown permissions, existing named invoices with client/type/zone/creator relations, a due invoice with lines, and staff dropdown options. Multiple pages are needed to exercise the next/previous branch; both inspected local datasets currently have one page. The creator filter checks UI/API agreement because the resource omits creator identity. Missing prerequisites fail explicitly. API snapshots are independent transport checks, not independent proof of backend business calculations. Shared local data must remain stable during a run. For CI, use a controlled seeded dataset.

Authentication is reused from the existing client fixtures: same-origin UI dashboard and authenticated landmark checks, a separate REST token with verified username/company domain, in-memory storage state, and REST token revocation on teardown. No owned-client fixture is requested. No passwords or bearer tokens belong in artifacts. Reports are private because failed contexts may contain client data; trace/screenshots/video are disabled. Default reports: `playwright-report/invoices/html/` and `playwright-report/invoices/results.json`. Set `E2E_INVOICE_ARTIFACT_DIR` for a run-specific output folder.

Invoice UUID is parsed from the Laravel resource's string `id`, independently of the application's numeric row schema. React Select status options use untranslated keys for searching, so status selection opens the menu and picks the exact translated label. Remote dropdown labels come from independent API lookup by numeric relation ID (client display names contain additional identity text). No first-option choices are used. Line fields have dotted IDs rather than name attributes. Shared filter/delete buttons lack accessible names; tests identify their specific icons within the relevant context. The create helper waits for asynchronous bootstrap only; other pages use retrying assertions without fixed sleeps.

## Remaining work

Reviewed monetary arithmetic, partial allocation, discounts, concurrency/rollback and paid/partial edits remain blocked by the decisions recorded in the parent ticket. Full monetary integration also requires disposable fixtures, fake outbound integrations, assigned/unassigned/foreign funds, controlled failures and independent payments/fund/client balance reads. No fake environment attestation or permanent skip was added.

Restricted/subscriber/reseller/zone personas, date-range/page-size/multi-page variants, no-selection payment submission denial, client-embedded/conflicting filter checks, complete receipt/PDF artifacts, failure/loading states, logout/cache recovery and presentation matrix remain pending. Invoice view passes an empty `invoiceKey` when the API supplies only `id`, so document tests verify rendered content against a fresh API detail but do not claim lazy detail hydration works. Source gaps in discount/due lookup authorization remain findings to investigate, not accepted behavior or evidence of a runtime bypass.
