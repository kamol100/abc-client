## Summary

Clicking the client ping button opens a dialog and lists each router reply. The dialog has Ping again and Cancel.

## Frontend

- The radio button still sits next to the device-login button. A valid IP opens the dialog and calls `GET /client-ping/{client}?ip=`.
- The table columns are S/L, IP Address, Time, Size, TTL, and Status. OK is green. A timeout row has no time, size, or TTL.
- The footer shows Pinged, OK, Timeout, and LOSS. LOSS is red. Ping again is the icon button. Cancel closes the dialog and drops a reply that is still in flight.
- The first ping shows placeholder rows. Ping again keeps the last replies on screen until the new ones arrive.
- An invalid IP still disables both buttons and does not call the API.
- English and Bangla strings are under `client.basic_view.ping_*`.

## Checks

- `npx vitest run tests/unit/clients/client-router-info.test.tsx tests/unit/clients/client-view-ping-button.test.tsx tests/unit/clients/client-online-status-cell.test.tsx` passed (10 tests).
- `scripts/ai/typecheck` passed.
- `public/lang/en.json` and `public/lang/bn.json` both parse.
- `scripts/ai/test` finished with 18 failures in other files: date pickers, menu order, pay page, client account, column visibility, reseller filter, and an empty map test file. None of those files were changed.

## Browser

`http://127.0.0.1:3000` redirects and `http://vp.isp.test/admin` returns 403 without a session. The dialog was not opened in a signed-in browser. The click, table, ping again, and cancel behavior is covered by the unit test above.

## Unrelated

The working tree was clean before this change. No unrelated files were left modified.
