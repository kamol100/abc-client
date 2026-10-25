## Summary

Invoice notes are no longer capped at 500 characters. `invoices.note` is a MySQL `TEXT` column, so the create and edit form accepts a note of up to 65,535 UTF-8 bytes. A shorter Bengali or emoji note can still be rejected when its byte size exceeds that column.

## Files

- `components/invoices/invoice-type.ts`
- `components/invoices/invoice-form-schema.ts`
- `public/lang/en.json`
- `public/lang/bn.json`
- `tests/unit/invoices/invoice-note-limit.test.ts`

## Checks

`npx vitest run tests/unit/invoices/invoice-note-limit.test.ts` passed (4 tests). `scripts/ai/typecheck` passed.

`http://vp.isp.test/invoices/create` redirected to the admin login, so the note field was not submitted in the browser. The form uses `InvoiceFormSchema`, which the unit test covers.

## Git

Uncommitted. Left existing login, dashboard, pay, badge, and client-invoice edits in place. `en.json` and `bn.json` also contain those earlier translation keys.
