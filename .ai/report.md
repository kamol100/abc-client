## Summary

The open choice menu marks the current selection with an accent background and a check.

## Frontend

- `ChoiceMenu` takes `value`. The matching item uses `bg-accent` and a visible check. The other checks stay in the row so the menu width does not jump, and they are hidden.
- Ticket status passes the current status. Assignee passes the current staff id, or an empty value for Not assigned.

## Checks

- `npx vitest run tests/unit/tickets/ticket-status-select.test.tsx` passed (7 tests).

## Browser

On `http://vp.isp.test/tickets`, the Open status item is checked and highlighted. The assignee menu checks `vp` and leaves the other staff unchecked. No ticket was changed.
