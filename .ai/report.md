## Summary

Salary and deduction row delete buttons now line up with the label and value inputs. Validation messages under those fields no longer pull the button down.

## Files

- `components/form-wrapper/form-builder.tsx`

## Checks

On `http://vp.isp.test/salaries/create`, added two salary items and one deduction, then left required fields empty. With "Item label is required" and "Item value is required" visible, each trash button’s top and bottom matched the inputs (0px offset) on desktop and on a 390px-wide viewport.

## Git

Uncommitted. Unrelated working-tree changes left untouched: `components/expenses/expense-filter-schema.ts`, `public/lang/en.json`, `public/lang/bn.json`.
