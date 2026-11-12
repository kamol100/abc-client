## Summary

The client billing card shows a fixed SMS icon after the discount row. The icon starts generic, then updates from `GET /clients/{id}/sms-status` without being part of the client list request. Clicking it opens the invoice-due details, and the reminder when the API includes one.

## Checks

- `scripts/ai/typecheck`: passed.
- `npx vitest run tests/unit/clients/client-sms-status.test.tsx tests/unit/clients/client-name-phone-cell.test.tsx`: 18 passed.
- `scripts/ai/test`: 615 passed, 21 failed. The failures are in date pickers, the admin menu, pay, and reseller client filters. They do not mention the SMS indicator, and those screens were not changed.
- On `http://vp.isp.test`, the client list rendered without an SMS request. Opening Farhana Akter (`vp0006`, billing type manual) showed the generic SMS icon after Discount. Clicking it opened a popover with Invoice Due and “No SMS record for this month”. The icon size did not change.

## Tenant checklist

The status request uses the client id already shown on the page. It does not send `company_id` or `reseller_id`. Each client fetches its own status after the billing card is on screen.

## Left untouched

`playwright.config.ts`, `playwright/.auth/user.json`, and `tests/e2e/helpers/auth.ts` were already dirty.
