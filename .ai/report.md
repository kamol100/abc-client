## Summary

The payments table client name now opens that client's details page.

## Frontend

- `components/payments/payment-column.tsx` renders the client name as a link to `/clients/view/{uuid}` when the user has `clients.show`.
- The link follows `client_view_open_on_new_tab`. Without permission, or when the payment has no client, the name stays plain text.
- `components/payments/payment-type.ts` accepts the client `uuid` on the payment row.

## Backend

- `PaymentResource` now includes `client.uuid`. The details route uses the client UUID, and the payment payload previously returned only the numeric client id.

## Checks

- Vitest: `tests/unit/payments/payment-column.test.tsx` — 4 passed.
- Pest: `PaymentsControllerTest` "shows a payment with client invoice zone relations" — passed.
- Browser on `http://app.isp.test/payments`: "Fabiola Von" links to `/clients/view/a2a9b8ce-1959-438c-ab86-3725ac3d5437` and that page loads as Client Details.

## Security

- The link is hidden without `clients.show`. The API still authorizes `clients.show`. `uuid` is the existing public client id, not a new tenant field.

## Left untouched

- Backend working tree already had unrelated staff and username-change files: `Staff.php`, `StaffResource.php`, `ChangeUsernameRequest.php`, `UniqueCompanyUsername.php`, `AuthChangeUsernameTest.php`.
