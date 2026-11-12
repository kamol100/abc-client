# Expense test workspace

Start with [EXPENSE-001](EXPENSE-001-expense-management.md). Investigation complete; draft awaiting business review; no executable tests implemented.

Workflow: investigate → specify → review → implement → verify. Scope includes staff expense CRUD, approval, fund effects, and expense report entry point. Expense-type CRUD and salaries are separate features.

Proposed future specs under `tests/e2e/expenses/`: `list.spec.ts`, `create-edit.spec.ts`, `approval.spec.ts`, `fund-integrity.spec.ts`, `access.spec.ts`. Use scenario IDs in test titles and link execution evidence back to the ticket. These are proposed files only.
