## Summary

Product report totals now sit on the right of the Product In and Product Out buttons, and show only quantity and total price for the current list.

## Frontend

- Quantity and total price are inline chips, the same height as the Product In and Product Out buttons, aligned to the right.
- Product In showed quantity 2 and ৳100, matching the row. Product Out showed quantity 1 and ৳70, matching that row.
- The Product In report page (`/reports/product-in`) shows the same pair at the top right, with no toggle.
- Product In and Product Out details use the same chips on the right of the title. The back control is a primary icon button and still goes to `/products`.

## Checks

- `scripts/ai/typecheck`: passed.
- Browser at `http://app.isp.test/products/in/a2eca0c5-3c8b-463d-a466-ab24307e610f`: chips showed Quantity 2 and Total price ৳100. The back icon returned to `/products`.

## Notes

- Earlier uncommitted product-code column work is still in `product-reports-table.tsx` and `product-movement-type.ts`.
- The first movement column shows `product.product_code` (PRO1 on Product In Details). Product Out uses the same column.

## SMS reminder notification

A missing client phone on an invoice due reminder now shows in the notification bell.

- New invoice event `sms_not_sent`: "Invoice {{invoice_no}} for {{client_name}} could not be sent because the client has no phone number."
- The same title and message are in English and Bangla. The settings list includes the event under Invoice.
- `npx vitest run tests/unit/notifications/notification-catalog.test.ts`: 6 passed.
- Unrelated product-page edits in this working tree were left as they were.
