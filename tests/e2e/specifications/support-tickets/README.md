# Support-ticket test workspace

Start with [SUPPORT-001](SUPPORT-001-support-tickets.md). Investigation complete; specification still pending review. Executable coverage is `npm run test:e2e:tickets` (`playwright.support-tickets.config.ts`). Review-blocked scenarios stay unimplemented.

Scope includes staff support management and subscriber ticket ownership/conversation flows. Workflow: investigate → specify → review → implement → verify.

Proposed specs under `tests/e2e/support-tickets/`: `list.spec.ts`, `create-edit.spec.ts`, `status-assignee.spec.ts`, `conversation.spec.ts`, `subscriber.spec.ts`, `access.spec.ts`. Reference scenario IDs in test titles and record execution evidence. These are future paths.
