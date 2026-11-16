# EXPENSE-001 browser suite

Read the expense ticket and `tests/e2e/AGENTS.md` before extending these tests.

```sh
npm run test:e2e:expenses
E2E_TENANT=mk npm run test:e2e:expenses
```

`npm run test:e2e` discovers `playwright.expenses.config.ts` with the other feature suites. Company tests default to CP. MK is the other company. Credentials come from the ignored tenant env file. Login uses `http://cp.isp.test/admin` or `http://mk.isp.test/admin`.

## Implemented scope

30 checks cover list identity and report figures, expense ID / voucher / amount search, status, zone, fund, type, date, and combined filters, pagination bounds, the report page, create validation, cancel, edit hydration, over-length rejection, fund-choice cancel, delete cancel, anonymous routes, foreign UUID denial, and logout.

The staff filter check is an expected failure. The screen sends `staff_id`, and `ExpenseBy` reads `expense_by`, so another staff is not isolated. See [implementation status](../specifications/expenses/IMPLEMENTATION.md).

No expense is created, approved, edited, or deleted. Page size is not changed.
