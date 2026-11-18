# PS-004 — Read state, polling summaries and in-app notifications

Status: reviewable
Repositories: isp-backend; shadcn-client notification catalog translations/types.
Depends on: PS-002 and PS-003 complete.

## Goal

Provide accurate per-reader unread state and actionable notifications without sockets. Do not reuse legacy Ticket notification events.

## Work

- Implement requester/platform read and summary routes. Use monotonic sequences; reads are per user, never globally clear another reader's unread. Counts exclude the actor's own messages. Read marking only follows a visible successfully rendered message window. Status/assignment/conversion produce workflow notifications, not fictional unread message counts.
- Add platform-support-specific events: issue created, chat started, message received, assignment changed, status changed and chat converted. Use stable event keys tied to message/conversion/status version, an after-commit dispatch/outbox-equivalent retry strategy and existing notification services where compatible. New events default to in-app only; do not accidentally inherit enabled SMS/Telegram/email channels.
- Derive recipients from current permissions and ownership. Platform event audience: eligible platform users who can access the inbox/detail; assignment narrows attention but not legal visibility. Requester event audience: requester and currently authorized scope readers, excluding actor; add reply notification only to actual readable thread audiences. Avoid fan-out to every tenant or every reseller by company id alone.
- Implement recipient resolution for the platform company separately from a thread's source company. Store platform recipients' notification ownership under the platform company and safe link metadata; tenant recipients under the source company. Jobs use restoring tenant contexts. Recheck access when displaying notification lists/counts/links, so revoked access cannot leak old subject snippets.
- Keep conversation unread summaries independent of optional general notifications.access/settings. Every requester can see support unread even if their role lacks the app's general notification-bell permission. General notification preferences may mute optional toast/bell delivery, not hide actual conversation unread state. Keep existing notification center behavior compatible.
- Include company/requester summaries in authorized platform events to support quick triage, not image bytes, full message bodies or sensitive page query strings. Dispatch failure is observable and retryable without resending/duplicating message creation.
- Apply rate limits per actor and company with platform target context where appropriate: initial defaults uploads 20/min/user, messages 60/min/user, new issues/chats/conversions 10/min/user, read/list requests 120/min/user. Configurable module-only ceilings; return 429/Retry-After. Ensure normal foreground polling fits these limits. No punitive account blocking or cross-tenant shared throttle key.

## Acceptance

- PS-004-A: two users/devices have independent monotonic read state; own sent messages do not become unread; new permission grants/revocations change summaries correctly.
- PS-004-B: platform inbox receives an event for new tenant/reseller requests and replies; tenant requester receives platform replies; own actions do not self-notify. No event crosses to an unrelated tenant/reseller.
- PS-004-C: repeated mutation request and repeated job delivery do not duplicate notifications. Message commits survive queue failure with recoverable pending delivery. A mixed-company worker run restores its previous tenant after each job.
- PS-004-D: counts and notification payloads enforce all optional scope policies; revoking access hides historical notification metadata. Support unread works without general notifications.access.
- PS-004-E: no socket implementation or email/SMS/Telegram delivery introduced. Limits and Retry-After are deterministic under tests and allow the planned polling intervals.

## Verification and handoff

Pest notification fake/queue failure/duplicate delivery/isolation tests plus focused frontend catalog/i18n tests. Record queue-worker prerequisites without claiming notifications are delivered when no worker ran. PS-005/006 implement polling consumers.

## Implementation record

Status of this task is reviewable. PS-005 was not started.

Changed files:

- isp-backend: `config/platform-support.php`; migration `2026_11_13_160000_create_platform_support_notification_outbox.php`; `PlatformSupportNotificationOutbox`; `ThrottlePlatformSupport`; `ReadPlatformSupportThreadRequest`; `PlatformSupportReads`; `PlatformSupportSummary`; `PlatformSupportNotificationAudience`; `PlatformSupportNotifier`; `PlatformSupportNotificationDelivery`; `PlatformSupportNotificationGate`; `DeliverPlatformSupportNotificationJob`; `DispatchPlatformSupportNotifications`; `NotificationEvent`; `NotificationService`; `NotificationResource`; `NotificationController`; `PlatformSupportLifecycle`; `PlatformSupportIdentity`; both thread controllers; `routes/api.php`; `bootstrap/app.php`; `docs/notifications.md`; `PlatformSupportNotificationTest`; assertion updates in `PlatformSupportAuthorizationTest` and `NotificationDispatchTest`. Deleted `PlatformSupportAuthorizationController` because summary and read moved to the thread controllers.
- shadcn-client: `components/notifications/notification-catalog.ts`; `notification-list.tsx`; `notification-column.tsx`; `public/lang/en.json`; `public/lang/bn.json`; `tests/unit/notifications/notification-catalog.test.ts`; this task; `02-data-and-api.md`; the feature README.

Commands and results:

- `scripts/ai/backend-test tests/Feature/PlatformSupportNotificationTest.php tests/Feature/PlatformSupportCoreTest.php tests/Feature/PlatformSupportImageTest.php tests/Feature/PlatformSupportAuthorizationTest.php tests/Feature/NotificationDispatchTest.php` — 49 passed, 754 assertions, before the chat-start test was added.
- `scripts/ai/backend-test tests/Feature/PlatformSupportNotificationTest.php` — 8 passed, 180 assertions, after that test was added.
- `scripts/ai/check` on the changed application PHP — Pint passed and PHPStan reported no errors. The migration, Pest files, and `docs/notifications.md` were not passed to PHPStan. `vendor/bin/pint --test tests/Feature/PlatformSupportNotificationTest.php` passed.
- `npx vitest run tests/unit/notifications/notification-catalog.test.ts tests/unit/notifications/notification-bell.test.tsx` — 2 files, 11 passed.
- `scripts/ai/typecheck` — exited 0 with no output.
- `scripts/ai/status` and `scripts/ai/diff` inspected after the edits.

Acceptance evidence:

- PS-004-A: `PlatformSupportNotificationTest` keeps separate cursors, leaves the author's own messages out of unread, clamps a read to the thread maximum, rejects `reader_user_id` without rewinding, and returns 403 for a company summary after `platform-support.company.access` is revoked.
- PS-004-B: the same file shows an issue event for the platform agent and the authorized reseller reader, a platform reply for the owner, no self-notification, and no row for the sibling reseller, the no-scope user, or another company. Chat start, assignment attention, and conversion are covered by the later test. Conversion leaves the new issue sequence at 0 and does not notify the actor.
- PS-004-C: replay does not add a second outbox row or thread. A second `handle()` does not add a second notification. A throwing delivery leaves the message committed and the outbox `failed`; a later `handle()` of that row delivers one notification. With the queue faked, the recovery command re-dispatches pending rows older than 30 seconds and the pushed job count goes from 2 to 4. The job restores the previous tenant.
- PS-004-D: a muted message preference leaves the bell empty and `unread_messages` at 1. The owner can read that summary without `notifications.access` and receives 403 from the notification index. Revoking `platform-support.company.access` removes the reference and subject from the remaining reader's notification JSON. The read-state row remains.
- PS-004-E: the tests assert `NullNotificationBroadcaster`, no mail, and no `communication_logs` or `telegram_notifications` rows. No socket was added. A second create in the same minute returns 429 `platform_support.rate_limited` with `Retry-After: 60` and `Cache-Control` containing `no-store`. Another company can still create. After 61 seconds the first user can create again. The read ceiling of 120 accepts 13 summary requests. The planned poll rates are below that ceiling and are recorded in `config/platform-support.php`.

Remaining blockers:

- No `queue:work` process ran. Pest uses the sync queue, `Queue::fake()`, and direct `handle()`. Production delivery still needs `php artisan queue:work --queue=notifications` and the scheduled `platform-support:deliver-notifications` command. Do not treat the tests as proof that a worker delivered a row.
- SQLite does not prove the MySQL row locks or the unique-key behavior under concurrent writes. That stays in PS-009. The new migration ran only through Pest on SQLite `:memory:`.
- The global API throttle is still 60 per minute. The module read ceiling is 120. Status and assignment are outside the four module buckets.
- The catalog links point at `/platform-support/issues/{uuid}`, `/platform-support/chats/{uuid}`, and `/platform-support-admin/threads/{uuid}`. Those pages are PS-005 and PS-006 and do not exist yet.
- `PrivateImageStorage::maxKilobytes()` is still 2048, and this PHP CLI still reports `upload_max_filesize=2M` and `memory_limit=128M`. Those are PS-003 limits and were not changed.
- No package install, MySQL command, browser session, or push. The full frontend Vitest suite was not run for this task. PS-003 recorded unrelated failures in that suite.
