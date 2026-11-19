# Products test workspace

[PRODUCTS-001](PRODUCTS-001.md) contains the reviewed contracts, user-approved invoice decisions, implemented acceptance groups and verification limits.

Run `npm run test:e2e:products`. See the [suite instructions](../../products/README.md), [source evidence](source-evidence.md), [executed evidence](evidence/run.json), and [shared coverage policy](../COVERAGE-POLICY.md).

The executable cases cover all six product routes. Real database concurrency remains a separate blocked case under the backend's SQLite-only test policy; the serialized fixture is not presented as proof of MySQL lock behavior.
