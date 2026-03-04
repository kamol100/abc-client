---
name: clients-migration-plan-03
overview: Plan-03 adds interactive Clients list parity (status toggle, row actions dropdown, session reset, delete) and introduces a safe edit page route using existing form hydration patterns. Online status + full view parity remain for later plans.
todos:
  - id: clients-edit-page
    content: Create `app/(dashboard)/clients/edit/[id]/page.tsx` with metadata and `ClientForm` edit hydration
    status: pending
  - id: client-status-toggle
    content: Add `components/clients/client-status-toggle.tsx` using `useApiMutation` (PUT client-status/:id) and integrate into `client-column.tsx`
    status: pending
  - id: client-session-reset-dialog
    content: Add `components/clients/client-session-reset-dialog.tsx` using `DialogWrapper` + `useApiMutation` (POST client-reset-session/:id)
    status: pending
  - id: client-row-actions
    content: Add `components/clients/client-row-actions.tsx` dropdown with Edit/Reset Session/Delete and use it in `client-column.tsx`
    status: pending
  - id: i18n-clients-interactions
    content: Add required keys (edit_title, status_updated, session_reset.*, actions.*, delete_confirmation) to both en.json and bn.json with strict parity
    status: pending
isProject: false
---

# plan-03 — Interactive list parity (status toggle + actions + session reset) + edit page route

## Goal

After plan-02’s read-only list parity, add the **interactive** parts of the Clients list from `isp-client` in a way that:

- Uses the migrated app’s standard primitives (`useApiMutation`, `DialogWrapper`, `DeleteModal`, shadcn UI)
- Avoids `any` and keeps strict typing
- Keeps i18n rules (no hardcoded user-facing strings; en/bn key parity)
- Avoids broken navigation by introducing a minimal `/clients/edit/[id]` route that leverages existing form hydration (`FormWrapper`)

## Scope

### In scope

- Add `/clients/edit/[id]` page that renders the existing `ClientForm` in edit mode (hydrated automatically).
- Replace the list’s **Status** badge column with an actual **toggle** that calls the backend (like `isp-client`’s `ClientStatus`).
- Replace the single Edit button in the **Actions** column with a **dropdown menu** including:
  - Edit
  - Reset session (confirm dialog + POST)
  - Delete (confirm dialog + DELETE)

### Out of scope (defer)

- Online status lazy fetch (`/client-online-status/:id`) — will need a new dependency (likely `react-intersection-observer`) and will be handled in the next plan.
- Full action menu parity (Pay/SMS/Tickets/Invoice history/Change package + conditional Mikrotik delete params).
- Client view route (`/clients/view/[id]`) and its widgets.

## Implementation plan

### 1) Add edit route (prevents 404 from list actions)

Create `**[C:\wamp64\www\shadcn-isp-client\app\(dashboard)\clients\edit\[id]\page.tsx](C:\wamp64\www\shadcn-isp-client\app\(dashboard)\clients\edit\[id]\page.tsx)`**.

- Use the same pattern as other dashboard pages:
  - `export const metadata = { title: t("client.edit_title") }` via `lib/i18n/server`.
- Render:
  - `<ClientForm mode="edit" api="/clients" method="PUT" data={{ id }} />`

This works because `FormWrapper` already supports edit hydration by `data.id` and `api`:

```133:161:C:\wamp64\www\shadcn-isp-client\components\form-wrapper\form-wrapper.tsx
const entityId = (data as { id?: string | number })?.id;
const shouldHydrate = mode === "edit" && !!entityId && !!api;
const detailUrl = api ? `${stripLeadingSlash(api)}/${entityId}` : "";
...
useApiQuery({ url: detailUrl, pagination: false, enabled: shouldHydrate })
```

### 2) Add a typed status toggle mutation component

Create `**components/clients/client-status-toggle.tsx**`.

- Props: `{ clientId: number; initialStatus: 0 | 1 }` (derive from `ClientRow`).
- UI: shadcn `Switch` (`components/ui/switch.tsx`) + loading indicator (disable while pending).
- Mutation:
  - `PUT /client-status/{clientId}` with payload `{ status: 0 | 1 }`
  - Use `useApiMutation<unknown, { status: 0 | 1 }>`
  - Invalidate `clients`
  - Toast success via `successMessage: "client.status_updated"` (new i18n key)

Then update `**[components/clients/client-column.tsx](C:\wamp64\www\shadcn-isp-client\components\clients\client-column.tsx)**`:

- Replace the current status badge cell with `<ClientStatusToggle ... />`.
- Keep a small badge/text fallback if you want to preserve readability; but the toggle is the source of truth.

### 3) Add session reset confirm dialog (no Flowbite)

Create `**components/clients/client-session-reset-dialog.tsx**`.

- Trigger: can be used inside dropdown actions.
- Use `DialogWrapper` (not Flowbite modal) + `ActionButton`.
- Mutation:
  - `POST /client-reset-session/{clientId}`
  - `useApiMutation` invalidate `clients`
  - toast success via `successMessage: "client.session_reset.success"`
- Dialog body shows a concise confirmation message using translations.

### 4) Add row actions dropdown

Create `**components/clients/client-row-actions.tsx**`.

- Use `components/ui/dropdown-menu`.
- Actions included now:
  - **Edit**: link to `/clients/edit/{id}`
  - **Reset session**: opens `ClientSessionResetDialog`
  - **Delete**: uses existing `DeleteModal` with `api_url={   \`/clients/${id}
  }`and`keys="clients"`

Update `client-column.tsx` Actions column to render `<ClientRowActions client={row.original} />` instead of a single edit button.

### 5) i18n (strict en/bn parity)

Update both:

- `[C:\wamp64\www\shadcn-isp-client\public\lang\en.json](C:\wamp64\www\shadcn-isp-client\public\lang\en.json)`
- `[C:\wamp64\www\shadcn-isp-client\public\lang\bn.json](C:\wamp64\www\shadcn-isp-client\public\lang\bn.json)`

Add keys (exact nesting, keep shallow):

- `client.edit_title`
- `client.status_updated`
- `client.actions.edit`
- `client.actions.reset_session`
- `client.actions.delete`
- `client.session_reset.title`
- `client.session_reset.confirm`
- `client.session_reset.success`
- `client.delete_confirmation`

Ensure:

- No new hardcoded strings like “Reset session”, “Delete”, “Are you sure…” appear in components.
- en/bn structures match exactly.

## Verification checklist

- Clicking Edit from `/clients` opens `/clients/edit/[id]` (no 404) and form hydrates.
- Toggling status updates backend and refreshes list (invalidate `clients`), with translated toast.
- Reset session opens a confirm dialog and performs POST; translated success toast.
- Delete opens a confirm dialog and performs DELETE; list refreshes.
- No `any` introduced; all new components are strictly typed.

## Next plan (preview)

- **plan-04**: Online status column (lazy fetch) + optional View route skeleton to enable “View” actions safely.

