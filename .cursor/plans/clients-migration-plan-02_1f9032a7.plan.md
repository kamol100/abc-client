---
name: clients-migration-plan-02
overview: Plan-02 migrates the Clients list display + filters toward the original isp-client list (info-dense cells and correct filter fields), while keeping everything read-only and stable. Mutations/actions (status toggle, session reset, popover menu) are deferred to later plans.
todos:
  - id: client-filter-schema-parity
    content: Update `components/clients/client-filter-schema.ts` to use pppoe_username/name/phone/network_id/zone_id/status filters with translated placeholders
    status: pending
  - id: client-list-cell-components
    content: Add read-only grouped cell components for list rows (name/zone/package/billing) using `ClientRow` and i18n
    status: pending
  - id: client-columns-grouped
    content: Refactor `components/clients/client-column.tsx` to use grouped columns and new `client.table.*` header keys
    status: pending
  - id: i18n-client-table-headers
    content: Add `client.table.*` header keys to both `public/lang/en.json` and `bn.json` with strict parity
    status: pending
isProject: false
---

# plan-02 — Clients list parity (read-only cells + correct filters)

## Goal

Bring the `/clients` list closer to `isp-client/components/clients/client-list.tsx` by:

- Showing the same *information density* via grouped “cell components” (ID/Name/Phone, Zone/Address/Network, Connection/Package, Bill/Payment)
- Fixing the filter schema to match actual Clients filters (PPPoE ID, name, phone, network, zone, status)

This step stays **read-only** (no mutations/modals yet) so it’s safe to run immediately after plan-01.

## Source parity targets (from isp-client)

The original list table columns are grouped and info-dense:

```69:158:C:\wamp64\www\isp-client\components\clients\client-list.tsx
  const columns = [
    { header: "SL", ... },
    { header: "ID/Name/Phone", cell: <ClientNameInfo .../> },
    { header: "Zone/Address/Network", cell: <ClientZoneInfo .../> },
    { header: "connection/Package", cell: <ClientPackageInfo .../> },
    { header: "Bill/Payment", cell: <ClientPaymentInfo .../> },
    { header: "Online/info", cell: <ClientOnlineStatus .../> },
    { header: "Status", cell: <ClientStatus .../> },
    { header: "Actions", cell: <ClientAction .../> + view + session reset },
  ];
```

Plan-02 implements the first four grouped info cells + correct filters. Online status + mutations/actions will come later.

## Scope

### In scope

- Update `**[C:\wamp64\www\shadcn-isp-client\components\clients\client-filter-schema.ts](C:\wamp64\www\shadcn-isp-client\components\clients\client-filter-schema.ts)**` to match client filtering.
- Refactor `**[C:\wamp64\www\shadcn-isp-client\components\clients\client-column.tsx](C:\wamp64\www\shadcn-isp-client\components\clients\client-column.tsx)**` to use grouped “cell components”.
- Add small, focused list cell components under `components/clients/` that render information using `ClientRow`.
- Add any missing translation keys in both `public/lang/en.json` and `public/lang/bn.json` (strict parity).

### Out of scope (defer)

- **Online/info column** (`/api/v1/client-online-status/:id` + intersection observer)
- **Status toggle mutation** (`/api/v1/client-status/:id`)
- **Session reset modal** (`/api/v1/client-reset-session/:id`)
- **Popover “Actions” menu** (Edit/View/Pay/SMS/Tickets/Delete + permissions)
- SL/index column (we can add later once we decide whether it should be global table behavior)

## Implementation plan

### 1) Fix filter schema to match isp-client behavior

Update `client-filter-schema.ts` to produce these query params:

- `pppoe_username` (text)
- `name` (text)
- `phone` (text)
- `network_id` (dropdown; `api: "/dropdown-networks"`)
- `zone_id` (dropdown; `api: "/dropdown-zones"`)
- `status` (dropdown; options 1/0 using `t("common.active")` / `t("common.inactive")`)

Use existing translation keys for placeholders wherever possible:

- `t("client.pppoe_username.placeholder")`
- `t("client.name.placeholder")`
- `t("client.phone.placeholder")`
- `t("client.network.placeholder")`
- `t("client.zone.placeholder")`
- `t("client.status.placeholder")`

### 2) Add read-only grouped cell components (KISS)

Create these components (names are suggestions; keep them small and pure):

- `components/clients/client-name-phone-cell.tsx`
  - renders: `pppoe_username` (or `client_id` fallback), `name`, `phone`
- `components/clients/client-zone-address-cell.tsx`
  - renders: `zone?.name`, `sub_zone?.name`, `network?.name`, `current_address`
- `components/clients/client-package-cell.tsx`
  - renders: `connection_type`, `connection_mode`, `package?.name`, `ip_address`
- `components/clients/client-billing-payment-cell.tsx`
  - renders: `billing_term`, `payment_term`, `payment_deadline`, `discount`

All user-facing strings inside these cells must use `useTranslation()` (no hardcoded labels like “IP”). If you don’t want labels yet, render values only.

### 3) Update columns to match grouped layout

Refactor `client-column.tsx` to expose grouped columns similar to the original list:

- Replace the current single-field columns (`name`, `phone`, `pppoe_username`, `ip_address`) with 4 grouped columns using the new cell components.
- Keep `status` (badge) and `actions` (edit button) as-is for now.

Add translation keys for the grouped column headers:

- `client.table.id_name_phone`
- `client.table.zone_address_network`
- `client.table.connection_package`
- `client.table.bill_payment`

### 4) i18n updates (strict en/bn parity)

Update both:

- `[C:\wamp64\www\shadcn-isp-client\public\lang\en.json](C:\wamp64\www\shadcn-isp-client\public\lang\en.json)`
- `[C:\wamp64\www\shadcn-isp-client\public\lang\bn.json](C:\wamp64\www\shadcn-isp-client\public\lang\bn.json)`

Add the `client.table.`* keys above. Keep nesting shallow and consistent with existing `client.`* usage.

## Verification checklist

- `/clients` renders and shows grouped info columns (no TS errors, no `any`).
- Filter toolbar builds a query string with the correct params (`pppoe_username`, `name`, `phone`, `network_id`, `zone_id`, `status`) and list results change accordingly.
- No hardcoded UI strings introduced in the new cell components.
- New translation keys exist in **both** `en.json` and `bn.json` with identical structure.

## Next plans (preview)

- **plan-03**: Add interactive list behaviors: status toggle (mutation), session reset (confirm dialog), online status lazy query, and a shadcn dropdown actions menu with permission gating + safe linking to not-yet-migrated pages.

