## Summary

The range hover preview was only cleared when a day was selected, Apply was clicked, or the popover closed. Moving the pointer off the calendar, or onto Apply, left the last hovered span painted.

Hover state is still separate from the selected day. Leaving the calendar, or entering the Apply area, clears only that preview. A finished start-and-end range stays highlighted. Apply still commits the selected day, and a completed range still submits immediately.

## Files

- `components/form/DatePicker.tsx` — clear the hover preview on calendar leave and on Apply
- `tests/unit/form/date-picker-range.test.tsx` — leave, Apply, in-calendar move, and completed range

## Checks

`scripts/ai/typecheck` passed. Date picker and filter date tests passed (6 files / 28 tests).

The invoice page is behind the login screen at `/admin?callbackUrl=/invoices`, so the live calendar was not hovered in the browser.

## Assumptions

Other range filters use the same picker, so they follow this hover-reset behavior too.

Unrelated working-tree changes were left as they were: form builder, form filter, invoice filter schema, language files, and the earlier date-picker tests.
