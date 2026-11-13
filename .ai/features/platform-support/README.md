# Platform Help and Support — implementation specification

Status: PS-001 through PS-007 are reviewable. PS-008 onward are not started.
Version: 1.0 · 13 November 2026

This folder is the implementation source of truth for the new platform-support feature. It supersedes alternatives in `.ai/support-architecture.md`. The existing `tickets` / `ticket_messages` system is preserved for tenants and their customers. Do not extend it to implement this feature.

## Visual design reference

Review the [standalone HTML prototype](../../../design/platform-support/index.html) and its [preview instructions](../../../design/platform-support/README.md) before implementing screens. It demonstrates the proposed Help Centre, issues, chat/images, conversion and platform inbox with English/Bangla and theme/role switches. All data and permissions in it are simulated; the contracts below govern production behavior. No implementation task is completed merely by producing the prototype.

## Read first

1. [Product requirements](00-product.md): approved decisions, defaults, flows and exclusions.
2. [Authorization contract](01-authorization.md): capabilities, visibility and tenant boundaries.
3. [Data and API contract](02-data-and-api.md): proposed schema, routes, pagination and lifecycle.
4. [Source evidence](source-evidence.md): existing code to inspect before implementation.

All models, routes, permission names and paths described as proposed are new contracts, not claims that they already exist. Backend work belongs in `/Users/kamol/Documents/www/isp-backend`; frontend work belongs in `/Users/kamol/Documents/www/shadcn-client`. Keep this specification accessible to the implementing agent in either repository.

## Execution order

- [PS-001 — authorization and support availability](tasks/PS-001-authorization.md)
- [PS-002 — conversation persistence and core API](tasks/PS-002-core-api.md)
- [PS-003 — private image attachments](tasks/PS-003-images.md)
- [PS-004 — read state, polling summaries and notifications](tasks/PS-004-notifications.md)
- [PS-005 — tenant and reseller support UI](tasks/PS-005-requester-ui.md)
- [PS-006 — platform support inbox](tasks/PS-006-platform-inbox.md)
- [PS-007 — bilingual Markdown and content authorization](tasks/PS-007-documentation.md)
- [PS-008 — contextual Help Centre, FAQ, video and search UI](tasks/PS-008-help-centre.md)
- [PS-009 — end-to-end acceptance and release readiness](tasks/PS-009-acceptance.md)

Implement one task at a time, in this order. Dependencies must pass their acceptance criteria before downstream work uses their contracts. Do not mark an upstream task complete with production placeholders, fabricated endpoints, always-true permissions or mocked authorization. Each task starts as **not started**; change its status only with evidence in its Implementation record. Automated tests may of course use controlled fixtures/fakes.

## Agent execution protocol

Read both relevant AGENTS.md files and task workflows. Before changes, inspect `scripts/ai/status` in each repository being edited. Read canonical `isp-backend/docs/architecture/multi-tenancy.md`, the frontend architecture rule, and nearest source twins. Follow existing layers and wrappers. No edits to legacy ticket product code, subscriber pages or shadcn primitives are authorized by these specs.

Keep public API envelopes compatible. Every new endpoint needs server authorization; permissions in the UI only control presentation. New dependencies, package installs, production settings, migrations against non-test databases, deploy and git push still require the applicable human approval. Writing this spec does not authorize those operations. Ordinary implementation, local checks and SQLite test migrations proceed under repository rules.

Maintain English/Bangla UI keys and update content editions together. Use MyButton, MyDrawer/MyDialog, Card, DataTable, FormBuilder/AccordionFormBuilder, useApiQuery and useApiMutation. Extend project components minimally if they cannot handle image attachments; do not silently add another form framework.

For each task, record changed files, executed commands/results, acceptance IDs, unverified scenarios and remaining blockers. Update `.ai/report.md` in every repository actually changed. Run appropriate backend Pest + changed-file Pint/PHPStan checks, or frontend `scripts/ai/frontend-check`, as applicable. Do not claim passes without execution. Broken existing frontend lint is not part of this feature. Inspect diff/status afterwards and leave unrelated changes untouched.

## Suggested implementation prompt

> Implement PS-001 from `.ai/features/platform-support/README.md`. Read the product, authorization and API contracts and the task's source references. Work only on this task and its necessary integration points. Follow repository AGENTS.md, preserve the existing tenant/customer ticket system, implement the acceptance criteria, run appropriate checks, and record results and blockers. Stop after this task is reviewable; do not begin PS-002 automatically.

For later steps substitute the task ID. The implementing tool should read this folder, not rely on this chat.
