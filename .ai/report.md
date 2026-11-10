Thermal receipt PDFs now carry the viewer preference `PrintScaling: None`. Bills printed from a PC through the 58mm printer driver came out the wrong size in both Basic and Advanced modes. The PDF page is 48mm wide; without the preference a PDF viewer fits that page to whatever paper the driver reports, which rescales the strip.

## Frontend

- `components/invoices/invoice-print-dialog.tsx`: the PDF is created by `createThermalPdf`, which sets the preference. Page size, capture, and receipt layout are unchanged.
- `tests/unit/invoices/invoice-print-dialog.test.ts`: the generated PDF contains `/PrintScaling /None` and keeps its 48mm width.

## Checks

- `vitest run tests/unit/invoices tests/unit/settings` passed (16 files, 60 tests).
- `tsc --noEmit` passed.

Not verified: physical printer output, and whether the PDF viewer in use honours the preference.

## Unrelated

None in the working tree.
