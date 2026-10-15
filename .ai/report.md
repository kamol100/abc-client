## Summary

The client details phone row now shows the same WhatsApp icon as the clients table.

## Files

- `components/clients/client-whatsapp-link.tsx`
- `components/clients/basic-view.tsx`
- `components/clients/client-name-phone-cell.tsx`
- `tests/unit/clients/client-name-phone-cell.test.tsx`

## Behavior

On the client details card, the phone number stays a call link, and a green WhatsApp icon sits beside it. The icon opens `https://wa.me/` for that number. The table cell uses the same link component.

## Checks

`npx vitest run tests/unit/clients/client-name-phone-cell.test.tsx` — 4 passed, including the details phone row. Linter reports no issues on the edited files.

## Browser

Opened `http://127.0.0.1:3000/clients` while signed in. The clients table stayed on skeleton rows, so the details page could not be opened.

## Left untouched

`components/clients/client-online-status-cell.tsx` and `components/import-client/import-client-bulk-dialog.tsx` were already modified and were not changed for this task.
