## Summary

The histories filter now has a client dropdown and a date range on the Date column, matching the invoice filter.

## Frontend

- Client uses `/dropdown-clients` and sends `client_id`.
- Date is a range on `created_at` and sends `from,to`.
- The filter uses two rows so the four fields stay readable.

## Checks

- `scripts/ai/typecheck`: passed.
- Browser at `http://app.isp.test/histories`: choosing Testuser02 narrowed the list from 10 rows to that client's 2 rows. A 1–9 Nov 2026 range on top of that client returned 0 rows. Those client rows are dated 30 Oct 2026.

## Notes

- Existing uncommitted history-column, history-type, and unit-test changes were already in the tree and were left as they were.
