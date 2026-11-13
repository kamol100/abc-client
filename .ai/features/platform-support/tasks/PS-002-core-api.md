# PS-002 — Persistence, issues, chat and conversion

Status: reviewable
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

Status is reviewable. PS-003 was not started.

Changed files, isp-backend:

- Migration `database/migrations/2026_11_13_150000_create_platform_support_tables.php`; models, factories, enums, FormRequests, resources, `PlatformSupportThreadController`, `PlatformSupportAdminThreadController`, `PlatformSupportPrivateCache`.
- Services: query, lifecycle, message window, presenter, assignees, identity, reference generator, exception. Inbox audit is deduped for 60 seconds.
- Integration: `routes/api.php`, `bootstrap/app.php`, `UserObserver`, `CompanyObserver`, `StaffObserver`, `StaffController::destroy`, `CompanyTenantExportPurgeService::purge`, `ResellerTenantExportPurgeService::purge`.
- Tests: `tests/Feature/PlatformSupportCoreTest.php` and assertion updates in `tests/Feature/PlatformSupportAuthorizationTest.php` for routes that no longer return 204.

Changed files, shadcn-client: this task, `02-data-and-api.md`, `README.md`, the PS-001 remaining-blocker sentence, and the PS-009 MySQL plan. No application code.

Commands and results, 2026-11-13, SQLite `:memory:` only:

- `scripts/ai/backend-test tests/Feature/PlatformSupportCoreTest.php tests/Feature/PlatformSupportAuthorizationTest.php` — 20 passed, 357 assertions.
- `scripts/ai/lint` on the changed PHP files — Pint passed.
- `scripts/ai/analyse` on the new platform-support code, observers, and company purge, plus `ClientAccountResource.php` so the existing resource-property ignore matches — no errors.
- `scripts/ai/analyse` on `StaffController.php` and `ResellerTenantExportPurgeService.php` still reports pre-existing errors: `$user` might be undefined and `Model::$id` in staff pagination, and `if ($userId)` always true inside the reseller export query. Those lines were not part of this change. Pint only adjusted import order and one concatenation space in `StaffController`.
- No MySQL migrate, seed, `update:permission`, package install, or push.

Acceptance evidence is `tests/Feature/PlatformSupportCoreTest.php` unless noted.

- PS-002-A: a user with no role and no Staff creates an issue. Forged `company_id`, `reseller_id`, `requester_user_id`, and `author_side` are 422 and write no row. A second issue is a new uuid. One open chat replays the same request, and a new request id returns `resumed: true`, `message: null`, and `draft_id` without storing the body. A second insert with the same `active_chat_key` throws `QueryException`. Two overlapping HTTP transactions were not run.
- PS-002-B: a sibling reseller and another company receive 404. A colleague's own list is empty and the exact-reseller list contains the thread. Team reply stores requester side and the thread's company and reseller. A company reader sees the company list, not the own list, and cannot convert the colleague's chat. An unknown reseller uuid is 404. A platform reply stores the requester's company and reseller, and the landlord tenant is still 1 afterward.
- PS-002-C: the same reply request returns the same message. A different body with the same id is 409 `idempotency_conflict`. A duplicate sequence insert throws `QueryException`. Draining `after_sequence=0` in pages of 100 returns sequences 1 through 105 in order with no skips. Latest is 56–105. `before_sequence=0` and combined before+after are 422. Stale `expected_version` is 409 and does not change the row. Concurrent clients were not run.
- PS-002-D: an empty chat convert is 422 `empty_chat`. A chat with one message converts once to an issue with the same requester, `source_chat_id`, sequence 0, and no copied messages. The chat is `converted` and its active key is null. The same payload replays that issue. A different subject is 409. A different request id is 409 `already_converted`. Images are not stored; a non-empty `attachment_tokens` array is 422 `attachments_unavailable`.
- PS-002-E: own resolve moves an issue to `resolved` and bumps version. A requester reply on that resolved issue returns it to `open`. A platform reply moves it to `waiting_for_requester`. A converted chat rejects reply with 409 `closed` and reopen with 409 `invalid_transition`. The converted chat exposes `linked_issue_uuid` and `can_reply`/`can_reopen` false. The full transition matrix, and a user who can see an issue but not its source chat, were not separate fixtures.
- PS-002-F: admin detail includes company name and domain, requester name, and reseller name. A tenant user and a platform user with `status` 0 are 422 `ineligible_assignee` and are absent from the dropdown. An eligible agent can be assigned and appears in the dropdown. An ordinary company-1 user receives 403 on admin detail and 404 on the requester route for that thread.
- PS-002-G: the create, list, window, and error envelopes are recorded in `02-data-and-api.md` under "PS-002 shipped behavior". Both core tests assert `tickets` count stays 0. No ticket controller, model, or route was edited.

Remaining blockers:

- Read cursors, summaries, notifications, and rate limits stay with PS-004. Summary and read routes are still 204. PS-003 replaced the upload and attachment 204 stubs.
- SQLite does not prove InnoDB lock behavior. The disposable MySQL plan is in PS-009 and was not executed.
- `User.status = 0` is rejected for assignment and is still not a global lock.
- Company purge deletes that tenant's support rows so the existing user delete can proceed. Reseller purge leaves the thread and its `reseller_id` after the reseller row is gone. Ordinary user and company deletes throw `platform_support.history_retained`.
- The migration has run only inside SQLite tests. Applying it to a non-test database needs approval.
