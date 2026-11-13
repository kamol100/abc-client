# PS-005 — Tenant and reseller support UI

Status: reviewable
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

Changed files:

- `app/(dashboard)/layout.tsx` mounts one `SupportRuntime` in the staff layout.
- `app/(dashboard)/platform-support/page.tsx`, `issues/[id]/page.tsx`, `chats/[id]/page.tsx`.
- `components/platform-support/support-model.ts`, `support-form-schema.ts`, `support-column.tsx`, `support-composer.tsx`, `support-home.tsx`, `support-thread.tsx`, `support-launcher.tsx`.
- `components/form-wrapper/form-wrapper.tsx` and `form-builder.tsx`: optional `preparePayload`, `resetOnSuccess`, `skipInvalidate`, and `onSubmitError`. Defaults keep the previous submit behavior.
- `hooks/use-api-query.ts` throws `ApiRequestError` from `lib/api/api-request-error.ts` so a support failure keeps its status and `platform_support.*` code. The message is unchanged.
- `hooks/use-menu-items.ts` adds an independent Platform Support item gated by `platform-support.access`, with no paid `support` feature lock.
- `public/lang/en.json` and `public/lang/bn.json`.
- `tests/unit/platform-support/support-model.test.ts`, `support-launcher.test.tsx`, `support-composer.test.tsx`.
- `tests/unit/menu/menu-items.test.ts` expects the new links. It also drops `/import-client` and `/re-sync` from two assertions because those menu entries were already commented out before this task.
- `.ai/features/platform-support/README.md` status line.

Commands/results:

- `scripts/ai/status` before editing. The tree already had uncommitted PS-004 files. Those were left in place.
- `scripts/ai/typecheck` exited 0.
- `npx vitest run tests/unit/platform-support tests/unit/menu/menu-items.test.ts` — 6 files, 44 passed.
- `scripts/ai/frontend-check` — typecheck exited 0. The full Vitest run then failed 19 tests in 9 files: date-picker, filter date range, pay content, client dashboard info, reseller-client filter/table, column visibility, and an empty maps suite. Those files were not part of this change. The same suites were already failing in the PS-003 record.
- `scripts/ai/status` and `scripts/ai/diff` inspected after editing.

Acceptance evidence:

- PS-005-A: the launcher test renders one Help button with only `platform-support.access`, and hides it when that permission is absent even if `tickets.access` and `notifications.access` are present. The panel links are Report an issue, Chat with support, and My requests. The menu test shows the new item while the paid support feature is not required. `SupportRuntime` is mounted once in the staff layout. No browser session confirmed a single button on a real page.
- PS-005-B: scope helpers hide company scope for a reseller, omit a reseller filter from own and reseller lists, send colleague replies to `team-messages`, and send colleague resolve/reopen to `team-status`. Read-only abilities produce no send or manage actions. A 403/404 `ApiRequestError` is treated as access denial and the thread view clears history. This does not prove the API enforces it.
- PS-005-C: image selection keeps a valid file when another file is too large, the wrong type, or over the five-image cap. One failed upload leaves the ready token. A retry reuses the request id. An edited ambiguous attempt gets a new id and asks for a history check first. A resumed chat with an unsent body is not treated as sent. Message text renders as text, including a `<b>` string. English and Bangla `platform_support` keys match. Mobile, both themes, and a real upload were not exercised.
- PS-005-D: a 105-message drain stays ordered and deduped, and the cursor stops at 105. An older page does not move the forward cursor. An empty poll does not replace history. Polling returns false when the tab is hidden, offline, signed out, or the record is inaccessible, and it backs off. The visible-read helper ignores a newer off-screen message. Scroll restoration is implemented and was not measured in a browser.
- PS-005-E: acknowledging a message merges by uuid and does not advance the poll cursor past unseen replies. A 409 sets the version-conflict notice and refetches the thread. `preparePayload` can return false, which leaves the form values in place. Linked chat messages stay in a separate read-only section. No live 409 or conversion was sent.

Remaining blockers:

- No browser session, so the staff layout, mobile drawer, light/dark theme, focus restoration, and scroll position were not clicked through. Those belong in PS-009.
- `useFetch` returns JSON only, so a 429 `Retry-After` header is not available. Backoff uses the failed attempt count.
- A real 5 MiB upload still depends on the PHP limits recorded in PS-003. This task did not change them.
- No live API call. Unit tests do not prove tenant isolation.
- PS-006 was not started. The launcher does not link to a Help Centre route.

Unrelated working-tree files left untouched: `.ai/features/platform-support/02-data-and-api.md`, `tasks/PS-004-notifications.md`, `components/notifications/notification-catalog.ts`, `notification-column.tsx`, `notification-list.tsx`, and `tests/unit/notifications/notification-catalog.test.ts`. `en.json`, `bn.json`, and `.ai/report.md` already contained the PS-004 edits and now also contain this task.
