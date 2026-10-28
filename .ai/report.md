## Summary

The SMS Templates toolbar now has an Import button immediately before the column hide/show control. Users who can create templates can click it to copy missing templates from company 1 into the current company.

## Cause

The list page had no way to call the existing import action. That action already lives on `POST /sms-templates` when the body is `{ "message": "import" }`, which runs `SmsTemplateController::import()` and copies `sms_templates` rows where `company_id` is 1 and `reseller_id` is null. Existing `template_type` values are skipped.

## Files

- `components/sms-templates/sms-template-table.tsx`
- `public/lang/en.json`
- `public/lang/bn.json`

## Checks

- `scripts/ai/typecheck`: passed (`scripts/ai/frontend-check` reached the test step).
- `scripts/ai/test`: 411 passed. Four files failed and are unrelated to this change: `reseller-client-table.test.tsx` (next-auth module), `client-map-rows.test.ts` (empty suite), `reseller-client-filter-schema.test.ts`, `pay-content.test.tsx`.
- Browser: opened `http://localhost:3000/sms-templates`, which redirected to the admin login. The click path was not exercised because filling the password was blocked.

## Git

Uncommitted. Only the three files above.
