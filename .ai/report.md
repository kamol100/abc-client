## Summary

Selecting an agent on the reseller form fills the commission field from that agent's commission. Changing the agent updates commission. Clearing the agent still hides the field and resets it. The saved reseller commission stays in place on edit until the agent is changed, and the field stays editable. Count commission is unchanged by an agent change.

## Files changed

- `components/resellers/reseller-form-schema.ts`
- `components/form-wrapper/form-builder-type.ts`
- `components/form-wrapper/form-builder.tsx`
- `components/select-dropdown.tsx`
- `tests/unit/resellers/reseller-form-schema.test.ts`
- `tests/unit/resellers/reseller-form.test.tsx`

## Behavior

The agent dropdown already loads `/dropdown-agents`. That response now includes `commission`, and the dropdown keeps it on the option. The agent field uses `populate: [{ field: "commission", from: "commission" }]`, so a user selection copies that value into commission. No second request is made. Clearing still uses the existing `visibleWhen` reset.

## Tests

`scripts/ai/frontend-check`: typecheck passed, 18 files, 69 tests passed. ESLint was not run.

The reseller form was exercised in Vitest (select, change, clear, edit, and manual edit). It was not opened in the browser; no app server was running.
