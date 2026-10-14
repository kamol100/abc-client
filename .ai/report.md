## Summary

`/archived-clients` lists soft-deleted clients with the same table, filters, and pagination as `/clients`. Each row can restore the client or permanently delete it. Restore asks whether the client returns as a company client or under a reseller.

## Files

- `app/(dashboard)/archived-clients/page.tsx`
- `components/archived-clients/archived-client-type.ts`
- `components/archived-clients/archived-client-table.tsx`
- `components/archived-clients/archived-client-column.tsx` (columns, restore dialog, permanent-delete dialog)
- `hooks/use-menu-items.ts` (sidebar item, permission `archived-clients.access`, clients feature)
- `public/lang/en.json`
- `public/lang/bn.json`

## Behavior

- The table calls `GET /archived-clients` and reuses the client search, network, zone, and status filters.
- Restore opens a dialog with “Restore as Own Client” and “Restore as Reseller Client”. The reseller dropdown uses `/dropdown-resellers/company`. If the archived client’s reseller is still in that list, it is preselected and the reseller option is selected. If it is not in the list, the form starts on own and does not submit the old id.
- Own mode posts `{ mode: "own" }`. Reseller mode posts `{ mode: "reseller", reseller_id }`. Success refreshes `archived-clients` and `clients`.
- Permanent delete asks for confirmation, then `DELETE /archived-clients/{uuid}`.
- Actions are hidden unless the user has `archived-clients.restore` or `archived-clients.delete`.

## Checks

`scripts/ai/frontend-check` passed: `tsc --noEmit` and Vitest (42 files, 178 tests). ESLint was not run; `npm run lint` is already broken in this repo.

The route is registered: opening `/archived-clients` redirects to `/admin?callbackUrl=%2Farchived-clients`. The login screen was shown, so the table, restore dialog, and delete dialog were not exercised in the browser.

## Limitation

The sidebar item stays hidden until the signed-in user has `archived-clients.access`. That permission is not on existing roles until it is assigned.

## Duplicate menu key

NOC and Subscription both used menu id `33`, so the sidebar and mobile bar rendered two children with the same React key. Subscription is now id `36`. NOC stays `33`.
