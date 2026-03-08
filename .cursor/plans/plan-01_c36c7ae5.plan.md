---
name: plan-01
overview: Migrate base Product (CRUD + listing) from isp-client into shadcn-isp-client using the standard DataTable + FormBuilder patterns, strict Zod typing, and full translations.
todos:
  - id: p01-types
    content: Create `components/products/product-type.ts` with ProductRowSchema (.passthrough) + ProductFormSchema and exported types.
    status: completed
  - id: p01-form
    content: Implement `components/products/product-form-schema.ts` and `product-form.tsx` using DialogWrapper + FormBuilder with dropdown APIs.
    status: completed
  - id: p01-table
    content: Implement `product-column.tsx` + `product-table.tsx` using DataTable + useApiQuery + permissions + delete rule.
    status: completed
  - id: p01-page-i18n
    content: Add `app/(dashboard)/products/page.tsx` with metadata title and add `product` translation keys to both `en.json` and `bn.json`.
    status: completed
isProject: false
---

# Plan 01 — Products CRUD foundation

## Scope (what this plan migrates)

- Old source (reference):
  - UI: `[C:/wamp64/www/isp-client/components/products/product-list.tsx](C:/wamp64/www/isp-client/components/products/product-list.tsx)`, `[C:/wamp64/www/isp-client/components/products/product-form.tsx](C:/wamp64/www/isp-client/components/products/product-form.tsx)`, `[C:/wamp64/www/isp-client/components/products/product-edit.tsx](C:/wamp64/www/isp-client/components/products/product-edit.tsx)`
  - API proxy routes: `[C:/wamp64/www/isp-client/app/api/products/route.ts](C:/wamp64/www/isp-client/app/api/products/route.ts)`, `[C:/wamp64/www/isp-client/app/api/products/[productId]/route.ts](C:/wamp64/www/isp-client/app/api/products/[productId]/route.ts)`
- New target: implement **Products list + create/edit/delete** in `shadcn-isp-client`.
- Not in this plan: Product In/Out flows, serial selection, product reports, product details pages (handled in plan-02/03).

## Architecture (new)

- Feature module: `components/products/`
- Fetching: `useApiQuery` (TanStack Query) + `useFetch` server action (no Next API proxy routes)
- Forms: `DialogWrapper` + `FormBuilder`
- Table: `components/data-table/DataTable`
- Permissions: `usePermissions().hasPermission(...)` (replace `usePermission(...)`)

## New folder structure (to create)

- `[C:/wamp64/www/shadcn-isp-client/components/products/product-type.ts](C:/wamp64/www/shadcn-isp-client/components/products/product-type.ts)`
- `[C:/wamp64/www/shadcn-isp-client/components/products/product-form-schema.ts](C:/wamp64/www/shadcn-isp-client/components/products/product-form-schema.ts)`
- `[C:/wamp64/www/shadcn-isp-client/components/products/product-form.tsx](C:/wamp64/www/shadcn-isp-client/components/products/product-form.tsx)`
- `[C:/wamp64/www/shadcn-isp-client/components/products/product-column.tsx](C:/wamp64/www/shadcn-isp-client/components/products/product-column.tsx)`
- `[C:/wamp64/www/shadcn-isp-client/components/products/product-table.tsx](C:/wamp64/www/shadcn-isp-client/components/products/product-table.tsx)`
- `[C:/wamp64/www/shadcn-isp-client/app/(dashboard)/products/page.tsx](C:/wamp64/www/shadcn-isp-client/app/(dashboard)`/products/page.tsx)

## Types & schemas (Zod)

Create `ProductRowSchema` and `ProductFormSchema` in `[components/products/product-type.ts](C:/wamp64/www/shadcn-isp-client/components/products/product-type.ts)` following the migration rules:

- **Ref schemas** (nested objects used in table rows):
  - `UnitTypeRefSchema` (id, name)
  - `ProductCategoryRefSchema` (id, name)
- **RowSchema**: `.passthrough()` (to tolerate backend list payload extras like `stock_in_quantity`, `stock_out_quantity`, `stock_in_remaining`, `unitType`, `category`)
- **FormSchema**: only fields needed for create/edit (no API-only fields)

Map from old product schema (reference): `[C:/wamp64/www/isp-client/components/forms/schema/product.ts](C:/wamp64/www/isp-client/components/forms/schema/product.ts)`

- Core form fields:
  - `name` (required)
  - `has_serial` (number/boolean-like)
  - `vat` (number, default 0)
  - `unit_type_id` (required)
  - `product_category_id` (required)
  - `description` (nullable/optional)

Export types:

- `ProductRow`, `ProductFormInput`, `ProductPayload`

## UI components

### `ProductForm` (Dialog)

Implement in `[components/products/product-form.tsx](C:/wamp64/www/shadcn-isp-client/components/products/product-form.tsx)`:

- Uses `DialogWrapper` + `FormBuilder`
- Uses `[components/products/product-form-schema.ts](C:/wamp64/www/shadcn-isp-client/components/products/product-form-schema.ts)` for fields
- API targets (via `FormBuilder`):
  - Create: `POST /products`
  - Edit: `PUT /products` (with `data={{ id }}` or `api_url` pattern matching existing features)
- Dropdown APIs (match backend “dropdown-*” convention used elsewhere):
  - Unit types: `api: "/dropdown-unit-types"`
  - Product categories: `api: "/dropdown-product-categories"` (works with existing Product Category feature)

### `ProductColumns`

Implement in `[components/products/product-column.tsx](C:/wamp64/www/shadcn-isp-client/components/products/product-column.tsx)`:

- Columns to match old listing intent:
  - SL (use `cellIndex` + pagination)
  - Name
  - Vat
  - Has serial
  - Category name
  - Unit type name
  - Stock in (link to `/products/in/[id]` later; for now keep text or link placeholder)
  - Stock out (link to `/products/out/[id]` later)
  - Remaining
  - Actions: edit (open `ProductForm` in edit mode), delete (`DeleteModal`) with rule: allow delete only if `stock_in_quantity === 0` (old behavior)
- Permissions:
  - Create button: `products.create`
  - Edit action: `products.edit`
  - Delete action: `products.delete`

### `ProductTable`

Implement in `[components/products/product-table.tsx](C:/wamp64/www/shadcn-isp-client/components/products/product-table.tsx)`:

- Use `useApiQuery<PaginatedApiResponse<ProductRow>>({ queryKey:["products"], url:"products" })`
- Pass pagination + loading states into `DataTable`
- Provide the create form (`ProductForm`) as `form` prop to `DataTable`
- Toolbar title: `t("product.title_plural")` + total count (same as `ProductCategoryTable` pattern)

## Page wiring

Create `[app/(dashboard)/products/page.tsx](C:/wamp64/www/shadcn-isp-client/app/(dashboard)`/products/page.tsx):

- `metadata.title = t("menu.products.title")` or `t("product.title_plural")` (prefer feature title for consistency with other CRUD pages)
- Render `<ProductTable />`

## Translation additions (mandatory)

Update both:

- `[C:/wamp64/www/shadcn-isp-client/public/lang/en.json](C:/wamp64/www/shadcn-isp-client/public/lang/en.json)`
- `[C:/wamp64/www/shadcn-isp-client/public/lang/bn.json](C:/wamp64/www/shadcn-isp-client/public/lang/bn.json)`

Add new top-level key `product` (menu keys already exist under `menu.products.`*). Include:

- `title_plural`, `create_title`, `edit_title`, `delete_confirmation`
- Field labels/placeholders/errors:
  - `name`, `has_serial`, `vat`, `unit_type`, `product_category`, `description`
- Table labels used by columns (if not reusing field label keys)

## Test checklist (for this plan)

- Products page loads and paginates.
- Create Product submits and refreshes the table.
- Edit Product hydrates and updates.
- Delete Product shows confirmation and invalidates `products` query.
- No hardcoded user-facing strings in new components.
- No `any` in new code; all Zod schemas/types exported.

## Likely migration pitfalls to avoid

- Don’t add/modify `components/ui/`*.
- Don’t use raw shadcn `Button` directly; use `[components/action-button.tsx](C:/wamp64/www/shadcn-isp-client/components/action-button.tsx)` where an “action button” is intended.
- Ensure dropdown endpoints use existing backend convention (`/dropdown-*`) and return `{ id, name }` shape expected by `SelectDropdown`.
- Keep server components by default; only mark client components where needed (table + form are client).

