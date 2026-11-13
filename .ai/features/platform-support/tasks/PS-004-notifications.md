# PS-004 — Read state, polling summaries and in-app notifications

Status: not started
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

Changed files: pending. Commands/results: pending. Acceptance evidence: pending. Remaining blockers: pending.
