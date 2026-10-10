## Summary

The plan feature dialog kept the first feature selection it rendered. After a save, reopening it could show the old checkboxes, and saving again sent that old selection back to the API.

## Files changed

- `components/subscription/plan-feature-matrix.tsx`
- `tests/unit/subscription/plan-feature-matrix.test.tsx`

## Behavior

While the dialog is closed, the selection follows the latest plan features from the list. Save writes the response into the subscription-plans query immediately, then the list refetches. The feature catalog request uses `features?all=1`, so a short page size cannot hide features from the dialog. The checkbox label is a sibling of the checkbox, so a click on the name toggles once.

## Tests

The new unit test failed before the fix: after the plan features changed, reopening the dialog still showed the feature unchecked. `npx vitest run tests/unit/subscription/plan-feature-matrix.test.tsx` then passed (2 tests). `scripts/ai/typecheck` passed.

The subscription plans page was not opened in the browser, so the logged-in toggle was not clicked there.

## Left untouched

Other subscription UI already in the working tree.
