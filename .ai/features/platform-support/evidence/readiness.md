# PS-009 readiness checklist

Recorded 2026-11-13. This is a checklist, not an approval to migrate, deploy, or push.

## Not ready

- PS-E12 was not measured. Do not claim poll delivery.
- The signed-in browser image send was not run. SQLite image tests and the anonymous proxy checks do not prove the 5 MiB browser path.
- MySQL row locking was not run. SQLite unique constraints are not that proof.
- Help videos are `not_configured`. No real video was published.
- `scripts/ai/frontend-check` still fails 19 unrelated Vitest tests.

## Before a later approved release

1. Apply only the additive platform-support migrations on the approved database. Do not drop or rebuild legacy tables.
2. Provision permissions in this order: baseline support for eligible staff, optional reseller and company visibility, team reply and team manage, then platform-admin permissions only inside company 1. A tenant role editor must not receive the platform-admin names.
3. Run a notification worker on the `notifications` queue and keep `platform-support:deliver-notifications` every minute. Keep the upload prune job at 03:30.
4. Confirm the private `local` disk can write `platform-support/{company}/...`. Do not put those files on a public disk or a shared cache.
5. Confirm the web PHP runtime has JPEG, PNG, and WebP encoders. This machine's CLI reports `memory_limit=128M`, `upload_max_filesize=2M`, `post_max_size=8M`, and GD can decode JPEG, PNG, and WebP. The CLI is not the web runtime. Production still needs `memory_limit` of at least 512M and upload/post/body limits of at least 6M.
6. Publish help content with the frontend build. Bangla must ship with the same revision as English. Missing or stale Bangla stays unpublished.
7. Rollback is limited to the module routes, flags, and additive code. Do not drop collected conversations, images, or legacy product tables.

Configuration, migration execution outside tests, deployment, and push still need the applicable human approval.
