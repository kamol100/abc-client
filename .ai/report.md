## Summary

The Agent Transaction List at `/agent-transactions` follows the Fund Transaction List. It loads `GET agent-transactions`, paginates, and filters by date, agent, and transaction type. Columns are serial, date, agent, type, amount, current commission balance, and description. Commission and deposit amounts are green; withdrawals are red. Add goes to `/agents`, where a transaction is created for one agent. The agent-row dialog still lists only that agent and hides the agent filter, agent columns, and add button.

## Files Changed

- `app/(dashboard)/agent-transactions/page.tsx`
- `components/agent-transactions/agent-transaction-table.tsx`
- `components/agent-transactions/agent-transaction-column.tsx`
- `components/agent-transactions/agent-transaction-filter-schema.ts`
- `components/agent-transactions/agent-transaction-type.ts` — optional `agent` on the row
- `components/agent-transactions/agent-transaction-form.tsx` — also refreshes the company list
- `components/agents/agent-column.tsx` — dialog table flags
- `hooks/use-menu-items.ts` — Resellers group includes `agent-transactions.access`
- `app/(dashboard)/dashboard-breadcrumb.tsx` — `/agents` and `/agent-transactions`
- `public/lang/en.json` and `public/lang/bn.json` — menu title, filter, agent, and balance labels
- `tests/unit/agent-transactions/agent-transaction-column.test.ts`

Fund transaction files were not changed. The commission form files and `tests/unit/agents/agent-column.test.tsx` were already in the working tree.

## Tests

`scripts/ai/frontend-check` — typecheck exit 0, then Vitest 14 files, 53 tests, passed.

Opening `/agent-transactions` while signed out redirects to `/admin?callbackUrl=%2Fagent-transactions`. The local seeded super admin login was rejected (`CredentialsSignin`), so the signed-in table, menu click, filters, pagination, and dark mode were not exercised in the browser. Loading, empty, and error states use the same `DataTable` path as Fund Transactions.

## Security

The page does not send `company_id`. The agent filter uses `/dropdown-agents`. Create stays on the agent row and still requires `agent-transactions.create`.

## Risks

The sidebar item stays hidden until `agent-transactions.access` exists on the role. Balance is the agent's current commission balance from the API, repeated on each of that agent's rows.
