## Summary

The products table now filters by product ID, name, or description, plus category, unit type, and has serial.

## Frontend

- Any search sends `any` and matches product ID, name, and description.
- Category uses `/dropdown-product-categories` and sends `product_category_id`.
- Unit type uses `/dropdown-unit-types` and sends `unit_type_id`.
- Has serial sends `has_serial` as `1` or `0`.
- The four fields sit on two rows so they stay visible in the toolbar.

## Checks

- `scripts/ai/typecheck`: passed.
- `scripts/ai/test`: 21 failed across 10 files (maps, client dashboard, reseller filters, date picker, column visibility, menu, and pay). None are product filter tests.
- Browser at `http://app.isp.test/products`: `zzz` returned no rows, `PRO1` returned Test Product. Has serial No returned no rows; Yes returned PRO1. Category `instrument` kept PRO1. Unit type Meter with that category and Yes returned no rows.

## Notes

- The product list API did not accept these query params before this change. The matching filters were added in `isp-backend`.
- One category option named `onu` renders as `key 'onu (en)' returned an object instead of string.` That label was already stored as an object and was left as it was.
