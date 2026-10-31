## Summary

On `/products/reports`, only Product Reports stays selected. `/products` no longer matches that path, because a longer sibling menu url wins.

## Frontend

- `components/nav-main.tsx` — sibling links use the longest matching url. `/products` still highlights for `/products` and nested product pages such as `/products/12`.
- `tests/unit/menu/menu-path-active.test.ts`

The earlier sidebar reorder in `hooks/use-menu-items.ts` is still in this working tree.

## Checks

- `npx vitest run tests/unit/menu/menu-path-active.test.ts` — 2 passed
- `scripts/ai/typecheck` — passed
- Browser: `/products/reports` highlights only Product Reports. `/products` highlights only Products.

## Unrelated working tree

None beyond the menu reorder from this session.
