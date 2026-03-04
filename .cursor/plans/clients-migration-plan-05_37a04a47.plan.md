---
name: clients-migration-plan-05
overview: Plan-05 upgrades the minimal Clients view page toward legacy parity by adding History (paginated table) and an optional live Speed widget, using existing DataTable + query patterns and strict i18n parity.
todos: []
isProject: false
---

# plan-05 — Clients view parity slice: History table + Speed widget

## Goal

Bring `/clients/view/[id]` closer to `isp-client`’s details page without pulling in cross-feature dependencies (invoices/tickets) yet.

This plan adds:

- **History** section (paginated, uses existing `DataTable` + `useApiQuery`)
- **Speed** widget (optional, polling)

## Source behavior to mirror (isp-client)

- History list fetches `GET /api/v1/clients-history/:id?page=...` and renders a table.

```57:77:C:\wamp64\www\isp-client\components\clients\client-history.tsx
const baseUrl = `/api/v1/clients-history/${clientId}?page=${currentPage}`;
useQuery({ queryKey: ["histories", { currentPage }], queryFn: getHistories })
```

