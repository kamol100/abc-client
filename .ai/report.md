## Summary

The client list ping and device buttons now use the IP already loaded by online status, so that cell no longer requests router info for the same address.

## Cause

`ClientIpPingButton` always called `client-router-info`, even when `ClientOnlineStatusCell` already had `ip_address` from `client-online-status`.

## Files

- `components/clients/client-online-status-cell.tsx`
- `components/clients/client-router-info.tsx`
- `tests/unit/clients/client-router-info.test.tsx`

## Checks

`npx vitest run tests/unit/clients/client-router-info.test.tsx` — 7 passed.
`scripts/ai/typecheck` — passed.

## Browser

The clients list was not opened. No app session was running, so the skipped request was checked in the unit test: a provided IP pings and opens port 80 with zero `client-router-info` calls. The client detail view still loads router info when no IP is passed in.
