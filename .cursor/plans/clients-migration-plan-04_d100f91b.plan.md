---
name: clients-migration-plan-04
overview: Plan-04 adds the Clients “Online/info” column with lazy fetching (no new deps) and introduces a minimal `/clients/view/[id]` page plus a View action in the row actions menu.
todos:
  - id: use-in-view-hook
    content: Add `hooks/use-in-view.ts` using IntersectionObserver (no extra deps)
    status: pending
  - id: client-online-status-cell
    content: Add `components/clients/client-online-status-cell.tsx` with lazy query to `client-online-status/:id` and translated labels
    status: pending
  - id: client-columns-online-info
    content: Insert Online/info column into `components/clients/client-column.tsx` using `client.table.online_info`
    status: pending
  - id: clients-view-route-min
    content: Add minimal `app/(dashboard)/clients/view/[id]/page.tsx` + `components/clients/client-view.tsx` summary view
    status: pending
  - id: client-row-actions-view
    content: Add View action item in `components/clients/client-row-actions.tsx`
    status: pending
  - id: i18n-clients-online-view
    content: Add online/view/action keys to both `public/lang/en.json` and `bn.json` with strict parity
    status: pending
isProject: false
---

# plan-04 — Online/info column (lazy fetch) + minimal View page

## Goal

Implement the next parity slice from `isp-client`:

- The **Online/info** table column that lazily fetches router/session info per row
- A minimal `**/clients/view/[id]`** page so we can safely add a View action (without migrating the full legacy client-view feature yet)

This plan is designed to be small, self-contained, and depend only on plans 01–03.

## Source behavior to mirror (isp-client)

The original list lazily fetches online status when the cell enters the viewport:

```11:59:C:\wamp64\www\isp-client\components\clients\client-online-status.tsx
const { ref, inView } = useInView(...);
useQuery({
  queryKey: ["client-online-status", client.id],
  queryFn: () => getData(`/api/v1/client-online-status/${client.id}`),
  enabled: inView && !!client.id,
});
...
render IP/MAC/UT
```

## Scope

### In scope

- Add a lightweight IntersectionObserver hook (no new npm dependency)
- Add `ClientOnlineStatusCell` (typed, i18n-safe) that fetches `GET /client-online-status/{id}` via existing `useApiQuery`
- Add a new `client.table.online_info` column between Bill/Payment and Status
- Add a minimal `/clients/view/[id]` page + component that fetches client detail and renders a simple summary using existing cell components
- Add View action in `client-row-actions.tsx`

### Out of scope (defer)

- Full legacy `ClientView` parity (history table, speed widget, graph, invoice/ticket integrations)
- Permission gating on actions (we’ll add once the project standard for permissions in tables is established)

## Implementation plan

### 1) Add a shared in-view hook (no dependency)

Create `**[C:\wamp64\www\shadcn-isp-client\hooks\use-in-view.ts](C:\wamp64\www\shadcn-isp-client\hooks\use-in-view.ts)**` (client hook).

- Use `IntersectionObserver` to expose:
  - `ref` (callback ref)
  - `inView: boolean`
- Support options: `rootMargin` and `threshold` (defaults ok).
- Keep it generic and reusable (DRY/KISS).

### 2) Add `ClientOnlineStatusCell`

Create `**components/clients/client-online-status-cell.tsx**`.

- Props: `{ clientId: number; inactive?: boolean }` (inactive can be derived from `client.status === 0`).
- Data type:
  - `type ClientOnlineStatus = { ip_address?: string | null; router_mac_address?: string | null; uptime?: string | null }`
- Query:
  - `useApiQuery<ApiResponse<ClientOnlineStatus>>({   queryKey: ["client-online-status", clientId],   url:` client-online-status/${clientId}`,   pagination: false,   enabled: inView,   staleTime: 10_000, })`
- UI:
  - While loading: small inline spinner (e.g. `Loader2`)
  - After load: show `ip_address`, `router_mac_address`, `uptime` with translated labels
  - Fallback for missing values should be **"—"** (avoid hardcoded `N/A`).

### 3) Wire Online/info into the Clients table columns

Update `**components/clients/client-column.tsx`**:

- Add a new column:
  - `id: "online_info"`
  - header key: `client.table.online_info`
  - cell: `<ClientOnlineStatusCell clientId={client.id} inactive={client.status === 0} />`
- Place it after `bill_payment` and before `status` to match legacy order.

### 4) Add minimal `/clients/view/[id]` route

Create `**app/(dashboard)/clients/view/[id]/page.tsx`**.

- `metadata.title = t("client.view_title")`
- Render `<ClientView clientId={id} />` (component below)

Create `**components/clients/client-view.tsx`** (client component for now).

- Fetch detail:
  - `useApiQuery<ApiResponse<ClientRow>>({ queryKey: ["clients","detail",clientId], url:` clients/${clientId}`, pagination: false })`
- Render:
  - Toolbar/back button to `/clients`
  - Summary card using existing list cell components (`ClientNamePhoneCell`, `ClientZoneAddressCell`, `ClientPackageCell`, `ClientBillingPaymentCell`)

This keeps view small and avoids cross-feature dependencies.

### 5) Add View action to row actions

Update `**components/clients/client-row-actions.tsx**`:

- Add a `DropdownMenuItem` linking to `/clients/view/{id}`.
- Add translation key `client.actions.view`.

### 6) i18n (strict en/bn parity)

Update both:

- `public/lang/en.json`
- `public/lang/bn.json`

Add keys:

- `client.table.online_info`
- `client.online.ip`
- `client.online.mac`
- `client.online.uptime`
- `client.view_title`
- `client.actions.view`

Ensure key structure is identical in en/bn.

## Verification checklist

- `/clients` shows an Online/info column and lazily fetches per visible row (no extra network spam offscreen).
- No TypeScript errors; no `any` added.
- No hardcoded user-facing strings introduced.
- `/clients/view/[id]` loads and shows a basic client summary.
- View action appears in row menu and navigates without 404.

## Next plan (preview)

- **plan-05**: Expand View parity (history table, speed widget), then expand row actions parity (invoice history/pay, SMS, tickets, change package, conditional mikrotik delete).

