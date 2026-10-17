## Summary

The range border override never reached the day button. Tailwind treats `_` in an arbitrary variant as a space, so `rdp-day_button` became the selector `.rdp-day button` and missed `.rdp-day_button`.

Start, middle, and end days in a multi-day range now set that button border to `2px solid transparent`, which replaces react-day-picker’s `2px solid blue`. The highlight stays. A single selected day still uses the blue selected border.

## Files

- `components/form/DatePicker.tsx` — range cells target the day `button`
- `tests/unit/form/date-picker-range.test.tsx` — border class and range attributes

## Checks

Date picker range tests passed (1 file / 8 tests). The generated rule is `button { border: 2px solid transparent !important }`.

The invoice page is behind the login screen, so the live calendar was not reopened.

## Assumptions

The blue line is `--rdp-selected-border` from `react-day-picker/style.css`.
