## Summary

The client table termination date now shows as `DD-MMM-YY` plus the calendar-day gap from today. A future date reads `05-Oct-26 (2-days)`. Today reads `03-Oct-26 (0-days)`. A past date reads `01-Oct-26 (expired 2-days)` and uses the destructive text color. A missing date still shows `—`.

The count uses calendar days. An ISO value such as `2026-10-05T00:00:00.000Z` stays 5 Oct, so a timezone offset cannot move it to the previous day.

## Files Changed

Created:

- `components/clients/client-termination-date.ts`
- `tests/unit/clients/client-termination-date.test.ts`
- `tests/unit/clients/client-package-cell.test.tsx`

Modified:

- `components/clients/client-package-cell.tsx`
- `public/lang/en.json`
- `public/lang/bn.json`

Unrelated working-tree changes were left untouched: reseller recharge, reseller form, form builder, label, and their tests.

## Tests

`npx vitest run tests/unit/clients/client-termination-date.test.ts tests/unit/clients/client-package-cell.test.tsx` — 10 tests passed.

`scripts/ai/typecheck` — exit 0.

The clients page was not opened in a browser. No dev server was running, and the table needs a signed-in user. The cell test renders the future, today, expired, and empty cases, including the destructive class on an expired date.

## Security

Display only. The date still comes from the client list payload. No new request or tenant field.

## Risks

English month abbreviations stay `Oct` even in Bangla; only the day suffix is translated. Two-digit years follow date-fns' window around the current year, which matches near-term ISP dates such as `26` → 2026.
