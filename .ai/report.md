## Summary

The raw MikroTik response heading now includes the number of result rows shown in the block below it.

## Frontend

- `MikrotikCommandTable` passes `rows.length` into `mikrotik_command.result.raw_title`.
- English: `Raw Response ({{count}})`. Bangla: `র' রেসপন্স ({{count}})`.
- The count is the same row set rendered in the result table: one row per array item, object field, or single value.

## Browser

The count appears only after a command returns data. That needs a signed-in session and a live MikroTik network, so it was not exercised in the browser.

## Checks

No typecheck or unit run. The change is a translation argument on an existing heading.

## Unrelated

Not inspected beyond these three files.
