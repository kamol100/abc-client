# PS-003 — Private images for issues and chat

Status: reviewable
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

Status is reviewable. Composer, preview, and inbox screens stay in PS-005 and PS-006. No browser session was used.

Changed files, isp-backend:

- New: `database/migrations/2026_11_13_160000_create_platform_support_attachments.php`, `app/Models/PlatformSupportAttachment.php`, `app/Services/PlatformSupport/PlatformSupportImages.php`, `app/Http/Requests/PlatformSupport/StorePlatformSupportUploadRequest.php`, `app/Http/Controllers/V1/Admin/PlatformSupportUploadController.php`, `app/Jobs/PrunePlatformSupportUploadsJob.php`, `tests/Feature/PlatformSupportImageTest.php`.
- Integration: `PlatformSupportException`, `PlatformSupportRequest`, `StorePlatformSupportThreadRequest`, `StorePlatformSupportMessageRequest`, `PlatformSupportLifecycle`, `PlatformSupportMessage`, `PlatformSupportMessageResource`, `PlatformSupportMessageWindow`, `PlatformSupportIdentity`, `routes/api.php`, `bootstrap/app.php`.
- Not changed: `PrivateImageStorage` (2 MB), `php.ini`, nginx, and any MySQL database.

Changed files, shadcn-client:

- `lib/platform-support/attachment-transport.ts`, `lib/platform-support/attachment-proxy.ts`.
- Route handlers under `app/api/platform-support/` and `app/api/platform-support-admin/` for upload, upload delete, and attachment.
- `tests/unit/platform-support/attachment-transport.test.ts`, `tests/unit/platform-support/attachment-proxy.test.ts`.
- `platform_support.errors` in `public/lang/en.json` and `public/lang/bn.json`.
- Spec: this task, `02-data-and-api.md`, `README.md`, and the PS-002 remaining-blocker sentence. `next.config.ts` was not given a server-action body limit.

Commands and results, 2026-11-13. Pest used SQLite `:memory:` and `Storage::fake('local')`.

- `scripts/ai/backend-test tests/Feature/PlatformSupportImageTest.php tests/Feature/PlatformSupportCoreTest.php tests/Feature/PlatformSupportAuthorizationTest.php` — 26 passed, 523 assertions.
- `scripts/ai/lint` on the changed PHP files — Pint passed. Pint reordered imports in `bootstrap/app.php` and the image test.
- `scripts/ai/analyse` on the changed application files (controller, requests, services, models, resource, job, `routes/api.php`, `bootstrap/app.php`) — no errors. The migration and Pest file were Pint-checked and were not passed to PHPStan.
- `scripts/ai/frontend-check` — typecheck passed, then the full Vitest run failed in suites this task did not edit (date picker, menu, maps, pay, client dashboard, reseller client table, column visibility). Those failures were not investigated.
- `npx vitest run tests/unit/platform-support/attachment-transport.test.ts tests/unit/platform-support/attachment-proxy.test.ts` — 2 files, 10 tests passed.
- `php -r` on this CLI: `memory_limit=128M`, `upload_max_filesize=2M`, `post_max_size=8M`, GD JPEG/PNG/WebP present. No production setting was changed.
- `scripts/ai/status` and `scripts/ai/diff` inspected after the edits. No MySQL migrate, package install, or push.

Acceptance evidence is `tests/Feature/PlatformSupportImageTest.php` for the API and the two Vitest files for the proxy, unless noted.

- PS-003-A: an image-only issue stores one JPEG attachment and an image-only chat stores PNG and WebP. A JPEG padded to exactly 5,242,880 bytes is accepted and stored smaller after re-encode. One more input byte is 422 `image_too_large`. `CONTENT_LENGTH` over 6 MiB is 413 `request_too_large`. A 12001-pixel PNG header is 422 `image_dimensions` before decode. GIF, SVG, PDF, a JPEG name with SVG bytes, a corrupt PNG, and an 8×8 header are 422. Six tokens create no message; five attach. A re-encoded file that itself exceeds 5 MiB is rejected in `PlatformSupportImages`; no fixture forced that branch.
- PS-003-B: a sibling reseller, another company, the wrong draft, and a draft token used as a reply token are 404 and leave `message_id` null. An expired thread token is 422 `attachment_expired` and stays unattached. A platform upload's `company_id` is the target thread's company, the audience is `platform`, and the landlord tenant is still 1. A company reader can GET the sent image and the message metadata, and POST to the colleague thread is 403 `forbidden`. The reader can stage and preview their own draft. The owner receives 404 for that staged draft.
- PS-003-C: upload and message JSON omit the storage key and the raw token. The file is on the `local` disk, not `public`. Preview is `image/jpeg`, `private, no-store`, and `nosniff`, and the stored bytes do not contain the JPEG comment. After `company.access` is revoked, the reader GET and the message list are 404. A platform user with show, messages, and attachment, and without upload, can GET the image and receives 403 on upload. An anonymous GET is 401. Another company GET is 404. The same URL is used before and after those denials. No public symlink or thumbnail route was added.
- PS-003-D: the same reply request returns one message and five attachments. A batch with one unknown token is 422 `attachment_invalid`, adds no message, and leaves the valid token unattached. A closed thread reply is 409 and leaves the new token unattached. Delete removes the row and the file. A `creating` failure removes the file that was written. The prune job, after the tenant is removed, deletes an expired unattached file and keeps an attached file whose `expires_at` is in the past, then `Landlord::hasTenant('company_id')` is false.
- PS-003-E: the browser client posts `FormData` to a fixed same-origin path, sends `X-Requested-With`, and does not set `Authorization`. The proxy rejects a mismatched `Origin` with 403 before `fetch`, rejects a declared body over 6 MiB with 413, and returns upstream 401, 403, 404, 413, 422, and 429 with `Retry-After` and without `Set-Cookie`. Image bytes are streamed `private, no-store` and `nosniff`. A non-UUID never calls upstream. The admin delete path is fixed. No session returns 401. The request-limit prerequisite is in the transport comment and in `02-data-and-api.md`. `PrivateImageStorage::maxKilobytes()` is still 2048.

Remaining blockers:

- Summary and read routes are still 204. That is PS-004. Do not start it from this task.
- This CLI cannot accept a real 5 MiB multipart upload until `upload_max_filesize` is at least 6M. `post_max_size` is already 8M. `memory_limit` is 128M and needs to be at least 512M before a large decode. The web server body limit was not measured. Changing those requires approval.
- SQLite and `Storage::fake` do not prove MySQL row locks or a real disk failure after the process dies. The disposable MySQL plan stays in PS-009.
- The attachment migration has run only inside SQLite tests. Applying it to a non-test database needs approval.
- There is no composer or `<img>` screen yet, so the proxy was not verified in a browser. The full frontend Vitest suite was not green.
