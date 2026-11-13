# PS-005 — Tenant and reseller support UI

Status: not started
Repository: shadcn-client
Depends on: PS-001–004 complete, verified API resources available.

## Goal

Make separate issues and direct chat accessible throughout the authenticated staff app for tenant and reseller users. Do not alter subscriber/customer ticket pages.

## Proposed locations

Thin pages under `app/(dashboard)/platform-support/page.tsx`, `issues/[id]/page.tsx`, `chats/[id]/page.tsx`; interactive code under `components/platform-support/`. One launcher/provider mounted once inside the existing authenticated AppProvider layout. Shared types/query-key helpers belong in the feature folder. Add independent navigation in hooks/use-menu-items.ts.

## Required behavior

- Persistent accessible Help/Support button with unread badge, desktop panel/mobile MyDrawer. Initially offers Report an issue, Chat with support and My requests; PS-008 supplies documentation content. Do not point Help to a nonexistent route while PS-008 is incomplete.
- Separate Issues/Chats lists with own scope default, optional exact-reseller/company selectors according to capabilities; filters, pagination, empty/loading/error/retry states. Lists use DataTable and established column/filter patterns. Details show reference/status, original requester, support replies and image history.
- Forms use FormBuilder infrastructure and Zod for subject/category/priority/message. Use existing private-image field UI as a pattern for a support-specific multi-image picker. If composer placement needs custom rendering, keep FormBuilder orchestration and extend only its necessary public capability. No new UI kit or arbitrary inline styles.
- Support five upload previews, byte/type validation feedback, progress/pending/failed status, remove-before-send, retry and authenticated image lightbox/download. Stage files through PS-003 adapter, keep tokens in memory, revoke local object URLs on unmount, and preserve drafts when upload/send fails. Do not claim sent until server acknowledgment. Failed one-file upload must not consume the other valid selections.
- Start/resume open chat without duplicate first messages. Use durable server idempotency IDs for a pending submit retained in component memory until resolved. A retry retains its ID; editing a failed pending payload intentionally starts a new ID and explains any prior ambiguous result by reconciling with server history before resending. Never use localStorage for tokens/images/message contents.
- Convert chat through a subject/category/priority form; show linked read-only history and links both ways. Resolve/reopen based on named permissions AND per-record abilities. Company/reseller viewers with read-only scope see no send/manage controls. Colleague replies go to team-messages route, not the own-reply endpoint.
- All UI strings, field labels, states, error codes and accessibility labels have en/bn keys. User content is escaped text, preserving newlines without rendering HTML. Support keyboard controls, focus restoration, responsive layout and light/dark themes. New messages must not steal focus or scroll a reader away from older history; show a New messages affordance.
- Keep support unread visible even if notifications.access or legacy tickets.access is absent. No paid feature lock on own platform support; no browser company-id checks for action authorization.

## Query behavior

Use useApiQuery/useApiMutation with public, server-verified identity/audience/scope/thread in query keys. Do not use browser IDs to authorize. Active thread: 5 seconds when panel/page visible and online; closed widget summary: 30 seconds; foreground list: 15 seconds. Override wrapper's refetchOnWindowFocus=false for support queries and refresh on reconnect. Stop on hidden tab, inaccessible record, logout or offline state; backoff on errors/429. Avoid mounting duplicate observers that create duplicate polling loops. No broad invalidation that repeatedly reloads full history.

Fetch latest 50 initially and older pages on demand. Poll after last delivered sequence, drain has_more pages, merge by message UUID, and advance only to last returned sequence. Update list/summary/query data after acknowledged mutation. Distinguish stable message history from incremental response payload; use a small feature hook/cache merge helper rather than replacing history with the delta. Mark read only through the latest message actually visible; do not mark off-screen appended messages read. Permission failures immediately hide cached private details, not merely a toast. Identity changes retain full-navigation/cache-clearing conventions.

## Acceptance

- PS-005-A: tenant owner/staff/reseller staff can open issues and chat anywhere in staff layout without tickets.access or notifications.access; no duplicate launcher.
- PS-005-B: own vs optional scopes, read-only colleague access and action abilities match backend; revoked access clears sensitive displayed history/images.
- PS-005-C: text, image-only and mixed messages work; max-five, failed-upload, send-retry, duplicate acknowledgment and reload-recovery states are correct in en/bn, mobile and both themes.
- PS-005-D: hidden/offline/closed views stop active-thread polling, focus/reconnect catches up, >100-message backlog drains with stable ordering/deduplication. Older-history scroll position/focus preserved.
- PS-005-E: conversion displays linked history without duplicated messages/images; stale status/version is reconciled visibly after 409. Pending compose content is not lost on a request error.

## Verification and handoff

Focused Vitest tests for scope UI, cache merge/cursors, retry state, visibility scheduling and image composer; `scripts/ai/frontend-check`. Add browser acceptance evidence in PS-009, not an unsupported claim that mocked tests prove cross-tenant API isolation. Legacy ticket paths/query keys remain independent.

## Implementation record

Changed files: pending. Commands/results: pending. Acceptance evidence: pending. Remaining blockers: pending.
