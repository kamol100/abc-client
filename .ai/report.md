## Summary

The subscription payment success notice now shows green text with a check mark.

## Files

- `components/subscription/my-subscription.tsx`

## Behavior

When `payment=success`, the notice uses green text and a light green background, with a check icon beside “Payment completed.” Cancel, failure, pending, and processing notices are unchanged.

## Checks

No new unit test. Linter reports no issues on the edited file.

## Browser

Opened `http://127.0.0.1:3000/subscription?payment=success` while signed in. The success notice shows a check mark and green text in light mode, and the same treatment in dark mode. The subscription body below the notice was still loading.

## Left untouched

No other files were changed.
