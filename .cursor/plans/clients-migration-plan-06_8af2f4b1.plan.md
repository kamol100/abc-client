---
name: clients-migration-plan-06
overview: "Plan-06 adds two remaining high-value client interactions with minimal blast radius: Change Package (dialog + mutation) and optional Mikrotik delete flag on client deletion, all i18n-safe and strictly typed."
todos:
  - id: client-change-package-types
    content: Add `ClientChangePackageSchema` + `ClientChangePackagePayload` to `components/clients/client-type.ts`
    status: in_progress
  - id: client-change-package-dialog
    content: Create `components/clients/client-change-package-dialog.tsx` using DialogWrapper + dropdown + PUT `clients-change-package/:id` mutation
    status: pending
  - id: client-row-actions-change-package
    content: Add Change Package item to `components/clients/client-row-actions.tsx` and wire dialog
    status: pending
  - id: client-delete-mikrotik-toggle
    content: Add delete-from-mikrotik Switch to delete dialog and include query param when enabled
    status: pending
  - id: i18n-client-change-package-delete
    content: Add change-package + mikrotik-delete keys to both `public/lang/en.json` and `bn.json` with strict parity
    status: pending
isProject: false
---

# plan-06 — Row actions parity: Change Package + optional Mikrotik delete

## Goal

Close two important interaction gaps still present compared to `isp-client`:

- **Change package** from the list/view context
- **Conditional delete from Mikrotik** (toggle a query param during delete)

This plan stays focused on Clients only and avoids invoices/tickets/SMS integrations.

## Source behavior to mirror (isp-client)

- Change package calls:
  - `PUT /api/v1/clients-change-package/{id}`
- Delete supports optional query param:
  - `DELETE /api/v1/clients/{id}?mikrotik_delete=true`

```140:149:C:\wamp64\www\isp-client\components\clients\client-actions.tsx
<DeleteItem url={`/api/v1/clients/${client.id}`} conditionalParams={{"mikrotik_delete": true}} ... />
```

## Scope

### In scope

- Add `ClientChangePackageDialog` (shadcn dialog + form + mutation)
- Add a **Change package** action to `client-row-actions.tsx` and (optionally) to the `/clients/view/[id]` header
- Add an optional **"Delete from Mikrotik"** switch to the delete confirmation dialog and include the query param when enabled
- Add required i18n keys in **both** `en.json` and `bn.json` with strict parity

### Out of scope (defer)

- Full “actions menu” parity (Pay/SMS/Tickets/Invoice history)
- Permissions gating of each action item (we’ll do once you confirm the permission naming scheme for Clients)

## Implementation plan

### 1) Add a small Change Package schema/type

Update `**[C:\wamp64\www\shadcn-isp-client\components\clients\client-type.ts](C:\wamp64\www\shadcn-isp-client\components\clients\client-type.ts)`**:

- Add:
  - `ClientChangePackageSchema = z.object({ package_id: z.coerce.number().min(1) })`
  - `type ClientChangePackagePayload = z.output<typeof ClientChangePackageSchema>`
- Use `i18n.t("client.change_package.package.errors.required")` for required/min message if needed.

### 2) Implement `ClientChangePackageDialog`

Create `**components/clients/client-change-package-dialog.tsx`**.

- Props:
  - `{ clientId: number; currentPackageName?: string | null; trigger?: ReactNode }`
- UI:
  - Use `DialogWrapper`
  - Use `FormWrapper`/`FormBuilder` pattern already in this repo:
    - One dropdown field: `package_id`
    - `api: "/dropdown-network-packages"`
    - label/placeholder via `t("client.change_package.package.label")` / `t("client.change_package.package.placeholder")`
- Submit:
  - Use `useApiMutation<unknown, ClientChangePackagePayload>`
  - `url: /clients-change-package/{clientId}`
  - `method: "PUT"`
  - `invalidateKeys: "clients"`
  - toast: `successMessage: "client.change_package.success"`

### 3) Wire Change Package into row actions (and optionally view)

Update `**components/clients/client-row-actions.tsx`**:

- Add a menu item `client.actions.change_package` (icon e.g. `Package` or `RefreshCw`).
- Clicking it opens `ClientChangePackageDialog`.

Optional (recommended): Update `**components/clients/client-view.tsx**` header to include a small ActionButton that opens the same dialog.

### 4) Add “Delete from Mikrotik” option

Update `**components/clients/client-row-actions.tsx**` delete dialog section:

- Add a boolean state `deleteFromMikrotik` default false.
- Add a `Switch` + label inside the dialog body.
- When deleting, call the mutation with:
  - `url: /clients/{id}?mikrotik_delete=true` when enabled
  - otherwise `url: /clients/{id}`

Because `useApiMutation` takes a static `url`, implement delete via a small wrapper that calls `useFetch` directly, or instantiate *two* mutations (one per url) and call the appropriate one. Prefer **a small `deleteClient(url)` helper** using `useFetch` to keep it DRY.

### 5) i18n updates (strict en/bn parity)

Update both:

- `public/lang/en.json`
- `public/lang/bn.json`

Add keys:

- `client.actions.change_package`
- `client.change_package.title`
- `client.change_package.package.label`
- `client.change_package.package.placeholder`
- `client.change_package.success`
- `client.delete_from_mikrotik.label`
- `client.delete_from_mikrotik.help`

## Verification checklist

- Change package dialog opens from row actions, submits successfully, and list refreshes.
- Delete dialog includes Mikrotik toggle; when enabled it sends `mikrotik_delete=true`.
- No hardcoded user-facing strings added; all new keys exist in both languages.
- No `any` introduced; payload types are strict.

## Next plan (preview)

- **plan-07**: Expand action menu parity (invoice history/pay, tickets, SMS) with clear boundaries and feature-stubs where needed.

