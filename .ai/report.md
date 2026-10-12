## Summary

Each feature on the subscription page is a soft success badge with the check icon from `MyBadge`.

## Files changed

- `components/subscription/my-subscription.tsx`: feature names render inside `MyBadge` (`type="success"`, `variant="soft"`, `size="sm"`). The success type supplies the check icon.

## Behavior

Features wrap in a row of badges. Loading and empty subscription states are unchanged.

## Tests

The editor reports no diagnostics on the edited file. The subscription page redirects to login, so the rendered badges were not checked in the browser.

## Left untouched

`next.config.ts` and the earlier host-proxy work.
