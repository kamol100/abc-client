## Summary

The stock-in and stock-out buttons pass the numeric product id. Each form selects that product on the first line.

## Files changed

- `components/products/product-column.tsx`
- `components/products/product-type.ts`
- `app/(dashboard)/products/in/page.tsx`
- `components/products/product-in-form.tsx`
- `components/products/product-in-type.ts`
- `app/(dashboard)/products/out/page.tsx`
- `components/products/product-out-form.tsx`
- `tests/unit/products/product-in-product-id.test.ts`

Backend:

- `app/Http/Resources/ProductResource.php`
- `tests/Feature/ProductControllerTest.php`

## Behavior

The public `id` stays the UUID used by edit and delete. `product_id` is the numeric id the dropdown uses. Stock-in opens `/products/in?product_id={product_id}` and stock-out opens `/products/out?product_id={product_id}`. The first line starts with that product selected.

## Tests

`scripts/ai/backend-test tests/Feature/ProductControllerTest.php --filter="lists products"` passed.

`npx vitest run tests/unit/products/product-in-product-id.test.ts` passed earlier (2 tests).

`scripts/ai/typecheck` passed.

Signed in and opened `/products`. The table stayed on its loading skeleton, so the stock-in button was not clicked in the browser.
