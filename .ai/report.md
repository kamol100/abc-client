## Summary

Invoice print settings now have Basic and Advanced modes. Basic prints the centered Genfive-style slip. Advanced keeps the existing receipt and its switches.

## Frontend

- Mode radios sit in the settings header. Basic is the default.
- Basic shows thank-you, amount in words, support number, and the shared typography controls. Advanced keeps the full switch list.
- The customized preview and the print dialog follow `mode`. Basic is captured as one thermal page so the border and type sizes stay intact.
- Basic slip: company, address, invoice id and time, client name, `id@phone`, Total Bill, Paid & Discount (underlined), Total Due, optional words, thank-you, and HELP line.
- English and Bangla strings are in `public/lang/en.json` and `public/lang/bn.json`.

## Checks

- `npx vitest run tests/unit/invoices/invoice-receipt.test.tsx tests/unit/settings/invoice-print-settings.test.tsx` passed (7 tests).
- `npx tsc --noEmit` passed.
- Signed in on `vp.isp.test` and checked the settings page. Basic preview matched the slip. Turning off thank-you removed it from the custom preview only. Advanced restored the existing receipt and the full switch list. Those toggles were not saved.

## Unrelated working tree

None. Branch `master` is even with `origin/master` aside from these edits.
