# EXPENSE-001 implementation status

Partial browser coverage. Passing slices do not mark a parent scenario passing. Review stays pending. No expense is created, saved, approved, or deleted.

30 checks use `playwright.expenses.config.ts`. CP, 2026-11-16: 29 passed and 1 expected failure. The staff filter assertion fails and is marked `test.fail` until `staff_id` isolates a second staff. MK was not run. Evidence: [EXECUTION.json](EXECUTION.json).

## Every parent scenario

- **EX-L01**: Implemented slice — Display ID, date, voucher, staff, fund, zone, type, amount, and status match the API after reload. The on-screen total and pending figures match the API `reports` fields.
- **EX-L02**: Implemented slice — Expense ID, voucher, and plain amount search match `any`. An unknown voucher or amount is empty. Clearing the search restores the list.
- **EX-L03**: Implemented slice, staff check failing — Approved, pending, and declined match the API and reload clears them. Zone, fund, type, one-day date, and expense ID plus status agree with the API. The staff check is an expected failure: `staff_id` does not isolate a second staff.
- **EX-L04**: Implemented slice — Previous is disabled on page 1. CP has one page, so next stays disabled and the later-page filter did not run. Page size is not changed because it persists the staff preference.
- **EX-L05**: Implemented slice — A status filter changes both figures to that query's API `reports` values. This does not independently recompute the ledger. The meaning of total versus approved spending stays review-blocked.
- **EX-L06**: Implemented slice — An unmatched search shows `No results` and clearing it restores the rows. A failed list request was not injected; the list uses a Next server action.
- **EX-L07**: Implemented slice — `/reports/expenses` shows `Expenses (n)`, hides Add, and shows the same rows and figures. Edit, delete, and status controls stay on the rows. Report policy is not approved.
- **EX-F01**: Blocked — A successful create can attach a fund and notify Telegram. Deleting it is not a safe cleanup.
- **EX-F02**: Implemented slice — Missing staff and type, and amount 0 or -1, keep the dialog open. The list total stays unchanged. Fractional acceptance is not asserted.
- **EX-F03**: Implemented slice — Create opens on today's Asia/Dhaka date. Cancel stores nothing. A blank voucher was not saved.
- **EX-F04**: Implemented slice — Edit hydrates the UUID's amount, voucher, note, relations, date, and status. Cancel leaves the expense unchanged. Nothing is saved.
- **EX-F05**: Implemented slice — Empty staff, fund, zone, and type cells render as an em dash. Edit fields do not show `null` or `undefined`.
- **EX-F06**: Implemented slice — A 256-character voucher and a 1001-character note stay on the form, the response mentions 255 or 1000, and no expense is created. Bangla text was not saved.
- **EX-F07**: Implemented slice — Canceling an edited amount, voucher, and note leaves the saved expense unchanged.
- **EX-F08**: Blocked — Repeated create needs a disposable expense.
- **EX-U01**: Blocked — CP is an admin, so the fund field is not locked. An ordinary creator is not provisioned.
- **EX-U02**: Blocked — No creator without a fund is provisioned.
- **EX-U03**: Implemented slice — The admin fund field is enabled, a tenant fund can be chosen, and cancel creates nothing. A foreign fund was not submitted.
- **EX-U04**: Review-blocked — Approved edit fund effects are not defined. Not executed.
- **EX-S01** through **EX-S05**, **EX-S08**: Review-blocked — Approval, reversal, and ledger rules are not defined. Not executed.
- **EX-S06**: Blocked — The status request is a Next server action and cannot be delayed from the browser.
- **EX-S07**: Blocked — CP has `expenses.approval`. A persona without it is not provisioned.
- **EX-D01**: Implemented slice — Cancel closes the dialog, the same expense can be reopened, and the expense, fund balance, and fund transactions stay unchanged.
- **EX-D02**, **EX-D03**: Review-blocked — Confirming delete can remove every transaction on the fund. Not executed.
- **EX-D04**: Blocked — A failed delete was not injected.
- **EX-D05**: Review-blocked — Dashboard deltas are not defined. Not executed.
- **EX-A01**: Implemented slice — Anonymous `/expenses` and `/reports/expenses` return to the same-host staff login. A subscriber session was not available.
- **EX-A02**: Blocked — Restricted permission personas are not provisioned.
- **EX-A03**: Implemented slice — CP and MK deny a foreign expense UUID and do not find that UUID. Delete, update, and status were not called.
- **EX-A04**: Review-blocked — Reseller and zone scope are not defined for this persona set.
- **EX-A05**: Implemented slice — Sign out, back, and reload stay on the login form. The other company does not list the expense UUID.
- **EX-R01**, **EX-R02**: Blocked — Delayed and failed responses were not injected.
- **EX-R03**: Blocked — The presentation matrix was not executed.

## Findings

- Public expense identity is the UUID in `id`. `expense_id` is the display ID, such as `EXP-001`.
- The list sends `staff_id`. `app/Services/Filters/Expenses/ExpenseBy.php` applies `expense_by`. A second staff id still returns the unfiltered page.
- The expense type named `salary` is translated with `t("salary")`. That key is an object, so the dropdown option reads `key 'salary (en)' returned an object instead of string.` The filter still selects it when it is the only search result.
- CP currently has one expense page, so page 2 and the later-page filter did not run.
- Report totals on screen are the API `reports` figures. They are not an independent sum of stored minor units.
