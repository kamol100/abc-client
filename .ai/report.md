## Summary

Invoice rows now have a view action that opens the selected invoice in a dialog. The dialog follows the reference invoice layout and prints only that invoice through the browser print dialog. The invoice header uses the same company logo as the sidebar (`profile.company.logo` or the reseller logo). The company name stays in the Merchant block. If the logo file fails to load, the name is shown instead of a broken image.

## Cause

The row actions could pay or print a thermal receipt, but there was no on-page view of the full invoice, its note, or a page-sized print.

## Files

- `components/invoices/invoice-row-actions.tsx`
- `components/invoices/invoice-view-dialog.tsx`
- `components/invoices/invoice-view-document.tsx`
- `components/invoices/invoice-view-model.ts`
- `components/my-dialog.tsx`
- `app/globals.css`
- `public/lang/en.json`
- `public/lang/bn.json`
- `tests/unit/invoices/invoice-view-model.test.ts`
- `tests/unit/invoices/invoice-view-document.test.tsx`
- `tests/unit/invoices/invoice-row-actions-view.test.tsx`

## Checks

- `npx tsc --noEmit`: passed.
- `npx vitest run` on the three new invoice view tests: 7 passed.
- Browser: opened `http://127.0.0.1:3000/invoices` while signed in. The invoice table stayed on its loading skeleton, so the view button was not clicked in the browser.

## Git

Uncommitted. Only the files listed above.
