# Form builder

You describe a form as a list of fields; the form builder draws it, validates it, loads the record for editing, and saves it. Almost every create and edit screen in this app is built this way.

## A form in 15 lines

```tsx
<MyDialog size="xl" title="zone.create_title" trigger={<FormTrigger mode={mode} />}>
  <FormBuilder
    formSchema={ZoneFormFieldSchema()}   // what to draw
    schema={ZoneFormSchema}              // how to validate (Zod)
    api="/zones"                         // where to save
    mode={mode}                          // "create" or "edit"
    data={data}                          // edit: { id } is enough
    queryKey="zones"                     // which list to refresh after saving
    grids={2}                            // columns
  />
</MyDialog>
```

A field list looks like this. Labels, placeholders and error messages are translation keys.

```ts
export const ZoneFormFieldSchema = (): FormFieldConfig[] => [
  { type: "text", name: "name", label: { labelText: "zone.name.label", mandatory: true } },
  { type: "dropdown", name: "network_id", api: "/dropdown-networks", valueKey: "network",
    valueMapping: { idKey: "id", labelKey: "name" } },
  { type: "date", name: "opened_at" },
];
```

Use `zones` as the model for a dialog form, `staffs` for a full page with sections, and `invoices` for a form with line items.

## What happens when a form opens and saves

1. **Create** starts from `data` (or empty) plus the `defaultValue` of dropdowns and radios.
2. **Edit** fetches `GET {api}/{id}` when `data` does not already hold a value for every field. Passing `{ id }` is enough.
3. The API record is turned into form values: date text becomes a `Date`, and a related record (`zone: { id, name }`) becomes its id (`zone_id: 3`).
4. On Save, **Zod validates**. Zod is the only validator.
5. The payload is built: your `transformPayload`, then `extraPayload` on top, then cleanup.
6. Create sends `POST {api}`. Edit always sends `PUT {api}/{id}`.
7. On success the form resets, the `queryKey` list is refreshed, `onSuccess` runs, and the dialog closes. On a 422 the server's messages appear under their fields.

## Where things live

```text
components/form-builder/
  form-builder.tsx            the component you use
  accordion-form-builder.tsx  the same, in collapsible sections
  form-filter.tsx             the filter row above a table
  form-wrapper.tsx            puts the hooks and the layout together
  types.ts                    every option a field can have, with comments
  core/                       logic, no markup
    use-entity-form.ts        creates the form
    use-entity-load.ts        edit: fetch the record, fill the form
    use-entity-submit.ts      build the payload, save, handle the answer
    values.ts                 API record -> form values
    payload.ts                form values -> request body
    conditions.ts             visibleWhen / disabledWhen rules
  fields/                     one file per field type
    registry.ts               the list of field types
    field-shell.tsx           label + control + error, shared by every field
    field-array.tsx           repeating rows
  layout/                     footer, loading state, show/hide wrapper
components/controls/          dropdown and date controls that work without a form
components/form/              the field components (input, textarea, radio, ...)
```

`components/form-wrapper/` only re-exports these files for older imports. Import from `components/form-builder/` in new code.

## Field types

| `type` | Draws | The form holds |
| --- | --- | --- |
| `text`, `email`, `number`, `tel`, `password` | An input | Text (Zod coerces numbers) |
| `textarea` | A multi-line input | Text |
| `dropdown` | A searchable select, options from `options` or `api` | The option value, or a list with `isMulti` |
| `radio` | One choice from a short list | The option value as text |
| `checkbox` | Several choices, or one box with `single` | A list, or true/false |
| `switch` | An on/off toggle | true/false |
| `date`, `dateRange` | A calendar | A `Date`, or `{ from, to }` |
| `geolocation` | Latitude and longitude inputs | Two values, under `latitudeName` and `longitudeName` |
| `computed` | A read-only value worked out from other fields | The computed value |
| `custom` | Your own component | Whatever your component writes |
| `fieldArray` | Repeating rows | A list of row objects |

## Options every field has

| Option | What it does |
| --- | --- |
| `name` | The key in the form values and in the payload |
| `label`, `placeholder` | Translation keys |
| `className` | Classes on the field's grid cell, e.g. `col-span-full` |
| `permission: false` | Leaves the field out |
| `disabled` | Disables it |
| `visibleWhen` | Shows it only while a rule on another field passes; while hidden its value is reset |
| `disabledWhen` | Disables it while a rule passes |
| `onChange: { set }` | When the user changes it, writes values into other fields |

## Fields that react to other fields

```ts
// Show a field only for one status. While hidden, its value is set to null.
{ type: "number", name: "partial_amount", visibleWhen: { field: "status", equals: "partial_paid" } }

// Several rules: all must pass, or any one of them.
{ type: "dropdown", name: "fund_id",
  visibleWhen: { any: [{ field: "status", equals: "paid" }, { field: "status", equals: "partial_paid" }] } }

// A dropdown whose options depend on another dropdown.
{ type: "dropdown", name: "package_id",
  dependsOn: { field: "network_id", buildApi: (id) => `/dropdown-packages/${id}` } }

// Fill another field from the chosen option's record.
{ type: "dropdown", name: "agent_id", api: "/dropdown-agents",
  populate: [{ field: "commission", from: "commission" }] }

// A value worked out from other fields. It is saved with the form.
{ type: "computed", name: "total", compute: ({ row }) => Number(row.amount) * Number(row.quantity) }
```

## Repeating rows

```ts
{
  type: "fieldArray",
  name: "lines",
  minItems: 1,
  defaultItem: { description: "", amount: 0, quantity: 1 },
  itemFields: [
    { type: "text", name: "description", label: { labelText: "invoice.line.description.label" } },
    { type: "number", name: "amount" },
    { type: "number", name: "quantity" },
    { type: "computed", name: "total_amount", compute: ({ row }) => Number(row.amount) * Number(row.quantity) },
  ],
}
```

- **Inside a row, a field name in a rule means the field in the same row.** `visibleWhen: { field: "kind" }` in row 2 reads `lines.2.kind`. Write `/status` for a top-level field.
- Rows are drawn as cards. Add `table: { title, columns, rowLabel, removeLabel }` for a table with a header row (see `invoices/invoice-form-schema.ts`).
- For a layout neither gives, add `render` and place the fields yourself with `row.field("name")` (see `products/product-out-lines.tsx`).

## When the builder's own save is not enough

| Need | Use |
| --- | --- |
| Change the payload before sending | `transformPayload`, `extraPayload` |
| Check against live data (a balance, a due amount) | `validate`: return `{ fieldName: message }` to stop the save |
| Save somewhere else, or in several steps | `onSubmit`: you get the payload and save it yourself |
| An async step before saving (upload a file) | `preparePayload`: return `false` to cancel |
| Lay the fields out yourself | `children={(renderField) => ...}`; wrap each field in `VisibleFormField` |

## Outside a form

A toolbar or a dialog with one dropdown does not need a form. Use the controls with plain state:

```tsx
const [status, setStatus] = useState<string | null>(null);
<SelectInput id="status" value={status} onChange={(value) => setStatus(value as string | null)} options={statuses} />
```

`SelectInput` and `SelectBox` are in `components/controls/`, next to `DateInput` and `DateRangeInput`.

## Adding a field type

1. Add its config type to `FieldConfig` in `types.ts`.
2. Write a definition file in `fields/`. Copy `textarea.tsx` for a simple one.
3. Add it to the list in `fields/registry.ts`.

The form builder and the table filter both read the registry, so nothing else changes.

## Tests

The tests are in `tests/unit/form/builder/`. They run the real builder and fake only the network call, so a test sees the exact URL, method and payload.

- `real-form-payloads.test.tsx`, `invoice-form.test.tsx` and `product-forms.test.tsx` hold **payload snapshots** of real forms. If one changes, a form now sends something different to the API. Find out why before running `vitest -u`.
- `field-markup.test.tsx` holds **HTML snapshots** of every field type. A change there is a visible change.

Run them with `npx vitest run tests/unit/form`.

## Things that surprise people

- **A field's id is its name**, also inside rows (`lines.0.amount`). The end-to-end tests select fields this way. Use `idPrefix` on one form when two forms on a page share field names.
- **Number inputs hold text.** Use `z.coerce.number()` in the Zod schema.
- **A hidden `visibleWhen` field is not just hidden**: its value is written as `resetValue` (null by default), and that is what is sent.
- **Dates are local days.** The form holds a `Date`; convert it in Zod with `optionalDateOnly` or `nullableDateOnly` from `lib/validations/date-fields.ts`.
- **`mode="edit"` always sends PUT** to `{api}/{id}`, whatever `method` says.
