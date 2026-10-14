## Summary

The calendar icon stays for a single date and hides once a date range is selected, so the range text has the full field width.

## Files

- `components/form/DatePicker.tsx`
- `tests/unit/form/date-picker-display.test.ts`
- `tests/unit/form/date-picker-icon.test.tsx`

## Behavior

- `hide_calendar_icon_on_date_range` defaults to `true`. A range is two different days. A single day, including a range that only has a start date, still shows the icon.
- `hide_calendar_icon_on_date_range={false}` keeps the icon in both modes.
- The label truncates inside the field, so a long range stays within the button. The expense date filter uses this picker in range mode, so it gets the default.

## Checks

`npx vitest run tests/unit/form/date-picker-icon.test.tsx tests/unit/form/date-picker-display.test.ts tests/unit/form/date-picker-clear.test.tsx` passed: 15 tests.

## Browser

Not rechecked on the signed-in expenses page. Icon visibility is covered by the unit test.
