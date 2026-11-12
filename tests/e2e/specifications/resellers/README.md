# Reseller test workspace

Start with [RESELLER-001](RESELLER-001-reseller-management.md). Investigation complete; draft ready for review; no tests implemented.

Workflow: investigate → specify → review → implement → verify. Future specs under `tests/e2e/resellers/`: `list.spec.ts`, `create-edit.spec.ts`, `packages.spec.ts`, `settings-images.spec.ts`, `recharge.spec.ts`, `impersonation.spec.ts`, `access.spec.ts`, `export-purge.spec.ts`.

These are planned files. Reference scenario IDs in test titles and record evidence per case. Use disposable data for purge/import and separate mutable wallet/package fixtures per worker.
