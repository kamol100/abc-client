## Summary

PPPoE ID and password now show their translated required messages instead of the English word "Required".

## Cause

An untouched field is `undefined`. `z.string().min(1)` only uses the custom message for an empty string, so a missing value fell through to Zod’s default `"Required"`. The form translates that string as a key, and `"Required"` has no translation.

## Files

- `components/clients/client-type.ts`
- `tests/unit/clients/client-payload.test.ts`

## Checks

`npx vitest run tests/unit/clients/client-payload.test.ts` — 8 passed.

## Browser

The create form was not submitted in the browser. The test covers a missing username and an empty password.
