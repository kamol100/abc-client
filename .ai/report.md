## Summary

The dashboard shows one subscription alert: a yellow grace-period banner, or a red expired banner when the subscription is already expired. Closing it hides that alert until the next calendar day and does not change access.

## Files changed

- `components/subscription/subscription-banner.tsx`
- `components/dashboard/dashboard-overview.tsx`
- `app/(dashboard)/layout.tsx`
- `types/app.ts`
- `app/globals.css`
- `tailwind.config.ts`
- `public/lang/en.json`
- `public/lang/bn.json`
- `tests/unit/subscription/subscription-banner.test.tsx`

## Behavior

The banner reads the subscription already loaded with user settings. It appears only when `state` is `grace` or `expired`. Expired wins. The message uses the plan name, `days_remaining`, and `due_amount` from that payload. `days_remaining` is `0` on the last grace day, so the copy says the plan ends today.

The message is one line. It scrolls right to left only when it does not fit, and it stays still when `prefers-reduced-motion` is set. View opens `/subscription`. Close stores the company id, alert type, and the server calendar day in `localStorage`. A grace dismissal does not hide a later expired alert.

## Tests

`scripts/ai/frontend-check` passed: TypeScript and 105 unit tests. The signed-in Full plan is `active` with `due_amount` 0, and the dashboard correctly showed no banner. Grace and expired banners were not exercised in the browser.

## Left untouched

`components/subscription/feature-permission-editor.tsx` and its unit test were already modified. `app/(dashboard)/layout.tsx` still logs `initialData`.
