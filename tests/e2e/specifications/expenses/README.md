# Expense test workspace

Start with [EXPENSE-001](EXPENSE-001-expense-management.md). Partial browser coverage is recorded in [IMPLEMENTATION.md](IMPLEMENTATION.md). Financial approval, confirmed deletion, and restricted personas remain unimplemented.

Workflow: investigate → specify → review → implement → verify. Scope includes staff expense CRUD, approval, fund effects, and expense report entry point. Expense-type CRUD and salaries are separate features.

Executable checks live under `tests/e2e/expenses/`: `list.spec.ts`, `forms.spec.ts`, `actions.spec.ts`, and `access.spec.ts`. Approval and fund-integrity scenarios are not executable yet.
