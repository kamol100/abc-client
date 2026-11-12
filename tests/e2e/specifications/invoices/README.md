# Invoice test workspace

[INVOICE-001](INVOICE-001-invoice-management.md) is partially implemented in `tests/e2e/invoices/`. Use `npm run test:e2e:invoices` or the all-suite `npm run test:e2e` command. The runner supports CP/MK without localhost login or shared auth files.

See [implementation status](IMPLEMENTATION.md) for every parent scenario and its remaining variants, [execution evidence](EXECUTION.json) for actual run results, and [runner guidance](../../invoices/README.md) for dataset prerequisites and limits. Financial decisions, controlled fixtures and restricted personas remain prerequisites; no >90% coverage claim is made.
