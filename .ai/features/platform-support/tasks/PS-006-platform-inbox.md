# PS-006 — App-tenant platform support inbox

Status: reviewable
Repository: shadcn-client; backend changes only for verified contract omissions.
Depends on: PS-005 complete; share its neutral thread/composer UI where appropriate.

## Goal

Let app administrators and explicitly permitted platform staff identify and respond to tenant/reseller requesters quickly, without impersonating them.

## Proposed locations and behavior

Thin pages `app/(dashboard)/platform-support-admin/page.tsx` and `threads/[id]/page.tsx`; interactive admin views under `components/platform-support/admin/`. Add Platform Support Inbox nav guarded by platform-support-admin.access, supplied by backend capability output. No company_id literal or role-name authorization in the browser. A manually opened route still relies on backend authorization.

- Separate Issues and Chats tabs; unread/unassigned filters, kind/status/priority/category/search, company/reseller/requester/assignee selectors and pagination. Initial order: last_activity_at descending, stable ID tie-breaker. Provide quick Unread and Unassigned views; do not silently change sorting on every poll while an agent is acting on a row.
- Show tenant name/domain, reseller if applicable, requester display identity, reference/subject, status/priority, assignee, unread and last activity. Header retains ownership identity while responding, so agents can tell which company receives the answer. Resolve display names via backend resources, not extra arbitrary cross-company user fetches.
- Detail thread uses private image composer/preview from PS-005, authenticated platform routes and correctly labeled agent/requester sides. Hide reply/assignment/transition/conversion separately by exact named capability plus per-record abilities. Read-only platform staff cannot upload/send. Assignment target list requires .assignees and .assign; reply-only agents do not.
- Platform agent can assign/unassign, reply, transition issue/chat and convert chat to an issue. Honor expected_version and display 409 reconciliation. Source chat/linked issue history remains independently authorized. No legacy ticket/customer navigation cross-link that grants accidental access.
- One 10-second summary observer while the inbox is foreground; 10-second foreground list refresh and 5-second selected-thread delta polling. Consider query sharing across open panels in one app. Stop hidden/offline; refetch on focus/reconnect; respect throttling/backoff. Show pending/error/last-refresh states without suggesting socket-level immediacy.
- Badges are per logged-in agent. Reading for one agent does not clear another agent's unread. Assignee change does not imply a message was read. In-app notifications deep-link to authorized thread detail and retain tenant context labels.

## Acceptance

- PS-006-A: authorized platform admin sees tenant A, tenant B and reseller requests with clear source identity; ordinary company-1 user, tenant admin and reseller cannot load platform data by UI or direct API.
- PS-006-B: read-only, reply-only and manager platform roles see exactly their allowed controls. Uploads/images/source history use platform route authorization, never a requester-scope fallback that bypasses denial.
- PS-006-C: new request and reply appear within configured polling windows under controlled healthy conditions; multi-agent unread is independent. A failed request is visibly stale, not an empty successful inbox.
- PS-006-D: app agent without Staff can reply with text/images; recipient sees platform support label and display name; tenant ownership never changes to the app company.
- PS-006-E: assignment, status conflict, conversion retry and selected-thread/list refresh remain coherent; no duplicate messages after polling/mutation races.

## Verification and handoff

Vitest permission/identity-column/agent controls/cache tests and frontend-check. Use accessible selectors and deterministic fixtures for PS-009 browser scenarios. Do not use production customer data or notifications to create test evidence.

## Implementation record

Changed files:

- `app/(dashboard)/platform-support-admin/page.tsx` and `threads/[id]/page.tsx`.
- `components/platform-support/admin/inbox-home.tsx`, `inbox-thread.tsx`, `inbox-column.tsx`, `inbox-filter.ts`, `inbox-assignees.tsx`, `inbox-model.ts`.
- `components/platform-support/support-composer.tsx` takes an audience. Platform replies reconcile and upload through `platform-support-admin`. The requester default is unchanged. `allowImages` hides the picker when upload is not allowed.
- `components/platform-support/support-thread.tsx` exports `MessageList` with an audience so inbox images use the platform attachment route.
- `components/platform-support/support-model.ts` adds the 10-second `inbox` poll surface and `supportHistoryUrl`.
- `hooks/use-menu-items.ts` adds Support inbox, gated only by `platform-support-admin.access`. No paid feature lock and no company id check.
- `public/lang/en.json` and `public/lang/bn.json`.
- `tests/unit/platform-support/inbox-model.test.ts` and the menu/translation assertions.
- `.ai/features/platform-support/README.md` status line.

Commands/results:

- `scripts/ai/status` before editing. The tree already had uncommitted PS-004 and PS-005 files. Those were not edited for this task. By the end they were on `503b007` (`platform support-5`) and were no longer uncommitted. This diff does not include them.
- `npx vitest run tests/unit/platform-support tests/unit/menu/menu-items.test.ts` — 7 files, 58 passed.
- `scripts/ai/typecheck` — exited 0.
- `scripts/ai/frontend-check` — typecheck exited 0. Full Vitest then failed 19 tests in 9 files: maps, client dashboard info, reseller-client filter/table, column visibility, date-picker, and pay content. Those files were not part of this change. 663 tests passed, including the new inbox tests. This matches the failures already recorded for PS-003 and PS-005.
- `scripts/ai/status` and `git diff --stat` after editing. The working tree contains only the PS-006 files listed above. `scripts/ai/diff` is the same unstaged diff.

Acceptance evidence:

- PS-006-A: the menu test shows the inbox only for `platform-support-admin.access`. `platform-support.access` plus `platform-support-admin.reply` does not show it. List params drop `company_id`, `sort`, and non-uuid company/reseller values. A denied list state renders no rows. The page still calls the admin list when the route is opened; a 403 removes the cached rows. No live session checked an ordinary company-1 user, a tenant admin, or a reseller against the API.
- PS-006-B: read-only capabilities produce no send, upload, transition, assign, or convert control. Reply without the assignee permission does not show the assignee list. A record ability of false hides the control even when the named permission is true. Platform history URLs stay under `platform-support-admin`. This does not prove the API enforces those roles.
- PS-006-C: the inbox poll interval is 10 seconds, stops when hidden or offline, and backs off after failures. A failed empty list is stale and does not show the table. A failed list that still has rows keeps those rows and marks them stale. Unread counts are whatever the admin payload returns, and the query key includes the agent identity. Two live agents were not observed.
- PS-006-D: the reply action does not check for a Staff row. The message body omits ownership fields. The requester thread already labels `author.side === "platform"` as platform support plus the display name. No live reply was sent, so a recipient view and unchanged tenant ownership were not observed.
- PS-006-E: assignment and status bodies send `expected_version` and no ownership fields. An acknowledged message stays one row when the same uuid is merged again, and the poll cursor does not jump. While a row is focused, a newer page keeps the existing order and prepends new uuids. A 409 sets the version-conflict notice and refetches the thread. No live conflict or conversion was sent.

Remaining blockers:

- No browser session. Tabs, filters, light/dark theme, focus, and scroll were not clicked through. Those belong in PS-009.
- No live API call. These tests do not prove tenant isolation or that a read-only token is rejected.
- Company, reseller, and requester filters accept uuids because the admin list contract has no dropdown for them. The UI does not call another tenant directory. The assignee dropdown uses `platform-support-admin/assignees` only when both `platform-support-admin.assign` and `platform-support-admin.assignees` are present.
- `useFetch` still does not expose `Retry-After`. Backoff uses the failed attempt count.
- PS-007 was not started.
