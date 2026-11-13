# Reseller test workspace

[RESELLER-001](RESELLER-001-reseller-management.md) is partially implemented in `tests/e2e/resellers/`. Use `npm run test:e2e:resellers`. The runner supports CP and MK without localhost login or shared auth files.

See [implementation status](IMPLEMENTATION.md) for every parent scenario, [execution evidence](EXECUTION.json) for the CP and MK runs, and [runner guidance](../../resellers/README.md) for what the suite does and does not change. Review remains pending. Username exclusion fails because the API ignores `username`. No successful create, package reassignment, recharge settlement, purge, or import is executed.
