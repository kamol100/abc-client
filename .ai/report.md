## Summary

The invoice receipt prints the company support phone from user settings. The support line is shown only when `settings.support_phone` is present.

## Frontend

- The edit dialog and the profile details include Support Phone for a company. Reseller profile does not show it.
- English and Bangla labels are under `company_profile.support_phone`.
- The header menu still links to `/company-profile/{company uuid}`.

## Checks

- `scripts/ai/typecheck` passed earlier for the profile form.
- Vitest passed for `tests/unit/invoices/invoice-receipt.test.tsx` (4 tests).

## Browser

On `http://vp.isp.test/invoices`, the INV10 print preview shows `For support: 555555555`. The company phone on the receipt stays `22222222222`.

## Unrelated working tree

Left untouched: invoice print settings, menu, and breadcrumb changes already in the working tree. `en.json` and `bn.json` already had those translation edits; only the support phone keys were added.
