---
name: import-client-migration
overview: Migrate the old Import Client (auto-sync) feature from isp-client into shadcn-isp-client with consistent naming (route + component folder), shadcn UI + DataTable toolbar filters, and the accordion FormBuilder import form, while preserving endpoints/permissions and behavior.
todos:
  - id: todo-structure
    content: Create `components/import-client/` feature folder with type/schema/table/columns/form files.
    status: pending
  - id: todo-list-page
    content: Implement `/import-client` route page + `ImportClientTable` using DataTable + toolbar filters + pagination.
    status: pending
  - id: todo-sync
    content: Implement `ImportClientSyncForm` to POST `/mikrotik-sync` and invalidate `sync-clients`.
    status: pending
  - id: todo-columns-actions
    content: Implement sync-client columns and row actions (Import link + DeleteModal) with permission gating.
    status: pending
  - id: todo-import-page
    content: Implement `/import-client/import/[id]` server page that fetches sync-client detail and renders import form.
    status: pending
  - id: todo-import-form
    content: Implement accordion import form with prefill mapping and POST submit to `/sync-client/{id}`.
    status: pending
  - id: todo-form-payload-hook
    content: "Add optional payload transform/extra payload support to FormWrapper/FormBuilder to submit `action: import` without visible fields."
    status: pending
  - id: todo-i18n
    content: Add required translation keys to `public/lang/en.json` and `public/lang/bn.json`.
    status: pending
isProject: false
---

# Migrate Import Client (auto-sync) feature

## Goal

- Migrate old `@isp-client/components/auto-sync/` into the new project as a consistently named feature:
  - **Route**: `/import-client`
  - **Component folder**: `components/import-client/`
  - Old `auto-sync-list.tsx` becomes new `import-client-table.tsx`
- Preserve old functionality:
  - Sync Mikrotik → refresh sync-client list
  - Filter sync-client list
  - Click Import → open per-client import screen → submit import → return to list
  - Permission-gated buttons (sync/import/show/delete)
- Implement UI using shadcn + existing project patterns:
  - `DataTable` + toolbar filters (`FormFilter`)
  - **Accordion `FormBuilder`** pattern for the import form
  - i18n (`t()` keys) for all user-visible strings

## Key references (existing project patterns)

- **List page pattern (DataTable + filter toolbar)** is like `ClientTable`:

```13:70:C:\wamp64\www\shadcn-isp-client\components\clients\client-table.tsx
const [filterValue, setFilter] = useState<string | null>(null);
const params = useMemo(
  () =>
    filterValue
      ? Object.fromEntries(new URLSearchParams(filterValue))
      : undefined,
  [filterValue]
);

const { data, isLoading, isFetching, setCurrentPage } =
  useApiQuery<PaginatedApiResponse<ClientRow>>({
    queryKey: ["clients"],
    url: "clients",
    params,
  });

return (
  <DataTable
    data={clients}
    setFilter={setFilter}
    columns={columns}
    toolbarOptions={{ filter: ClientFilterSchema() }}
    pagination={pagination}
    setCurrentPage={setCurrentPage}
    queryKey={"clients"}
  />
);
```

- **Filter UI plumbing**: `DataTableToolbar` uses `FormFilter` and calls `setFilter(queryString)`:

```127:136:C:\wamp64\www\shadcn-isp-client\components\data-table\data-table-toolbar.tsx
{toolbarOptions?.filter && (
  <FormFilter
    formSchema={toolbarOptions.filter}
    grids={toolbarOptions?.filter?.length}
    setFilter={setFilter}
    watchFields={toolbarOptions?.watchFields}
    searchButton
    setShowFilter={setShowFilter}
  />
)}
```

- **Accordion FormBuilder** (used by clients/staffs) is via `AccordionFormBuilder` → `FormBuilder` → `FormWrapper`.

## Old feature behavior to preserve

- **List fetch + actions** (old `auto-sync-list.tsx`):

```26:135:C:\wamp64\www\isp-client\components\auto-sync\auto-sync-list.tsx
let base_url = `/api/v1/sync-clients?page=${currentPage}`;
let url = filterValue ? `${base_url}&${filterValue}` : base_url;
// ... columns ...
{!client?.syncd_status && usePermission("sync-clients.show") && (
  <Link href={`/import-client/${client_id}`}>
    <ActionButton type="edit" />
  </Link>
)}
{client?.syncd_status === "imported" && usePermission("sync-clients.delete") && (
  <DeleteItem url={`/api/v1/sync-client/${client_id}`} keys={"sync-clients"} />
)}
```

- **Import form prefill + submit** (old `client-form.tsx`):

```43:59:C:\wamp64\www\isp-client\components\auto-sync\client-form.tsx
mutationFn: async (clientData) => {
  const api_url = `/api/mikrotik-auto-sync/${client?.id}`;
  const { data } = await axios({ method: "post", url: api_url, data: clientData });
  return data.data;
},
// success → router.push("/import-client")
```

```72:80:C:\wamp64\www\isp-client\components\auto-sync\client-form.tsx
setValue("pppoe_password", client?.password);
setValue("pppoe_username", client?.name);
setValue("ip_address", client?.ipv6_routes);
setValue("action", "import");
setValue("mikrotik_profile", client?.profile);
setValue("status", status);
```

## Target architecture (new project)

### Routes

- `[C:\wamp64\www\shadcn-isp-client\app\(dashboard)\import-client\page.tsx](C:\wamp64\www\shadcn-isp-client\app\(dashboard)\import-client\page.tsx)`
  - Server component
  - `export const metadata` using `t()` server helper
  - Renders the main list UI component
- `[C:\wamp64\www\shadcn-isp-client\app\(dashboard)\import-client\import\[id]\page.tsx](C:\wamp64\www\shadcn-isp-client\app\(dashboard)\import-client\import\[id]\page.tsx)`
  - Server component
  - Fetches sync-client detail (by id) using `useFetch` from `[app/actions.ts](C:\wamp64\www\shadcn-isp-client\app\actions.ts)`
  - Renders the import form page component (client)

### Components

Create new feature folder:

- `components/import-client/import-client-type.ts`
  - `SyncClientRowSchema` + `SyncClientRow`
  - `ImportClientFormSchema` + `ImportClientFormInput` / `ImportClientPayload`
- `components/import-client/import-client-filter-schema.ts`
  - `FieldConfig[]` for filters matching old query params: `name`, `service`, `password`, `profile`, `disabled`, `syncd_status`
- `components/import-client/import-client-column.tsx`
  - `useImportClientColumns(pagination?)` with:
    - Import button → `/import-client/import/{id}` (permission `sync-clients.show` and only when `syncd_status` falsy)
    - Delete button → `DeleteModal` hitting `/sync-client/{id}` (permission `sync-clients.delete` and only when `syncd_status === "imported"`)
- `components/import-client/import-client-sync-form.tsx`
  - Small RHF form with network dropdown (`api: "/dropdown-networks"`) and submit to `POST /mikrotik-sync`
  - Invalidates `sync-clients` on success
  - Permission-gated by `sync-clients.sync`
- `components/import-client/import-client-table.tsx`
  - Holds `filterValue` state and derives `params` like `ClientTable` does
  - `useApiQuery` with `queryKey: ["sync-clients"]`, `url: "sync-clients"`
  - `toolbarOptions.filter = ImportClientFilterSchema()`
  - Renders `ImportClientSyncForm` above the DataTable (or in a Card section)
- `components/import-client/import-client-form-schema.ts`
  - Accordion sections (Basic / Connectivity / Advance) in the project’s `AccordionSection[]` format
  - Fields will be aligned to what the backend accepts; initial version will mirror the existing `components/clients/client-form-schema.ts` field set where possible, plus any import-specific fields needed.
- `components/import-client/import-client-form.tsx`
  - Uses `AccordionFormBuilder`
  - Submits to `POST /sync-client/{id}` (import action)
  - On close → route back to `/import-client`
  - Permission-gates the action buttons with `sync-clients.import`

## Small necessary platform adjustment (to preserve old `action=import` behavior cleanly)

Old import submits an extra fixed field (`action: "import"`) without the user editing it. The current `FormWrapper` only submits registered form fields.

Add an **optional, backward-compatible** payload hook to the form stack:

- Extend `FormWrapper` (and pass-through via `FormBuilder`/`AccordionFormBuilder`) with one of:
  - `extraPayload?: Record<string, unknown>` (merged into `formValues` at submit time), and/or
  - `transformPayload?: (values: FieldValues) => FieldValues`

This lets `ImportClientForm` submit `{ ...values, action: "import" }` while keeping the accordion FormBuilder pattern.

## i18n keys to add

Add to **both**:

- `[public/lang/en.json](C:\wamp64\www\shadcn-isp-client\public\lang\en.json)`
- `[public/lang/bn.json](C:\wamp64\www\shadcn-isp-client\public\lang\bn.json)`

Keys (suggested namespace):

- `import_client.title` / `import_client.title_plural`
- `import_client.sync.title`, `import_client.sync.button`
- `import_client.table.`* (column headers)
- `import_client.filters.`* (labels/placeholders/options)
- `import_client.actions.import`
- `import_client.messages.import_success` / `import_client.messages.sync_success`

Note: menu keys already exist under `menu.mikrotik_sync.*`.

## Execution steps (implementation todos)

- **todo-structure**: Create `components/import-client/` files per above.
- **todo-list-page**: Implement `/import-client` page + `ImportClientTable` with filters, pagination, permissions.
- **todo-sync**: Implement `ImportClientSyncForm` (POST `/mikrotik-sync`, invalidate `sync-clients`).
- **todo-columns-actions**: Implement columns + row actions (import link + delete modal).
- **todo-import-page**: Implement `/import-client/import/[id]` page that fetches sync-client detail server-side and renders `ImportClientForm`.
- **todo-import-form**: Implement accordion import form (prefill from sync-client record: `pppoe_username=name`, `pppoe_password=password`, `ip_address=ipv6_routes`, status from `disabled`).
- **todo-form-payload-hook**: Add optional `extraPayload`/`transformPayload` into `FormWrapper`/`FormBuilder` so we can submit `action: "import"` without adding a visible field.
- **todo-i18n**: Add translation keys in `en.json` + `bn.json`.

## Test plan

- Navigate via menu: Mikrotik Sync → Import (`/import-client`) renders without errors.
- With `sync-clients.sync` permission: Sync form visible; submitting triggers backend call and refreshes the list.
- Filter panel: changing dropdowns and typing in text fields updates query params and resets to page 1.
- Row actions:
  - Not imported rows show Import action (only with `sync-clients.show`) → `/import-client/import/{id}` loads.
  - Imported rows show Delete action (only with `sync-clients.delete`) and invalidates `sync-clients`.
- Import form:
  - Prefill matches old mapping.
  - Submit hits `POST /sync-client/{id}` and returns to `/import-client`.

## Notes / assumptions

- API endpoints match old backend naming under the new project’s `useFetch` base (`/api/v1/...`): `sync-clients`, `sync-client/{id}`, `mikrotik-sync`.
- Import detail route chosen per your preference: `/import-client/import/[id]`.

