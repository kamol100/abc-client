## Summary

Thermal receipt PDFs are now always portrait pages at least 60mm tall, in both Basic and Advanced modes. Short receipts used to become landscape pages (Advanced) or exactly square 48×48mm pages (Basic). Print drivers auto-rotate those, and the slip comes out blank. Tall receipts were already portrait and printed.

## Frontend

- `components/invoices/invoice-print-dialog.tsx`: every captured page is padded with white to at least 480 dots (60mm), and jsPDF pages are always created as portrait. Removed the landscape branch, the Basic-only square padding, and the 20mm stretch.
- `tests/unit/invoices/invoice-print-dialog.test.ts`: page height rule.

## Browser

On `vp.isp.test`, the real Print button was instrumented:

- Captured bitmaps always had ink: desktop, 390px phone viewport, dark theme, default and 12px/400 fonts. The PDF image is plain RGB with no soft mask.
- Before: small Basic slip was a 48×48mm page; Advanced at 12px measured 377px tall, which made a landscape page.
- After: default Basic 48×63mm, small Basic 48×60mm, a short reseller invoice 48×60mm, all portrait. Repeated printing without refresh gave identical output.

Not verified: physical printer output, Advanced mode end to end (saved settings were left on Basic; it shares the same page code), and multi-page receipts (no long invoice in local data).

## Checks

- `npx vitest run tests/unit/invoices/` passed (12 files, 47 tests).
- `scripts/ai/typecheck` passed.

## Unrelated

None in the working tree.
