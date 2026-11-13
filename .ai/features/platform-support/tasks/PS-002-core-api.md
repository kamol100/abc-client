# PS-002 — Persistence, issues, chat and conversion

Status: not started
Repository: isp-backend
Depends on: PS-001 complete.

## Goal

Implement the thread/message/read-state/idempotency schemas and core requester/platform APIs in 02-data-and-api.md. PS-003 owns attachments; PS-004 owns summaries/read endpoints/notification delivery. Register future routes only when they have real authorized implementations; text-only functionality is a valid incremental boundary, not feature completion.

## Work

- Add non-destructive migrations, models, factories, resources, FormRequests, thin controllers, visibility query services and transaction-based lifecycle services. Use project envelope/filter/pagination conventions. Keep DB keys internal and public IDs UUID strings.
- Implement requester own/reseller/company lists, detail, create, messages, own/team replies, resolve/reopen/team transitions and conversion. Implement platform list/detail/messages/reply/status/assignment/eligible-assignee dropdown/conversion. Return per-record abilities using PS-001 policy.
- Enforce server ownership stamps on every create, including platform replies and converted issues. Query children only under authorized parents. Retain tenant/reseller traits; implement permission-aware company-wide lookup deliberately instead of globally changing reseller binding.
- Return minimal tenant/reseller/requester identity in platform resources. Resolve User/Company queries with trusted parent ownership predicates; User is not automatically tenant-scoped. Search/filter/count must not leak other scopes.
- Enforce status/version/idempotency contracts. Same message request replay returns the committed message; different payload = 409. Allocate message sequence under row lock; unique constraints protect active chats and one conversion. Assignment choices only include eligible platform agents.
- Implement bounded latest/older/newer windows. Preserve ascending display order and drain all delta pages. No full-thread payload in every poll, and no message edits/deletes.
- Preserve history when identities are deleted/deactivated; integrate deletion guards/archival decisions without changing legacy ticket semantics. Reference generation must be independent of legacy ticket sequences.

## Acceptance

- PS-002-A: tenant/reseller User creates an issue or starts/resumes exactly one active chat; owner/author cannot be forged. Simultaneous starts are constrained at DB level. No-role/owner users do not require Staff.
- PS-002-B: every list/detail/message/action implements PS-001 scopes, including foreign known UUIDs and same-company sibling resellers. Platform reply stores the requester's company ownership.
- PS-002-C: two clients replying/retrying cannot duplicate sequence or message; conflict payload and stale lifecycle version return 409. Cursor windows with more than 100 unseen messages omit none and duplicate none after client deduplication.
- PS-002-D: chat conversion creates one issue with original owner and immutable source link, makes chat read-only, releases active key and preserves history/images by reference. Retry/concurrent conversion cannot create a second issue.
- PS-002-E: lifecycle transitions match the contract; closed sends fail; converted chats cannot reopen; source/target authorization is independent. Source chat visibility is never inherited merely through a link.
- PS-002-F: platform agents see tenant name/domain, requester and reseller identity; unprivileged company-1 users cannot read it. Assignment cannot target tenant staff or an ineligible/deactivated agent.
- PS-002-G: API values and envelope documented with actual fixture examples for PS-005/006. Existing tickets/customer flows have no product-code changes.

## Verification and handoff

Run focused Pest and changed-file Pint/PHPStan. Use SQLite constraints/service tests for retry races; SQLite alone does not prove production MySQL lock behavior. Document that limitation and include a reviewed database-specific concurrency test plan for PS-009 without using live tenant data. Do not alter production DBs. Record actual resources/envelopes and route names in the contract if an unavoidable adjustment is needed, updating dependent specs consistently.

## Implementation record

Changed files: pending. Commands/results: pending. Acceptance evidence: pending. Remaining blockers: pending.
