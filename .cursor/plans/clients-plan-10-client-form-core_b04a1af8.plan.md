---
name: clients-plan-10-client-form-core
overview: Restore Clients create/edit form in shadcn-isp-client using the existing FormBuilder/AccordionFormBuilder system, aligning Zod schema + UI field config to the legacy form’s structure (Basic/Connectivity/Advance) while keeping the slice small and strictly typed.
todos:
  - id: client-form-schema-align
    content: Align `components/clients/client-type.ts` ClientFormSchema field types with intended shadcn inputs (notably date fields), and confirm which legacy fields are in-scope for the core form slice.
    status: pending
  - id: client-form-field-config
    content: Create `components/clients/client-form-schema.ts` as AccordionSection[] (Basic/Connectivity/Advance) with i18n labels/placeholders and safe static options.
    status: pending
  - id: client-form-component
    content: Create `components/clients/client-form.tsx` (full page) using AccordionFormBuilder + FormWrapper hydration for edit mode; submit via /clients POST/PUT; close routes back to /clients.
    status: pending
  - id: clients-create-edit-pages
    content: Fix `app/(dashboard)/clients/create/page.tsx` + `app/(dashboard)/clients/edit/[id]/page.tsx` to render the new form and add metadata titles.
    status: pending
  - id: i18n-client-form-core
    content: Add missing `client.*` translation keys needed by the new form fields (en/bn strict parity).
    status: pending
  - id: verify-client-form-core
    content: Verify create + edit hydration + submit + validation; ensure no hardcoded strings and no any types.
    status: pending
isProject: false
---

---

name: clients-plan-10-client-form-core
overview: "Restore Clients create/edit form (core) using FormBuilder/AccordionFormBuilder, matching the legacy 3-section structure and aligning schema/UI types so /clients/create and /clients/edit work again."
todos:

- id: client-form-schema-align
content: "Align `components/clients/client-type.ts` ClientFormSchema field types with intended shadcn inputs (notably date fields), and confirm which legacy fields are in-scope for the core form slice."
status: pending
- id: client-form-field-config
content: "Create `components/clients/client-form-schema.ts` as AccordionSection[] (Basic/Connectivity/Advance) with i18n labels/placeholders and safe static options."
status: pending
- id: client-form-component
content: "Create `components/clients/client-form.tsx` (full page) using AccordionFormBuilder + FormWrapper hydration for edit mode; submit via /clients POST/PUT; close routes back to /clients."
status: pending
- id: clients-create-edit-pages
content: "Fix `app/(dashboard)/clients/create/page.tsx` + `app/(dashboard)/clients/edit/[id]/page.tsx` to render the new form and add metadata titles."
status: pending
- id: i18n-client-form-core
content: "Add missing `client.*` translation keys needed by the new form fields (en/bn strict parity)."
status: pending
- id: verify-client-form-core
content: "Verify create + edit hydration + submit + validation; ensure no hardcoded strings and no any types." 
status: pending
isProject: false

---

# plan-10 — Clients form migration (core create/edit)

## Proposed next plan file name

- `C:/wamp64/www/shadcn-isp-client/.cursor/plans/clients-plan-10-client-form-core_<auto>.plan.md`

## Goal

Make **Client Create** and **Client Edit** functional again in `shadcn-isp-client`, using the existing **schema-driven form architecture** (Zod + RHF + FormBuilder), while keeping the slice small and self-contained.

## Why this is needed (current breakage)

- `/clients/create` imports a missing form component:

```1:5:C:\wamp64\www\shadcn-isp-client\app(dashboard)\clients\create\page.tsx
import ClientForm from "@/components/clients/client-form";

export default async function ClientCreate() {
    return <ClientForm />
}
```

- `/clients/edit/[id]` currently renders nothing:

```8:17:C:\wamp64\www\shadcn-isp-client\app(dashboard)\clients\edit[id]\page.tsx
export default async function ClientEdit({ params }: Props) {
    const { id } = await params;

    // return <ClientForm mode="edit" data={{ id }} />;
}

export const metadata: Metadata = {
    title: t("client.edit_title"),
    description: t("client.edit_title"),
};
```

## Reference form structure (legacy)

The old `isp-client` form is a 3-section accordion:

```95:123:C:\wamp64\www\isp-client\components\clients\client-form.tsx
          <form onSubmit={handleSubmit(onSubmit, onError)}>
            <Accordion>
              <Accordion.Panel>
                <Accordion.Title className="py-2 text-lg">
                  Basic Information
                </Accordion.Title>
                <Accordion.Content>
                  <BasicForm client={client as TSclientSchema} isEdit={isEdit} />
                </Accordion.Content>
              </Accordion.Panel>
              <Accordion.Panel>
                <Accordion.Title className="py-2 text-lg text-gray-900">
                  Connectivity
                </Accordion.Title>
                <Accordion.Content>
                  <ConnectivityForm client={client as TSclientSchema} isEdit={isEdit} />
                </Accordion.Content>
              </Accordion.Panel>
              <Accordion.Panel>
                <Accordion.Title className="py-2 text-lg text-gray-900">
                  Advance
                </Accordion.Title>
                <Accordion.Content>
                  <AdvanceForm client={client as TSclientSchema} />
                </Accordion.Content>
              </Accordion.Panel>
            </Accordion>
            <input className="opacity-0" type="submit" ref={inputRef} />
          </form>
```

## Scope

### In scope (this plan)

- Implement a **core** `ClientForm` (create + edit) matching the **3-section structure** (Basic/Connectivity/Advance).
- Use the existing shadcn form stack:
  - `components/form-wrapper/form-wrapper.tsx`
  - `components/form-wrapper/form-builder.tsx`
  - `components/form-wrapper/accordion-form-builder.tsx`
- Implement **core field set** that already exists in `components/clients/client-type.ts` `ClientFormSchema` and matches legacy behavior:
  - Basic: name, PPPoE ID/password, phone, IP, discount, welcome SMS, payment term/deadline, billing term/type, zone/sub-zone, network/package/device, address, note, status (create-only).
  - Connectivity: cable type/length, connection mode/type, client type, MAC, termination date.
  - Advance: father name, occupation, email, permanent address, upazila, invoice day, connection date, fund.
- Ensure **strict i18n** (no hardcoded user-facing strings; en/bn parity).

### Out of scope (explicitly deferred)

- **Server-side unique checks** for `pppoe_username` (legacy `UniqueField`).
- **Dependent dropdown filtering** (zone → sub-zone, network → package) unless the exact endpoints/params are already known.
- **Fiber product inventory UI** (`/fiber-product`, cable invoice toggle) and any stock-side effects.
- File/image uploads (`nid_front`, `nid_back`, `photo`) and `multipart/form-data`.

These will be handled in the next form-focused plan (see Follow-ups).

## Implementation plan

### 1) Align `ClientFormSchema` to the UI widgets we will render

Update `[C:/wamp64/www/shadcn-isp-client/components/clients/client-type.ts](C:/wamp64/www/shadcn-isp-client/components/clients/client-type.ts)` as needed so Zod accepts what our inputs produce.

Key point: shadcn `DatePicker` yields `Date`, and you currently have at least one non-coercing date field:

- Make `connection_date` accept coercion (`z.coerce.string()`), or change the field to a text input in this core slice.

Also confirm which “legacy-only” fields should be added (or intentionally omitted) so schema and UI don’t drift.

### 2) Add a dedicated UI field schema for Clients

Create `[C:/wamp64/www/shadcn-isp-client/components/clients/client-form-schema.ts](C:/wamp64/www/shadcn-isp-client/components/clients/client-form-schema.ts)`.

- Export `ClientFormFieldSchema({ mode })` returning `AccordionSection[]`.
- Follow the existing pattern in `[components/staffs/staff-form-schema.ts](C:/wamp64/www/shadcn-isp-client/components/staffs/staff-form-schema.ts)`.
- Use `permission: mode === "create"` for create-only fields (e.g. `status`, optional cable inventory fields later).
- Use only the supported field types (`text/email/password/number/textarea/dropdown/radio/date`).
- Use dropdown endpoints already established in this repo where possible:
  - `zone_id`: `api: "/dropdown-zones"`
  - `network_id`: `api: "/dropdown-networks"`
  - `package_id`: `api: "/dropdown-network-packages"` (already used in change-package)

If sub-zone/device/upazila dropdown endpoints are not known yet, include them as **optional** fields in this core slice (or render them as plain inputs) and defer correct dependent dropdowns to plan-11.

### 3) Implement `ClientForm` (full page)

Create `[C:/wamp64/www/shadcn-isp-client/components/clients/client-form.tsx](C:/wamp64/www/shadcn-isp-client/components/clients/client-form.tsx)`.

- Client component (`"use client"`).
- Props similar to other forms:
  - `mode?: "create" | "edit"`
  - `api?: string` (default `"/clients"`)
  - `method?: "POST" | "PUT"`
  - `data?: { id?: string | number } & Partial<ClientRow>` (for edit hydration)
- Use `AccordionFormBuilder` with:
  - `schema={ClientFormSchema}` from `client-type.ts`
  - `formSchema={ClientFormFieldSchema({ mode })}`
  - `fullPage` + centered layout (follow `StaffForm`)
  - `onClose={() => router.push("/clients")}` so cancel/save returns to list

### 4) Fix `/clients/create` and `/clients/edit/[id]`

- Update `[C:/wamp64/www/shadcn-isp-client/app/(dashboard)/clients/create/page.tsx](C:/wamp64/www/shadcn-isp-client/app/(dashboard)/clients/create/page.tsx)`:
  - Add `metadata.title = t("client.create_title")`
  - Render `<ClientForm mode="create" method="POST" />`
- Update `[C:/wamp64/www/shadcn-isp-client/app/(dashboard)/clients/edit/[id]/page.tsx](C:/wamp64/www/shadcn-isp-client/app/(dashboard)/clients/edit/[id]/page.tsx)`:
  - Render `<ClientForm mode="edit" method="PUT" data={{ id }} />`

### 5) i18n additions (strict en/bn parity)

Update both:

- `[C:/wamp64/www/shadcn-isp-client/public/lang/en.json](C:/wamp64/www/shadcn-isp-client/public/lang/en.json)`
- `[C:/wamp64/www/shadcn-isp-client/public/lang/bn.json](C:/wamp64/www/shadcn-isp-client/public/lang/bn.json)`

Add only the missing keys required by fields you render in this plan (keep nesting consistent under `client.`*).

Minimum likely additions for this core slice (only if not already present):

- `client.mac_address.{label,placeholder}`
- `client.billing_type.{label,placeholder}`
- `client.cable_type.{label,placeholder}`
- `client.cable_length.{label,placeholder}`
- `client.invoice_day.{label,placeholder}`
- `client.connection_date.{label,placeholder}`
- `client.termination_date.{label,placeholder}`
- `client.upazila.{label,placeholder}` (or `client.upazila_id.`* depending on naming)
- `client.type.{label,placeholder}`

## Verification checklist

- `/clients/create` renders the accordion form and submits successfully.
- `/clients/edit/{id}` renders and hydrates values via `FormWrapper` edit hydration.
- Save/cancel returns to `/clients`.
- No `any` introduced; all new code is strictly typed.
- No hardcoded user-facing strings; new keys exist in both en/bn with identical structure.

## Follow-up plan split (after plan-10)

### Plan-11: Clients form advanced parity

- Dependent dropdowns + correct endpoints:
  - zone → sub-zone filtering
  - network → network packages filtering (or safe auto-setting `network_id` from selected package if backend supports it)
- Client-side helpers:
  - “Get Location” button (sets `adr_latitude` / `adr_longitude` safely)
- Fiber/cable inventory parity:
  - Fiber product selector (`/fiber-product`) + `cable_invoice` toggle
- PPPoE unique check parity:
  - implement (or rely on backend validation) without introducing `any`

### Plan-12: Clients view parity expansion

- Add optional embedded sections in `[components/clients/client-view.tsx](C:/wamp64/www/shadcn-isp-client/components/clients/client-view.tsx)`:
  - Client invoices table (reuse invoices components)
  - Tickets list/thread preview (reuse tickets components)
  - Copy-to-clipboard quick action (legacy convenience)

### Plan-13: Client “extras” parity (only if needed)

- Graph widget and/or map widgets (depends on confirmed API endpoints and desired UI scope).
- Additional list columns like SL/index and richer status/billing indicators if still missing.

### Plan-14: Cleanup + consistency hardening

- Remove any leftover dead Clients code paths, ensure permission gating is consistent (create button, actions), and do a final i18n audit for the Clients feature.

