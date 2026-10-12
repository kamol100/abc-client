## Summary

A fund transfer destination dropdown no longer includes the fund the transfer is started from.

## Files changed

- `components/fund-transactions/fund-transaction-form-schema.ts`: the transfer account dropdown requests `/dropdown-funds?filter={fund id}` so the current fund is excluded.
- `components/fund-transactions/fund-transaction-form.tsx`: passes the selected fund id into that field schema.

## Behavior

Choosing Transfer loads every other fund. The fund named at the top of the dialog is omitted. Other transaction types still hide that dropdown.

## Tests

No frontend test covers this form. The backend already excludes a fund when `dropdown.funds` receives `filter` as that fund’s id. The dialog was not exercised in the browser because the app is not running and the screen requires login.

## Left untouched

`components/import-client/import-client-table.tsx` and the untracked skill files in this working tree.
