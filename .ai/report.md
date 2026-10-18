## Summary

The phone copy fallback no longer calls the deprecated `document.execCommand` signature. It uses a local clipboard type for the same command on HTTP, and `navigator.clipboard.writeText` on a secure page.

## Files

- `components/clients/client-name-phone-cell.tsx`

## Checks

`tests/unit/clients/client-name-phone-cell.test.tsx` passed (7 tests). The deprecation diagnostic on the copy call is gone.
