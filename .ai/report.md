## Summary

The login icon beside ping opens the client device address in a new browser tab at `http://<ip>:80`.

## Files

- `components/clients/client-router-info.tsx`
- `public/lang/en.json`
- `public/lang/bn.json`
- `tests/unit/clients/client-router-info.test.tsx`

## Behavior

Clicking the login button opens `http://10.10.10.102:80` when that is the router IP. Port 80 is fixed. The button stays disabled when the IP is missing or invalid, and that click does not call ping. The tooltip shows the address that will open.

## Checks

`npx vitest run tests/unit/clients/client-router-info.test.tsx tests/unit/clients/client-view-ping-button.test.tsx` — 6 passed.

## Browser

The clients table still stays on skeleton rows, so the new tab was not opened from the details page. The unit test checks the URL and the new-tab call.
