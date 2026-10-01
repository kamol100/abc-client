## Summary

The reseller edit form now asks `/dropdown-reseller-packages?reseller={uuid}` so an already assigned package is in the option list and can stay selected. Create still calls the dropdown without a reseller id.

## Files Changed

- `components/resellers/reseller-form.tsx` — passes the route id into the field schema on edit
- `components/resellers/reseller-form-schema.ts` — package dropdown api includes `reseller` when that id is present

## Tests

`scripts/ai/typecheck` — exit 0.

No reseller form unit test exists. ESLint was not run; `npm run lint` is already broken in this repo. The edit page redirected the Cursor browser to `/admin` because that session is not logged in, so the selected package chip was not confirmed in the browser.

## Security

The form sends the reseller uuid already used by the edit route. It does not send `company_id`. The API decides which packages that uuid may see.

## Risks

The package chip appears only after the API change is running. A company admin editing `a2e03479-e7b5-40ff-aff9-4f341aa6d696` should see package `20Mb` (id 6) selected.

## Git Diff

Branch `master`. The working tree still contains the earlier package-parent UI removal in `components/packages/`, language files, and the previous report. Those edits are not part of this dropdown fix.
