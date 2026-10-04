## Summary

The sidebar logo stacks the company name under the mark when the sidebar is expanded, and hides the name when it is collapsed. The sidebar header is fixed at the same height as the top navbar (`h-16`, and `h-12` when collapsed) so the two bottom borders line up.

## Files Changed

- `components/logo.tsx`
- `components/app-sidebar.tsx`
- `components/client-area/client-sidebar.tsx`
- `tests/unit/components/logo.test.tsx`

`components/ui/*` was not changed.

## Tests

`scripts/ai/frontend-check` — typecheck exit 0, Vitest 15 files, 56 tests, passed. Not checked in a browser.

## Risks

A long company name truncates. The impersonation badge is a second line under the name and makes the header taller.
