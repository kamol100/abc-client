# Client test workspace

This workspace specifies staff-side client management. Subscriber self-service is a separate feature.

Start with [CLIENT-001](CLIENT-001-client-management.md). Status: partially implemented; see [implementation status](IMPLEMENTATION.md) and [suite commands](../../clients/README.md). Remaining business/fixture blockers are explicit.

Workflow: investigate → specify → human review → implement → verify.

The ticket contains stable scenario IDs. Future specs should reference these IDs in test titles. Implement one scenario group at a time; update the ticket with spec paths and execution evidence. Do not mark a scenario covered because a similar unit test exists.

Suggested future files under `tests/e2e/clients/`: `list.spec.ts`, `create-edit.spec.ts`, `access.spec.ts`, `activation.spec.ts`, `operations.spec.ts`, `images-map.spec.ts`, and `billing-links.spec.ts`. These are planned paths, not existing tests.
