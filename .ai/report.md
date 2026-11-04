## Summary

The address chevron now sits against the truncated address ellipsis.

## Cause

The collapsed address row used a 2px gap, and the ChevronDown glyph sits inset inside its box, so the icon looked a little to the right of the "...".

## Frontend

- Collapsed address toggle uses no row gap and `-ml-1.5` so the chevron meets the ellipsis.
- Expanded address keeps a small gap so the icon does not cover the wrapped text.

## Checks

- `npx vitest run tests/unit/clients/client-zone-address-cell.test.tsx` passed (3 tests).

## Browser

On `http://vp.isp.test/clients`, Farhana Akter’s address shows `Dhanmondi, Dhaka...` with the chevron immediately after the ellipsis. Expanding and collapsing that address still works.

## Package update

Next.js is 16.4.5, which includes the Google font loader fix. The shadcn CLI is 4.23.0. Existing `components/ui` files were not regenerated, and Tailwind 3 / Zod 3 stayed in place. Cache Components was not turned on.

Also moved within the current major: React 19.3.1, `eslint-config-next` 16.4.5, and the in-range Radix, TanStack Query, React Hook Form, and related patches. Left on the current major: Tailwind, Zod, TypeScript, lucide-react, date-fns, i18next, react-i18next, TanStack Table, next-auth v5, react-day-picker, and Motion.

## Checks

- `npx next build` passed on Next.js 16.4.5 (Turbopack). TypeScript finished, 133 pages generated, and the `next/font/google` query error did not appear.
- `scripts/ai/test`: 18 failed, 537 passed. Failures match existing source/test drift (October 2026 date-picker labels while the calendar opens on November 2026, menu order, filter schema, QueryClient, `usePathname` mock). `react-day-picker` stayed at 9.14.0.

## Left untouched

- `components/clients/client-zone-address-cell.tsx` was already modified and was not part of this update.

## react-i18next lookup

`import { useTranslation } from "react-i18next"` in `components/clients/client-zone-address-cell.tsx` resolves. `react-i18next@15.7.4` is linked and ships `index.d.mts`. `tsc --noEmit --incremental false` reports no missing module, and the editor diagnostics for that file are clean. No source change.
