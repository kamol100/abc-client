## Summary

The plan inspector no longer treats Core read routes as included when Core is off the plan. The dashboard stops requesting invoice lists that a Clients-only company cannot use.

## Frontend

- `plan-feature-matrix.tsx` uses the same rule as the API: a route is granted only when its feature is on the plan, and the expiry mode decides what remains after expiry.
- The “Kept · Core read” result and its copy were removed from `en.json` and `bn.json`.
- Top due invoices and zone dues require `dashboard-card.invoice`. Staff invoice collection uses that same permission, so a Clients-only session does not call those endpoints.

## Checks

- Typecheck: `scripts/ai/typecheck` passed.
- Vitest: `tests/unit/subscription/plan-feature-matrix.test.tsx` and `tests/unit/dashboard/dashboard-visibility.test.ts` — 10 passed.
- Browser on `http://cp.isp.test` as `cp`: sidebar is Dashboard, Clients, Networks, Zones, Maps, and Subscription. Clients opens and shows the empty table. Opening `/roles` directly no longer lists roles.

## Security

The screen still only hides actions. The API is what returns 402. No `company_id` is sent.
