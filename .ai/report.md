## Summary

General settings now include a Payment Deadline dropdown, days 01–30. When the company has not saved one, the form and new clients use day 11.

## Frontend

- The field is on Settings → General, after the ticket prefix. It saves through the existing company settings request.
- The new-client form and the sync-client import form use that saved day as the payment deadline default.
- English and Bangla labels are `settings.fields.payment_deadline`.

## Checks

- `npx vitest run tests/unit/settings/payment-deadline.test.ts tests/unit/settings/expense-id-prefix.test.ts tests/unit/clients/client-form-schema.test.ts` passed (14 tests).
- `scripts/ai/typecheck` passed.

## Browser

The general settings page at `http://vp.isp.test/settings/general` did not load in the browser (the tab stayed blank), so the dropdown was not clicked in the app.

## Unrelated working tree

Left in place: the earlier move of Reseller Clients from Reports into the Resellers menu (`hooks/use-menu-items.ts`, `tests/unit/menu/menu-items.test.ts`).
