# PS-006 — App-tenant platform support inbox

Status: not started
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

Changed files: pending. Commands/results: pending. Acceptance evidence: pending. Remaining blockers: pending.
