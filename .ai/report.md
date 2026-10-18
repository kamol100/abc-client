## Summary

The reseller new-client link opens `/reports/reseller-clients?created_at=this_month`, and the list request now includes `created_at=this_month`. The company client page still passes that value from the server. The reseller page was not, so the table reads the same value from the browser URL before it calls `resellers/clients`.

## Files

- `components/clients/client-table.tsx`
- `app/(dashboard)/reports/reseller-clients/page.tsx`
- `tests/unit/clients/reseller-client-table.test.tsx`

## Checks

`tests/unit/clients/reseller-client-table.test.tsx` passed. On `http://app.isp.test/reports/reseller-clients?created_at=this_month` the page shows "New clients this month" and "Show all clients", which is the same state that adds `created_at=this_month` to the list request. `/clients?created_at=this_month` still shows that notice.
