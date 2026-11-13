# PS-009 — Integrated acceptance and release readiness

Status: not started
Repositories: shadcn-client and isp-backend
Depends on: PS-001–008 complete, or explicitly label any limited release partial.

## Goal

Prove the independent platform-support and Help Centre flows work across real authorized principals, with images and polling, while preserving tenant/customer tickets. This task creates tests, executes safe checks and records readiness; it does not authorize deployment or production mutations.

## Fixture personas

Use a disposable local/test dataset and fake external delivery adapters. Never use actual customers' images or production tickets. Required: platform administrator, selected-permission platform responder, platform read-only agent, ordinary company-1 staff without support-admin grants, ordinary tenant A owner without Staff, tenant A ordinary staff, tenant A company-wide reader/manager, tenant A reseller R1 staff/reader, sibling reseller R2 staff, parent/child reseller identities, tenant B staff, subscriber Client, no-role user, locked user, impersonated platform session. Include a plan without legacy support and a subscription-expired tenant. Create platform first in backend tests to avoid accidental company-1 tenants.

## Acceptance scenarios

- PS-E01: tenant owner and reseller staff open separate issues/chats from multiple app routes; reference and requester/tenant identity appear in app-tenant inbox. Their existing customer tickets remain separate and unchanged.
- PS-E02: no-role User and owner without Staff can send; anonymous/Client/locked principals denied; baseline support remains available without legacy tickets.access, notifications.access or the paid support feature and during subscription problems.
- PS-E03: own-only user cannot read colleague requests; explicit reseller reader sees exact R1 but not R2/parent/child; company reader sees own-company requests only; team reply/manage grant does not confer visibility alone. Removing permissions hides records/counts/images/old notifications on next request.
- PS-E04: tenant B known UUID/detail/message/image/cursor/filter attempts denied from tenant A in both directions. Prohibited company/reseller/requester/author fields cannot change ownership. Scope-transferred users lose old ownership access without migrating historical rows.
- PS-E05: platform administrator/responders can see permitted aggregate inbox data and source tenant/requester identity; ordinary company-1 staff and non-platform Super Admin denied. Read-only agents cannot send/upload/manage. Impersonation cannot retain platform powers.
- PS-E06: text-only, image-only and five-image messages work on issues/chats from requester and platform sides. 5 MiB exact boundary accepted, oversized/sixth/spoofed/corrupt/unsupported/oversized-dimension image rejected. Copied direct image URL still requires current authorization. No public image path, leaked token or shared cache.
- PS-E07: staged uploader/thread/draft/scope binding, expiration cleanup, partial upload failure and send rollback leave no partial messages or consumed valid stages. A lost success response/retry creates one message, one attachment set and one notification per intended recipient.
- PS-E08: two concurrent chat starts yield one active chat. Two conversions yield one issue. Original source history/images remain reachable only through independent authorization, not copied; converted chat is read-only and new issue follow-up is separate.
- PS-E09: resolve/reopen/closed/waiting/platform reply/team reply transitions match contract, stale expected_version returns 409 without lost update. Assignment targets eligible platform agents only.
- PS-E10: active chat catches up without duplicate/missing messages, including >100 unread delta messages and older-history pagination. Hidden/offline/closed panel stops relevant polling, reconnect catches up and 429 backs off. No socket connection or background 5-second loop.
- PS-E11: unread cursors independent between requester, colleague and platform agents/devices; own messages excluded; read only marks actually visible messages. All visible summary/list filters agree with detail permissions.
- PS-E12: under controlled healthy test clocks/network and a running worker, selected thread reflects a new message by the next 5-second poll + measured request time; foreground platform inbox reflects a new request by next 10-second poll + request time; closed requester badge by next 30-second poll + request time. Record actual times and do not claim delivery under a failed worker/network.
- PS-E13: transaction/job retry does not duplicate notifications; notification worker switches company context safely; optional notification preferences never remove actual thread unread. No SMS/email/Telegram or legacy ticket event produced.
- PS-E14: permitted en/bn articles/FAQs/videos render; language switch retains article; forbidden URL/search/snippet/related/media/RSC/client build output hides content. Invalid slug/locale traversal and dangerous Markdown URLs/HTML blocked. Missing/stale Bangla publication rejected.
- PS-E15: contextual help covers verified feature inventory; privileged action guides require action permission; platform guides hidden from tenant users. Optional video absence is honest; actual configured embed works. Sanitized page context never includes query strings, customer form values or credentials.
- PS-E16: mobile, desktop, keyboard-only, image viewer, scroll position, accessible error states, en/bn, dark/light and logout/impersonation cache reset all work. Stale/refetch failures cannot masquerade as empty inbox/successful delivery.
- PS-E17: run targeted legacy ticket/customer compatibility regression checks and notification/private-profile-image checks. No legacy endpoint/schema/query-key/permission behavior changed. General subscription restrictions remain intact.

## Checks and evidence

1. Run focused Pest and changed-file Pint/PHPStan; full backend tests only when safe/appropriate. All DB testing follows SQLite :memory: guards. A separate disposable integration environment is required to execute MySQL locking/concurrency; do not claim SQLite proves production locking. Retain a concrete concurrency test report or explicit unverified status.
2. Run help-content validator, relevant frontend unit tests and scripts/ai/frontend-check. Record existing unrelated failures; do not silently weaken them to pass.
3. Add a dedicated platform-support Playwright suite/config and specifications/register entries following current project runner conventions. Use memory/isolated auth, safe fixture IDs and synthetic images. The root runner discovers configs; verify collection without duplicated legacy support-ticket cases. This task explicitly authorizes e2e implementation, but execution requires the actual safe environment and accounts, not invented fixture flags.
4. Verify image and staged-upload transport end to end at the browser → Next → Laravel boundaries; JSON mocks alone do not prove payload limits, CSRF or private binary delivery.
5. Record each acceptance ID with implementation status, command/timestamp, fixture/environment, actual result, evidence file and limitations. Passing a slice does not mark the whole scenario passed. Store sanitized results under a dedicated implementation-owned evidence folder; never credentials, raw session storage or private message/image content.
6. Produce a readiness checklist: additive migrations/provisioning plan, support permission deployment order, worker/cleanup scheduling, private storage writability, image runtime encoders, proxy/PHP upload limits, content build/release process and rollback plan. Limit rollback to module routes/flags/additive code; do not drop collected conversations/images or revert legacy product tables. Configuration, migration execution outside tests, deployment and push still need applicable approval.

## Completion criteria

Every task has evidence for all its acceptance IDs, full supported feature content coverage is recorded, no unresolved cross-tenant/image authorization defect remains, and limitations/blockers are explicit. If video URLs are absent, text/FAQ functionality and embedding capability can pass while catalog entries remain not_configured; do not claim real videos were published. If optional release scope is partial, clearly say which tasks/content batches are incomplete. Update reports in both changed repositories; no automatic deploy.

## MySQL concurrency plan from PS-002

Status of this task stays not started. Do not run this plan against the application MySQL or any live tenant database.

Use a disposable MySQL database created for the test run. Two concurrent transactions, then assert:

- Two chat starts for the same company, reseller, and requester leave one open chat. The unique `active_chat_key` is the backstop. The second caller receives the existing chat with `resumed: true` and does not store the supplied body.
- Two conversions of that chat with different `client_request_id` values leave one issue. `source_chat_id` is unique. The loser is 409 `platform_support.already_converted`.
- Two replies on one thread receive contiguous sequences. `unique(thread_id, sequence)` rejects a duplicate. The parent row lock is what should serialize allocation; SQLite did not prove that lock.
- The same `client_request_id` and payload from two overlapping requests leaves one receipt and one message.

SQLite Pest already proves the unique constraints and the 409 mapping. Record the disposable database name, the two session timestamps, and the row counts. Do not copy tenant data into that database.

## Implementation record

Changed files: pending. Commands/results: pending. PS-E01–17 evidence: pending. Remaining blockers/release decisions: pending.
