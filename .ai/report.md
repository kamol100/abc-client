## Summary

The `/subscription` sidebar item is hidden when the signed-in profile has a reseller.

## Files changed

- `hooks/use-menu-items.ts`: the always-visible subscription item sets `hideForReseller`. `useMenuItems` skips those items when `profile.reseller` is set.

## Behavior

Company users still see the subscription link. Reseller users do not. The permission-gated subscription admin menu is unchanged.

## Tests

No diagnostics on the edited file. The sidebar was not checked in the browser because the app requires login.

## Left untouched

`components/subscription/my-subscription.tsx`, `next.config.ts`.
