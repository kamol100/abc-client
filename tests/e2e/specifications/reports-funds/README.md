# Reports Funds test workspace

[REPORTS-FUNDS-001](REPORTS-FUNDS-001.md) has twelve reviewed acceptance scenarios, all passing in the recorded Chromium run. Run `npm run test:e2e:fund-reports`; see the
[runner instructions](../../reports-funds/README.md),
[reviewed source evidence](source-evidence.md), and [execution evidence](evidence/run.json).

The suite uses disposable Laravel SQLite data and a scratch Next.js app with
registered CP/MK/APP hosts. No local business funds or real transfers are changed.
The coverage register records actual runs; the global coverage checker still has
an unrelated baseline mismatch for three Help Management routes.
