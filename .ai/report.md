## Summary

Product report totals now sit on the right of the Product In and Product Out buttons, and show only quantity and total price for the current list.

## Frontend

- Quantity and total price are inline chips, the same height as the Product In and Product Out buttons, aligned to the right.
- Product In showed quantity 2 and ৳100, matching the row. Product Out showed quantity 1 and ৳70, matching that row.
- The Product In report page (`/reports/product-in`) shows the same pair at the top right, with no toggle.
- Product movement details read `reports.quantity` and `reports.total_price`.

## Checks

- `scripts/ai/typecheck`: passed.
- Browser at `http://app.isp.test/products/reports` and `http://app.isp.test/reports/product-in`.

## Notes

- Earlier uncommitted product-code column work is still in `product-reports-table.tsx` and `product-movement-type.ts`.
- Product detail movement pages were not opened in the browser.
