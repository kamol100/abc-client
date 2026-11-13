# Proposed data and API contract

Implement in the Laravel sibling checkout. No legacy tickets/ticket_messages/subjects/tag relations are used. Prefix storage/models/tables with PlatformSupport / platform_support_. Public record IDs are UUID strings; internal keys stay integers. Timestamps are ISO 8601 UTC; UI uses existing date formatting.

## Persistence

### platform_support_threads

Internal id, uuid unique, reference unique, company_id required, reseller_id nullable, requester_user_id, kind (`issue|chat`), subject nullable for chats, category, priority, status, assigned_agent_user_id nullable, source_chat_id nullable unique, active_chat_key nullable unique, last_message_sequence default 0, last_activity_at, version default 1, context json nullable, created_at, updated_at.

Use BelongsToTenants and UseResellerScope on roots. Reference is a separate human-readable PS-I / PS-C code generated collision-safely; never reuse legacy ticket code sequences. Company/reseller/requester come from authenticated requesters or the authorized source chat, never request ownership fields. Agent assignee must be an eligible active platform User with inbox/detail/reply permissions, validated server-side. Protect assignee deletion/deactivation handling; unassign safely without deleting history.

active_chat_key is server-computed from company/reseller/requester only when kind=chat,status=open; null otherwise. Unique constraint arbitrates simultaneous open-chat requests. A duplicate start returns the existing authorized active chat with an explicit resumed flag, not a second row. Use database-compatible nullable unique design; test SQLite and intended MySQL SQL semantics without live MySQL mutations. source_chat_id is present only on converted issues, refers to a chat of identical ownership, and cannot be reassigned. Converted state is derived from the unique linked issue rather than a second independently writable link column. version increments on successful lifecycle/assignment changes.

Indexes support company/reseller/requester/kind/status + last_activity_at/id ordering, assignee/status and last_activity_at. Use indexes driven by actual queries; do not invent a database package. `company_id` and `requester_user_id` restrict deletion. `reseller_id` is an indexed integer without a foreign key so reseller purge can remove the reseller row while the thread keeps the stored id. Ordinary user and company deletes are rejected while threads exist. Company purge is the explicit archive and deletes that company's support rows first. Assignee deletion nulls the assignee. No cascade deletes threads.

### platform_support_messages

id, uuid unique, thread_id, company_id, reseller_id nullable, sequence, author_user_id nullable after account deletion, author_side (`requester|platform`), author_display_name snapshot, body nullable, client_request_id UUID, created_at. Unique(thread_id, sequence). Child ownership is copied from parent. Unique idempotency scope described below. No caller-supplied author_side/user IDs. Store authenticated User, never require Staff. Append-only; no edit/delete routes. Do not expose author snapshots as full user resources.

Allocate sequence and increment last_message_sequence atomically under parent row lock, checking lifecycle and policy in the transaction. A sequence is monotonic per thread, not a global message ID. Update last_activity_at on replies, creation, conversion and workflow changes; assignment also changes version/activity but not message unread sequence.

### platform_support_attachments

id, uuid unique, company_id, reseller_id nullable, uploader_user_id, intended_thread_id nullable, message_id nullable, private storage key, validated MIME, bytes, width, height, checksum, original display filename sanitized, upload_token_hash, expires_at, attached_at, created_at. Staged uploads expire after 24 hours. Sent images do not expire automatically. Never expose storage keys or token hashes. Bind token to uploader, ownership, route audience and intended thread (or create-request context). Multiple upload attempts may yield different tokens; client removes unwanted stages explicitly.

### platform_support_read_states

thread_id, reader_user_id, last_read_sequence default 0, updated_at; unique(thread_id,reader_user_id). User's last-read value only moves forward, clamped to parent maximum. A newly authorized reader begins at 0; scope revocation hides counts immediately without deleting read state. Every reader's counts exclude their own authored messages after the cursor. Sending a message does not advance a read cursor through unseen replies; only explicit visible-window read acknowledgment moves it forward.

### platform_support_requests (idempotency receipts)

company_id, reseller_scope_key (non-null normalized null representation; `'0'` when the thread has no reseller), actor_user_id nullable, operation, client_request_id, canonical_payload_hash, result_thread_id, result_message_id nullable, result_resumed, created_at; unique company/reseller-scope/actor/operation/request ID. The receipt table has no `reseller_id` column and does not use reseller scope. Receipts retained with history in v1. Validate scope + payload hash on retries. Same key/same payload returns original result, including `result_resumed`; same key/different payload returns 409. `expected_version` is excluded from the conversion hash. Check receipt before rejecting already-consumed attachment tokens. Upload retry itself is not message retry; conversion also has source_chat uniqueness independent of request IDs. Transactionally commit receipt with message/thread changes and attachment consumption.

No DB table for help articles, FAQ text or video catalog.

## Resource payloads

JSON envelope remains `{ success, status, data }`; errors also provide stable machine code/message and field errors where relevant. Reuse Controller::response(). Collections use `{ data: ThreadSummary[], pagination: existing-project-pagination-shape }` inside the envelope. Confirm the concrete existing pagination shape before generating frontend Zod types.

ThreadSummary: uuid, reference, kind, subject, category, priority, status, version, requester minimal `{uuid,name}`, reseller minimal `{uuid,name}|null`, last_activity_at, assigned_agent `{uuid,name}|null`, unread_count, linked_issue_uuid/source_chat_uuid as applicable, abilities. Platform summaries additionally include company `{uuid,name,domain}` and a safe requester role label if available; no credentials/customer payloads. ThreadDetail includes the same fields and sanitized context `{path?,article_id?}`, not all messages. Abilities: can_reply, can_resolve, can_reopen, can_manage, can_assign, can_convert, can_upload, can_read_source; calculated per actor/record.

Message: uuid, sequence, author `{name,side,is_self}`, body, attachments `[{uuid,filename,mime,bytes,width,height}]`, created_at, client_request_id. Image URLs are built as authenticated same-origin proxy paths, never permanent public URLs. Requester resources expose only agent display names, not internal accounts/emails. An agent sees requester identity in the thread header.

Message window payload: `{data: Message[], oldest_sequence, latest_sequence, has_more, next_after_sequence, has_older}`. Data always ascending by sequence. Initial fetch returns latest 50; `before_sequence` returns up to 50 older messages; `after_sequence` returns up to 100 newer messages, earliest unseen first. Queries cannot combine before and after. `next_after_sequence` is the last returned sequence, or the requested cursor when no newer messages exist. Drain has_more pages without skipping to the parent's latest sequence. Accept 0 as the initial after/read cursor; before_sequence and limits must be positive integers. Cap limits, reject malformed/negative cursors and clamp a future read cursor to the parent maximum. Poll cursors are not timestamps.

Unread summary: `{unread_messages, unread_threads, open_issues, open_chats, unassigned_threads?}`; counts only authorized records in selected scope and principal. The last field is platform-only. Define unread_messages using message sequences/author predicate, not a global boolean or all status events. No body/image preview in summary notifications unless authorized at response time.

## Requester routes

All paths below are under `/api/v1`; support routes use auth:sanctum + active-User checks + dedicated support capability middleware/policy and explicit subscription availability. Define static paths before wildcard thread UUID paths.

- GET `/platform-support/threads` → `platform-support.access`: own list.
- POST `/platform-support/threads` → `platform-support.create`: new issue or open/resume chat.
- GET `/platform-support/reseller/threads` → `platform-support.reseller.access`: exact-reseller list.
- GET `/platform-support/company/threads` → `platform-support.company.access`: own company list, non-reseller callers only.
- GET `/platform-support/summary` → `platform-support.summary`: scope=own|reseller|company; authorize requested scope or 403; never silently broaden.
- GET `/platform-support/threads/{thread}` → `platform-support.show`: authorized detail.
- GET `/platform-support/threads/{thread}/messages` → `platform-support.messages`.
- POST `/platform-support/threads/{thread}/messages` → `platform-support.reply`: own reply.
- POST `/platform-support/threads/{thread}/team-messages` → `platform-support.team.reply`: colleague reply plus independent visibility grant.
- PATCH `/platform-support/threads/{thread}/resolve` → `platform-support.resolve`: own issue → resolved; own chat → closed.
- PATCH `/platform-support/threads/{thread}/reopen` → `platform-support.reopen`: own resolved/closed issue → open, own closed chat → open (unique guard).
- PATCH `/platform-support/threads/{thread}/team-status` → `platform-support.team.manage`: eligible colleague workflow changes. Actor cannot modify scope or assignee.
- POST `/platform-support/threads/{thread}/convert` → `platform-support.convert`: requester-owned chat → issue.
- PATCH `/platform-support/threads/{thread}/read` → `platform-support.read`: actor cursor only.
- POST `/platform-support/uploads` → `platform-support.upload`: one staged image; accepts optional thread UUID or a client-generated draft UUID.
- DELETE `/platform-support/uploads/{upload}` → `platform-support.upload-delete`: remove actor's unattached staged image only.
- GET `/platform-support/attachments/{attachment}` → `platform-support.attachment`: authorized sent image, or uploader-only staged preview; binary route.

List filters: kind, status, priority, category, reference, subject search, page, per_page (default 20, max 100). Requested filters narrow an already authorized query. Invalid enum values are 422. Company/reseller ownership selection is never a writable body input. Company-wide list may filter one reseller UUID only after verifying it belongs to that company; foreign UUID is 404.

## Platform routes

Paths `/api/v1/platform-support-admin/...`; protected as in 01-authorization, independently from requester baseline and paid features. Use explicit guarded UUID service lookup because ordinary tenant binding would use the platform company instead of the requester's company.

- GET `/platform-support-admin/threads` → `platform-support-admin.access`.
- GET `/platform-support-admin/summary` → `platform-support-admin.summary`.
- GET `/platform-support-admin/threads/{thread}` → `platform-support-admin.show`.
- GET `/platform-support-admin/threads/{thread}/messages` → `platform-support-admin.messages`.
- POST `/platform-support-admin/threads/{thread}/messages` → `platform-support-admin.reply`.
- PATCH `/platform-support-admin/threads/{thread}/status` → `platform-support-admin.status`.
- PATCH `/platform-support-admin/threads/{thread}/assignee` → `platform-support-admin.assign`.
- GET `/platform-support-admin/assignees` → `platform-support-admin.assignees`: minimal eligible platform-agent dropdown, also seed this platform-only permission for managers.
- POST `/platform-support-admin/threads/{thread}/convert` → `platform-support-admin.convert`.
- PATCH `/platform-support-admin/threads/{thread}/read` → `platform-support-admin.read`.
- POST `/platform-support-admin/uploads` → `platform-support-admin.upload`: target thread UUID required; target ownership is loaded, never posted by caller.
- DELETE `/platform-support-admin/uploads/{upload}` → `platform-support-admin.upload-delete`.
- GET `/platform-support-admin/attachments/{attachment}` → `platform-support-admin.attachment`.

Platform list/summary filters add company UUID, reseller UUID, requester UUID, assignee UUID or unassigned, unread_only. Filter fields are selectors within guarded platform-support queries, not general tenant-switching inputs. Summary applies the same authorized scope/filters as the inbox. `assignees` capability is required only for dropdown/assignment workflows; a reply-only agent need not receive it.

## Mutation semantics

Create issue: kind=issue, subject, category, priority, body?, attachment_tokens[]?, client_request_id, draft_id, optional sanitized context. Create chat: kind=chat, client_request_id, draft_id, optional body/images/context. Empty chat can be created to obtain conversation identity; empty issues cannot. Resuming an open chat never silently drops a supplied first message: return resumed=true and require client to send that draft through the message endpoint using the same preserved draft and a separate message request ID. UI must not claim it was sent.

Reply: body?, attachment_tokens[]?, client_request_id. At least text or one image; max five tokens; duplicates rejected. Resolve/reopen/status/assignment: expected_version required. Outdated version or invalid transition = 409, no mutation. All replies recheck writable status under lock. Converted/closed chats and closed issues reject sends; reopening is explicit. Requester-side replies to resolved/waiting issues transition to open atomically; platform reply to open/in_progress issues transitions to waiting_for_requester, while a platform reply to a resolved issue reopens to waiting_for_requester. Team replies count as requester-side. Other transitions are explicit. No automatic closure on inactivity.

Conversion: source chat UUID, subject/category/priority, expected_version, client_request_id. Source must contain at least one sent text/image message; empty chat conversion is 422. One transaction locks the source, creates same-owner issue, marks chat converted/releases active_chat_key, establishes source_chat_id, commits idempotency receipt. Prior chat messages/attachments stay where they are. Add no copied history messages. New issue may have zero follow-up messages because linked chat is its initial history; last_message_sequence starts 0. Replay returns existing issue only after authorization; conflicting replacement fields return 409. Opening a converted chat links to its issue.

Explicit issue management transitions: open → in_progress/waiting_for_requester/resolved/closed; in_progress → open/waiting_for_requester/resolved/closed; waiting_for_requester → open/in_progress/resolved/closed; resolved → open/closed; closed → open. Own resolve/reopen routes allow only their narrower product-defined transitions. Same-state status requests are harmless no-ops without duplicate notifications; expected_version still must match. Automatic reply transitions described above are allowed transactionally, including resolved → waiting_for_requester for a platform reply. Chat transitions are open → closed/converted and closed → open only; converted is terminal. Only the conversion endpoint can set converted. Team managers can use issue transitions and close/reopen visible chats but cannot convert colleagues' chats or assign agents. Platform managers use status for resolve/reopen/close and the dedicated conversion endpoint.

Attachment upload returns `{upload_uuid, upload_token, expires_at, mime, bytes, width, height}`; treat token as ephemeral sensitive data, keep in component memory and never logs/localStorage. Any validation/storage failure on a submitted send leaves no partial message and does not consume good staged tokens. A successful send attaches all selected images. Read request accepts last_read_sequence only; cannot set another reader. Never accept company_id/reseller_id/requester_user_id/author IDs/raw storage paths; reject as prohibited rather than ignoring suspicious input.

HTTP: 401 unauthenticated; 403 missing route capability or ineligible principal; 404 inaccessible/unknown record; 409 version, lifecycle or idempotency conflict; 413 upload request exceeds transport cap; 422 invalid payload/image; 429 throttled with Retry-After. Do not flatten upstream 413/429 into successful JSON. Stable machine error codes use `platform_support.*` keys and have en/bn UI translations. JSON reads are private/no-store; images private/no-store + nosniff. Mutations include after-commit notifications; dispatch failure must be observable/retryable without duplicating the user message.

## PS-002 shipped behavior

Successful creates, replies, lists, and lifecycle changes use this project's HTTP 200 envelope `{ success, status, data }`. Create data is `{ thread, message|null, resumed, draft_id|null }`. A resumed chat returns `message: null` and the submitted `draft_id`; the body is not stored. Lists use `{ data, pagination: { total, count, per_page, current_page, total_pages } }`. Message windows use the contract shape. The assignee dropdown is `{ data: [{ uuid, name }] }` with no pagination. Detail includes `context`; list rows do not. Platform rows add `company { uuid, name, domain }` and `requester_role`. Public thread and message ids stay `uuid`. Chat subject is stored null; there is no translated default. Message `attachments` is `[]` until PS-003.

Observed `Cache-Control` on a successful create is `no-store, private`. Error JSON is `{ success: false, status, error: { code, message } }`. Validation adds `error.errors` and uses `platform_support.invalid`. Other codes in use: `not_found`, `forbidden`, `prohibited_field`, `version_conflict`, `idempotency_conflict`, `sequence_conflict`, `invalid_transition`, `closed`, `already_converted`, `empty_chat`, `active_chat`, `ineligible_assignee`, `history_retained`, `reference_unavailable`. A non-empty `attachment_tokens` array is 422 `platform_support.attachments_unavailable`. That is the text-only boundary. The image contract above is unchanged and is not a permanent rejection.

Summary, read, upload, upload-delete, and attachment routes on both audiences still return 204. Read rows are not written, so unread uses cursor 0. `can_upload` can still be true from the policy. List filters live in `PlatformSupportQuery` because an unknown company, reseller, requester, or assignee UUID must 404. Company-wide lookup drops reseller scope only after `company.access` and a non-reseller check. Platform lookup is unscoped platform-support only after the inbox grant, then children are constrained to the thread's stored company and id. No `Landlord::disable()`.

SQLite tests prove the unique keys and the application conflict mapping. They do not prove MySQL row locks. The concurrency plan is in PS-009. No production database was migrated.
