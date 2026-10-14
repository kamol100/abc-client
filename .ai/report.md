## Summary

After a valid bulk import, the Import button keeps spinning for about 10 seconds, then the dialog closes and the import client table reloads.

## Files changed

- `components/import-client/import-client-bulk-dialog.tsx`: passes a 10 second submit hold.
- `components/import-client/import-client-table.tsx`: clears the selection and refetches the list when the dialog closes after import.
- `components/form-wrapper/form-builder.tsx` and `components/form-wrapper/form-wrapper.tsx`: optional `submitHoldMs` keeps the submit button in a loading state, then closes. Other forms are unchanged.

## Behavior

The spinner starts when the form submits. If the request finishes sooner than 10 seconds, the button keeps spinning until that time is up, then the dialog closes and the table refetches. If the request fails, the spinner stops and the dialog stays open. Cancel closes immediately.

## Tests

`scripts/ai/typecheck` passed.

The import page redirected to `/admin` because there is no signed-in session. The spinner, close, and table refresh were not exercised in the browser.

## Left untouched

No other working-tree changes.
