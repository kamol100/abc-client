## Summary

`/mikrotik-sync` is the unified MikroTik import and re-sync screen. It talks only to the new API. The old `/import-client` and `/re-sync` pages, components, and menu entries are still available. This replaces the previous report about the MikroTik command raw-response count.

## Frontend

Created:

- `app/(dashboard)/mikrotik-sync/page.tsx`
- `app/(dashboard)/mikrotik-sync/import/[id]/page.tsx`
- `components/mikrotik-sync/mikrotik-sync-table.tsx`
- `components/mikrotik-sync/mikrotik-sync-column.tsx`
- `components/mikrotik-sync/mikrotik-sync-form.tsx`
- `components/mikrotik-sync/mikrotik-sync-form-schema.ts`
- `components/mikrotik-sync/mikrotik-sync-filter-schema.ts`
- `components/mikrotik-sync/mikrotik-sync-type.ts`
- `components/mikrotik-sync/mikrotik-sync-bulk-dialog.tsx`
- `components/mikrotik-sync/mikrotik-sync-import-form.tsx`
- `components/mikrotik-sync/mikrotik-sync-import-error.tsx`

Modified:

- `hooks/use-menu-items.ts` adds a Network child at `/mikrotik-sync`, gated by `mikrotik-sync.access`
- `app/(dashboard)/dashboard-breadcrumb.tsx`
- `public/lang/en.json` and `public/lang/bn.json`
- `tests/unit/menu/menu-items.test.ts`

The table follows the re-sync layout: network load, resolve-all, match summary, and filters. Import selection, the bulk dialog, and the individual import page come from the import-client flow. Row ids are UUID strings. The screen does not use the old `routes`, `ipv6_routes`, `limit_bytes_*`, or `last_logged_out` fields.

Endpoints used: `mikrotik-sync`, `mikrotik-sync/load`, `mikrotik-sync/resolve-all`, `mikrotik-sync/bulk-import`, `mikrotik-sync/{id}`, `mikrotik-sync/{id}/import`, and `mikrotik-sync/{id}/resolve`.

## Checks

- `scripts/ai/typecheck`: passed.
- `npx vitest run tests/unit/menu/menu-items.test.ts`: 12 passed.
- The menu test's parent and flat URL lists were also aligned with the current menu. Payment gateways is its own item, and invoice children are invoices, payments, then invoice types. That order was already in the menu; the expectation was stale and blocked the new-link assertion.
- `npm run lint` was not run. This repo's ESLint config is already known to fail under Next 16.
- No browser check. The page needs a signed-in session and the new API.
- `scripts/ai/status`: branch `master`. The files listed above are the only working-tree changes. No staged changes.

## Safe to remove later

After users move to `/mikrotik-sync`:

- `components/import-client` and `components/re-sync`
- `app/(dashboard)/import-client` and `app/(dashboard)/re-sync`
- the old import and re-sync menu entries
- the `import_client` and `re_sync` translation keys, once nothing else references them

## Filter

The name, client, and profile boxes are one `any` search. It uses the same field as the client list (`name: "any"`, `watchForFilter`) and `MikrotikSync\Any`, which matches `name`, `client_in_app`, `client_in_mikrotik`, `profile`, `mikrotik_profile`, and `app_profile`. Dropdown filters stay. The toolbar uses two rows so the remaining fields are not clipped.

## Form descriptions

Sync explains that it loads MikroTik data and imports it into this app, and its button uses the import icon. All Sync explains that it updates the client package and status between MikroTik and the app, and its button uses the sync icon. Both strings are in English and Bangla.

## Remaining

- Old screens still call the old APIs.
- The new menu item stays hidden until the user has `mikrotik-sync.access`.
- Load is network-scoped, and individual import sends the selected package. Both match the new API, not the older import screen.
