# Network test workspace

Start with [NETWORK-001](NETWORK-001-network-management.md). Investigation complete; draft ready for business review; no tests implemented.

Workflow: investigate → specify → review → implement → verify. Planned specs under `tests/e2e/networks/`: `list.spec.ts`, `create-edit.spec.ts`, `connection.spec.ts`, `access.spec.ts`, `dependencies.spec.ts`.

Reference scenario IDs in test titles and record evidence per case. Network operations must use a controlled backend router adapter, synthetic credentials and isolated queue/data; browser network mocking alone cannot intercept server-side router calls.
