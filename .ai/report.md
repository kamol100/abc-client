## Summary

The client basic view now has a copy-phone button immediately after the WhatsApp icon. It uses the same button as the client list: it copies the trimmed phone number and shows the existing success toast.

## Files

- `components/clients/client-copy-phone-button.tsx`
- `components/clients/basic-view.tsx`
- `components/clients/client-name-phone-cell.tsx`
- `tests/unit/clients/client-name-phone-cell.test.tsx`

## Checks

`npx vitest run tests/unit/clients/client-name-phone-cell.test.tsx` passed (8 tests). `scripts/ai/typecheck` passed.

The client detail page was not opened in the browser because it requires a signed-in staff session. The basic-view test covers the button after WhatsApp and the copied phone value.

## Git

Uncommitted.
