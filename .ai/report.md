## Summary

The client IP ping buttons now use a `buttonVariant` prop. The default is `outline`.

## Cause

`ClientIpPingButton` accepted `buttonVariant` and never passed it to `MyButton`, so every button stayed hardcoded to outline.

## Files

- `components/clients/client-router-info.tsx`
- `components/clients/client-online-status-cell.tsx`
- `tests/unit/clients/client-router-info.test.tsx`

## Checks

`npx vitest run tests/unit/clients/client-router-info.test.tsx` — 6 passed.

## Browser

The client list was not opened. The test checks the default outline classes and a ghost override.
