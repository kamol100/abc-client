## Summary

Ticket lists and detail views show the prefixed sequence id (`TKT1`) from `ticket_code`. General settings includes a Ticket ID Prefix that defaults to `TKT`.

The route props still named `ticketId` carry the ticket UUID (`id` in the API). They are not the removed database column.

## Files

- `components/tickets/ticket-type.ts` — `ticket_code`
- `components/tickets/ticket-column.tsx`, `ticket-view.tsx`
- `components/client-area/tickets/client-ticket-columns.tsx`, `client-ticket-view.tsx`
- `components/settings/settings-form-schema.ts`
- `components/settings/settings-type.ts`
- `public/lang/en.json`, `public/lang/bn.json`
- `tests/unit/settings/expense-id-prefix.test.ts`

## Checks

`npx vitest run tests/unit/settings/expense-id-prefix.test.ts` passed (7 tests). `scripts/ai/typecheck` passed.

The admin app was not open in this session, and the ticket-code migration has not been applied to the local API database, so the live ticket list was not exercised. After that migration and a deploy of this client, the Ticket ID column and ticket heading show `TKT1`, and General settings shows Ticket ID Prefix beside the other prefixes.
