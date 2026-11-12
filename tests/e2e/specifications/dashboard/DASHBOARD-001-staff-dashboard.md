# DASHBOARD-001 — Staff dashboard

- Status: Draft for business review; all scenarios unimplemented.
- Investigated: 2026-11-12 through static source inspection.
- Goal: Authorized staff see accurate, scoped summaries and can follow permitted navigation without mixing companies, resellers, periods, or financial meanings.
- Scope: `/dashboard`, card visibility settings at `/settings/dashboard`, new-client/report links, due tables, chart, and support-count integration.
- Follow-ups: subscriber dashboard, full settings suite, detailed accounting/report suites, and complete subscription lifecycle.

## Source evidence

Repository-relative paths: `app/(dashboard)/dashboard/page.tsx`; `components/dashboard/dashboard-overview.tsx`, `dashboard-overview-client.tsx`, `use-dashboard-data.ts`, `dashboard-visibility.ts`, `dashboard-constants.ts`, `dashboard-type.ts`, due-filter schemas, and `items/` cards; `components/settings/dashboard.tsx`; existing `tests/unit/dashboard/` visibility/client/reseller/staff-collection tests.

Backend: sibling `../isp-backend/routes/api.php` and `app/Http/Controllers/V1/Admin/DashboardController.php`. Tenant requirements: `.cursor/rules/architecture.mdc` and sibling `docs/architecture/multi-tenancy.md` sections 3 and 10. Existing e2e specs have no dashboard-specific business coverage.

## Observed contracts

- Summary requests are independently enabled using card permissions AND visibility settings. Missing settings default to visible if permitted. Hidden-card settings cannot grant permissions.
- Permissions: `dashboard-card.client`, `.reseller`, `.invoice`, `.invoice-paid`, `.invoice-dues`, `.expense`, `.fund`, `.ticket`, `.product-stock`, `.invoice-expense-graph` (each suffix follows `dashboard-card`). Top-due and zone-due use `dashboard-card.invoice`.
- Corresponding visibility keys: `dashboard_show_client`, `_reseller`, `_invoice`, `_invoice_paid`, `_invoice_dues`, `_expense`, `_fund`, `_ticket`, `_product_stock`, `_top_due_invoices`, `_zone_due`, `_invoice_expense_graph` (each suffix follows `dashboard_show`).
- API paths relative to `/api/v1`: `/dashboard-client-count`, `/dashboard-reseller-count`, `/dashboard-invoice-summary`, `/dashboard-invoice-due-summary`, `/dashboard-invoice-paid-summary`, `/dashboard-staff-invoice-collection`, `/dashboard-expense-summary`, `/dashboard-fund-summary`, `/dashboard-ticket-summary`, `/dashboard-product-stock-summary`, `/dashboard-graph-chart`, `/dashboard-top-due-invoices`, `/dashboard-zone-wise-top-invoice-due`.
- API route names follow `dashboard.*` (for example `dashboard.invoice.paid.summary`); these are distinct from frontend `dashboard-card.*` permissions. Routes sit outside the main route-permission middleware group; inspect effective backend authorization before asserting a denial policy.
- Staff collection query requires a staff profile and invoice-card permission; it is independent of the invoice visibility setting. Actual rendering also depends on `hasStaffInvoiceCollection`.
- Invoice totals sum `after_discount_amount` in minor units divided by 100; due summary selects status `due`; paid summary selects `paid` and groups periods by invoice `create_date`. Staff collection sums paid/partial invoice-linked payments collected by the current staff using `payment_date`.
- Ticket card exposes open/in-progress/resolved counts, not closed counts. Funds report total plus name-based cash/bkash balances. Product stock displays category quantities and units.
- Chart sends `year_filter`. Top-due sends `limit` (default 10) and optional `zone_id`; zone-due sends limit. Previous table data can remain while refreshing.
- Positive new-client counts link to `/clients?created_at=this_month` with `clients.access`; reseller-client equivalent requires `resellers.clients.report` and links to `/reports/reseller-clients?created_at=this_month`.
- Settings save through `POST /company/settings`. Treat its authorization and isolation separately from card preferences.

## Decisions required before implementation

1. Approve meanings of paid, due, partial, discounted amounts and period boundaries. Paid invoice value by creation date is different from cash collected by payment date; should labels and calculations remain as observed?
2. Confirm staff-collection visibility when invoice card is disabled, staff has zero collections, or no staff profile exists.
3. Confirm which backend dashboard routes must enforce card permissions directly; current controller inspection does not establish matching endpoint authorization. Hidden cards alone cannot enforce security.
4. Confirm whether visibility settings apply company-wide and who may change them. Never mutate a shared persona/company setting in parallel tests.
5. Approve rounding, due ranking/tie rules, displayed versus overall table totals, stock aggregation across units, and reseller/assigned-zone scopes using the underlying services before locking expected values.
6. Confirm expected malformed-data/error recovery: parsing currently falls back to zeros/empty arrays in several places; a successful-looking zero must not be accepted automatically for invalid data.

## Fixtures

Dedicated backend database/cache and test domains for two companies; full-card user, restricted-card user, staff collector, non-staff user, reseller, and assigned-zone staff. Seed isolated company settings, subscribed/denied states, current/prior-month clients, active/inactive clients, reseller-owned clients, and known financial rows.

Provide invoices with discounts and paid/due/partial states; payments whose dates differ from invoice dates; two staff collectors; expenses; named funds; stock categories; tickets in all four statuses; two zones and enough due rows to exercise limits. Record independently calculated expected values and include/exclude identities in the approved fixture manifest. Do not use production aggregation helpers to compute expected answers.

Use consistent backend/browser Asia/Dhaka calendar boundaries. Browser clock changes do not set Laravel time. Reset dedicated caches so unrelated data cannot change totals. Fake outbound notifications/providers for fixture mutations.

## Scenarios

P0 = access/financial integrity; P1 = main workflow; P2 = extended regression. Each case is independently runnable. Review-blocked cases require the decisions above, not permissive snapshots of current behavior.

### Visibility and layout

- DB-V01 [P1]: Full-card user with enabled settings sees all permitted cards, due tables, and chart after loading; identify each by its accessible title.
- DB-V02 [P0]: Remove each card permission separately while its setting is enabled; corresponding card/data is unavailable. Setting enabled must never grant access.
- DB-V03 [P1]: Disable each visibility setting with permission retained; reload hides that item and fresh page load avoids its dedicated query. Observe server requests using a test stub/backend log where browser request matching cannot distinguish actions.
- DB-V04 [P1]: Missing settings use the approved visible default; explicit false hides a card. Exhaustive string/number normalization stays in existing unit tests.
- DB-V05 [P1]: With all items disabled, page remains usable with no orphan grids, chart controls, or endless loaders; restore settings in teardown.
- DB-V06 [P1, review-blocked]: Save a visibility change as permitted settings user; fresh login/reload reflects intended company/user scope. Another company remains unchanged and unauthorized user cannot persist settings.

### Summary correctness

- DB-S01 [P1]: Client totals equal known active plus inactive fixture counts; current-month new clients exclude boundary/out-of-month fixtures and foreign company records.
- DB-S02 [P1]: Reseller summary matches known reseller and reseller-client counts; company-owned clients are not silently included in reseller-only figures.
- DB-S03 [P0, review-blocked]: Invoice total/current-month/prior-month values match approved discounted fixture totals and monetary units.
- DB-S04 [P0, review-blocked]: Due/paid cards correctly include or exclude due, partial, paid, and discounted fixtures under the approved policy; paid periods distinguish invoice creation from payment date explicitly.
- DB-S05 [P0, review-blocked]: Staff collection includes only the signed-in collector's eligible invoice-linked paid/partial payments by payment date, excluding other staff and wallet-only payments. Assert approved zero/no-profile visibility.
- DB-S06 [P1]: Expense and fund cards match independently specified fixture totals, periods, cash/bkash breakdowns, and units; zero values render without NaN or missing labels.
- DB-S07 [P1]: Support card shows expected open/in-progress/resolved counts; closed fixtures do not inflate those counts.
- DB-S08 [P1, review-blocked]: Product-stock categories, remaining totals, no-stock state, and units match approved inventory fixture expectations.

### Due tables and chart

- DB-T01 [P1, review-blocked]: Top-due table displays expected ranked identities, amounts, and total for default limit, including approved tie behavior.
- DB-T02 [P1]: Select a seeded zone and then another limit; include/exclude identities and row bounds match fixtures. Reset returns defaults without affecting the zone-summary table's independent filter.
- DB-T03 [P1, review-blocked]: Zone-due table aggregates the expected zones/amounts and limit; approved totals remain correct when fewer rows are displayed.
- DB-T04 [P1]: Change chart year between two distinct fixture years; labels/series reflect selected year and no values remain from the previous response after refresh completes.
- DB-T05 [P1]: Rapidly change due filters/chart year while responses are delayed; eventual results match the latest selection, not an older response arriving last.

### Navigation, access, and integration

- DB-N01 [P1]: Positive new-client metric with destination permission navigates to current-month client list; destination shows exactly the seeded matching clients.
- DB-N02 [P1]: Positive reseller-client metric with report permission navigates to filtered reseller report. Zero count or missing destination permission does not expose an active destination link.
- DB-A01 [P0]: Anonymous dashboard access requires staff login; subscriber session does not expose staff dashboard metrics.
- DB-A02 [P0]: Company A cannot render company B counts, amounts, identities, chart series, or stock; repeat after logout/login on company B host and browser back/reload.
- DB-A03 [P0, review-blocked]: Reseller/zone-assigned personas see only approved scoped totals, due rows, and chart data. Backend tests independently exercise direct API authorization.
- DB-A04 [P0, review-blocked]: Without relevant card permission, direct endpoint access follows the approved backend denial policy; report gaps rather than testing only hidden UI.
- DB-N03 [P1]: Create/resolve a test support ticket through the approved support workflow, reload dashboard, and verify exactly the expected summary delta. Cross-reference SUPPORT-001; fixtures remain independent of its tests.

### Resilience and presentation

- DB-R01 [P1]: Delay one summary endpoint; its loading state appears while successful cards remain usable. On success it renders known values.
- DB-R02 [P1]: Reject one endpoint; its error state appears without breaking unrelated cards; approved recovery fetch restores the fixture result.
- DB-R03 [P1, review-blocked]: Malformed summary data is distinguishable from valid zero values according to approved behavior; do not bless silent zeros as correctness.
- DB-R04 [P1]: Legitimately empty company renders valid zero/no-data states, without charts showing stale series from a prior identity.
- DB-R05 [P1]: Expired session/subscription denial uses agreed recovery/banner behavior and does not retain previously authorized data as current.
- DB-R06 [P2]: At representative mobile width, English/Bangla, and light/dark themes, cards, table controls, and year selection remain reachable and labeled; use deterministic data for any visual snapshots.

## Handoff and definition of done

Review decisions first. Implement visibility/basic summaries, then approved financial/scoping cases, filters/navigation, and resilience. Use role fixtures and semantic locators; scope assertions to titled cards. Wait for final animated values with retrying assertions. Do not rely on fixed sleeps, screenshots alone, copied production sums, or one opaque page-load assertion.

Next.js server-action fetches cannot be intercepted by browser `page.route`; use the dedicated real API or a server-reachable controlled stub. Keep auth state generated at runtime and out of commits/artifacts. Repair shared auth/form helpers in a separate prerequisite task, preserving existing worktree edits.

Every ID must link to an executable test or a reviewed blocker/deferral. Record exact commands, environment, pass/fail/skip counts, and trace paths; independent reruns must be stable. Complete appropriate repository checks when implementing. Backend authorization remains a separate security boundary. Update `.ai/report.md`; no installs/push/deploy without required approval.

Current verification: static inspection only; no application code changed and no tests executed.
