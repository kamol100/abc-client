## Summary

The client status switch still calls `PUT /client-status/{id}`. If the client is inactive and this month has no internet bill, the API returns a preview and the switch opens a bill dialog. The client becomes active only after that bill is generated.

## Frontend

- `components/clients/client-status-toggle.tsx` keeps the switch. Deactivation is unchanged. Activation without a current internet bill opens the dialog instead of flipping the switch.
- The dialog shows PPPoE username, name, package, and price, the generate date, the calculated adjust amount, remaining days, payment deadline (1–30), termination date, and a required note.
- The adjust amount starts as the API value. Editing it is marked Edited and is not overwritten. Submit sends that amount.
- A failed generate leaves the dialog open. Success closes it, toasts, and refreshes the client list.
- The missing-bill response does not toast. Other errors still do (`ignoreError` on `useApiMutation`).
- Copy is in `public/lang/en.json` and `public/lang/bn.json` under `client.activation`.

## Browser

No app server was running, and this screen needs a signed-in staff session, so the dialog was not clicked in a browser. Vitest covered opening the dialog, the 400 / 24-day preview, blocking submit without a note, an edited amount, a failed submit that keeps the dialog, and success that closes it and checks the switch.

## Checks

- `npx vitest run tests/unit/clients/client-activation.test.tsx`: 5 passed.
- `scripts/ai/typecheck` passed.

## Unrelated

Left untouched: the in-progress removal of client NID fields, and `tests/unit/expenses/`.
