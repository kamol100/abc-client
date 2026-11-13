# PS-003 — Private images for issues and chat

Status: not started
Repositories: isp-backend; shadcn-client for upload/image transport adapters.
Depends on: PS-002 complete.

## Goal

Support JPEG/PNG/WebP images in issue creation and every chat/issue reply, privately, with up to five images per message and 5 MiB per image. Text-free image messages are allowed. Legacy profile/customer images keep their current limits/behavior.

## Work

1. Add support-specific attachment storage/service/resources and staging routes from the API contract. Existing PrivateImageStorage is a reference, not a drop-in: it assumes profile fields and 2 MB. Do not raise global legacy limits to make support uploads work.
2. Upload one file per authenticated request, with 6 MiB total transport cap; enforce 5 MiB bytes, actual decoder-validated JPEG/PNG/WebP, max dimensions/pixels in product contract. Reject SVG/GIF/PDF, corrupt images and disguised files. Normalize accepted image output using runtime-supported encoders to remove metadata; verify the resulting type, byte cap and valid output. If re-encoding cannot remain under the cap, return a clear validation error rather than silently changing format/quality beyond documented settings. If the server lacks the required decoder/encoder, document a concrete runtime prerequisite rather than trusting filename/client MIME or silently installing a package. Do not perform an unbounded decode before dimension checks.
3. Store on a private disk under server-generated keys partitioned by trusted company/thread/upload. No public symlinks, arbitrary paths or permanent unauthenticated URLs. Token hash stored; raw token returned once to uploader. Track draft/thread audience and uploader to prevent token replay across scopes, drafts or threads.
4. Integrate staging consumption into create/reply transactions and canonical idempotency receipts. Exactly one message consumes a stage. Expired/foreign/duplicate tokens or sixth image = 422/404 without partial message creation. Keep retry receipts valid after tokens have been consumed.
5. Add authenticated same-origin Next route handlers for support multipart staging, staged deletion and image streaming. Reuse `auth()` and private proxy patterns. Keep existing JSON API calls in useApiQuery/useApiMutation; the binary upload is a documented narrow transport adapter, not a new general API client. Browser never sees Sanctum bearer tokens. Do not pass 5 MB images through the generic server-action path and assume body limits permit them.
6. Proxy route URLs/audiences are fixed by code; validate UUIDs and forbid arbitrary upstream URLs. Enforce same-origin/CSRF checks on cookie-authenticated POST/DELETE proxy routes. Abort or reject excess request bytes at the applicable layer, validate a bounded stream/read, and preserve upstream 401/403/404/413/422/429 statuses. Do not forward arbitrary client headers/cookies upstream.
7. Stream private image responses via session proxy, private/no-store and nosniff. Loading metadata, thumbnails or original bytes must all enforce parent visibility. Do not put these assets through shared image caches. Provide uploader-only preview of stages through the same authenticated mechanism.
8. Clean expired unattached stages after 24 hours with safe per-company/restoring job context. Never purge attached images during cleanup. Compensate file-write failure and transaction rollback; log/retry cleanup failures without storing message content in logs.

## Acceptance

- PS-003-A: image-only issue and chat messages work; exact 5 MiB boundary and five-image limit enforced; sixth, oversized, corrupt, wrong MIME and pixel-bomb inputs rejected.
- PS-003-B: foreign tenant/reseller/uploader/thread/draft stage consumption denied. A platform agent's upload belongs to the target thread company. A read-only colleague can view sent images but cannot stage a reply without reply permission.
- PS-003-C: no image metadata or bytes can be accessed anonymously, via public disk paths or after scope permission revocation; a shared copied URL is still authenticated/authorized. Staged preview is uploader-only.
- PS-003-D: upload then send retry creates one message and five attachments at most. Multi-stage failure rolls back the send without consuming valid stages. Cleanup/rollback leaves no orphaned committed references.
- PS-003-E: UI transport adapter handles upload errors and preserves HTTP status; request-limit configuration prerequisite is documented. No global server-action body-size increase and no legacy private image limit change.

## Verification and handoff

Pest fake disk + real decoder fixtures for validation/security, route-handler transport unit tests, frontend typecheck. Record any PHP/web-server/proxy upload limits that need human configuration approval; do not change production settings. UI preview/composer interactions arrive in PS-005/006.

## Implementation record

Changed files: pending. Commands/results: pending. Acceptance evidence: pending. Remaining blockers: pending.
