## Summary

Receipt PDFs were a gray, low-resolution photo of an 80mm layout. The GOOJPRT PT-210 prints a 58mm roll on a 48mm, 384-dot, 203 dpi head, so that image was scaled down and dithered until the type was hard to read.

## Frontend

- `components/invoices/invoice-receipt.tsx` is a 384px black-on-white ticket: bold Hind Siliguri, 28px body, 36px company name and total, stacked lines instead of an 11px five-column grid. The support phone line is unchanged. The client block shows `pppoe_username` on the next line as “pppoe ID” when the invoice client includes it. Each item under the Item/Amount header is one 24px line: `INV8: Internet bill 1x400` and the amount, without an Invoice ID label.
- `components/invoices/invoice-print-dialog.tsx` builds a 48mm-wide PDF at 384 dots, snaps the bitmap to black and white, and sizes each page to the receipt. jsPDF no longer swaps a short strip into a narrow page.
- `app/globals.css` sets the receipt font to Hind Siliguri. The Tailwind arbitrary font stack did not compile.
- `invoice.print.paper_hint` in `en.json` and `bn.json` says to print the PDF at actual size (100%).

## Checks

- `scripts/ai/typecheck` passed.
- `npx vitest run tests/unit/invoices/invoice-receipt.test.tsx` passed (1 test).
- `scripts/ai/test` still fails in unrelated suites (date picker, pay content, reseller client). Those failures were already present.

## Browser

Checked the receipt classes on `http://127.0.0.1:3000`: Hind Siliguri, 36px / 700, black on white, 384px wide. Bengali sample text was legible. Could not open the print dialog or send a job to the PT-210; the session is on the login page.

## Security

No tenant or permission change. The receipt still does not send `company_id`.
