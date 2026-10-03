## Summary

The agent row eye button uses the same `h-8` size as edit and delete, and the action row centers those buttons. It opens a dialog with that agent's transaction table. The table lists date, type, amount, and description from `GET agent-transactions/{agent id}`. The button is shown only when the user has `agent-transactions.show`.

## Files Changed

- `components/agents/agent-column.tsx` — `AgentActionsCell` with the dialog
- `components/agent-transactions/agent-transaction-type.ts`
- `components/agent-transactions/agent-transaction-column.tsx`
- `components/agent-transactions/agent-transaction-table.tsx`
- `public/lang/en.json` and `public/lang/bn.json` — `agent_transaction` keys

The agent balance column, `AgentRow.balance`, and the `agent.balance` translation keys were already in the working tree and were left in place.

## Tests

`scripts/ai/typecheck` — exit 0.

The agents page was not opened in a browser. No dev server was running, and the dialog needs a signed-in user with `agent-transactions.show`.

## Security

The dialog sends the agent UUID already returned by the agent list. It does not send `company_id`. The API enforces the company scope.

## Risks

Until `agent-transactions.show` exists on the role, the eye button stays hidden for non–Super Admin users.
