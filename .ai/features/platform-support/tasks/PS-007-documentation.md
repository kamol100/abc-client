# PS-007 — File-based bilingual documentation engine

Status: reviewable
Repository: shadcn-client; minimal backend effective-capability integration only if required.
Depends on: PS-001 complete; execute after PS-006 for the requested sequence.

## Goal

Deliver server-authorized Markdown articles, FAQs and video metadata without database content storage. This task owns the content engine and initial real articles; PS-008 owns full help UI and feature-coverage batches.

## Proposed structure

```text
content/help/catalog.ts
content/help/en/<feature>/<article>.md
content/help/bn/<feature>/<article>.md
lib/help/catalog.ts
lib/help/authorization.ts
lib/help/content.ts
lib/help/search.ts
scripts/check-help-content.mjs
```

Use a typed catalog with stable article ID/slug, audience (`staff|platform`), requiredAll/requiredAny permissions, optional feature entitlement, route patterns, related IDs, sort order, source revision, publication/review state and per-language video IDs. Actual content front matter: localized title/summary/keywords, language, translated_from_revision. Permission rules are shared, never edited separately by translators. Route patterns match most-specific-first; allowlist IDs/slugs/locales before reading files. A future public/subscriber audience requires a separate explicit extension, not default access.

## Required behavior

- Use plain .md with a maintained Markdown parser/renderer; disable raw HTML, unsafe URL schemes and arbitrary scripts/components. No executable MDX in v1. No parser in inspected declared dependencies: prepare the exact minimal package choice and integration before requesting installation approval. Do not handwrite an unsafe Markdown-to-HTML regex substitute. Dependency approval is an implementation prerequisite, not an outstanding product question.
- Keep files outside public/ and server-only imports. Do not ship the catalog's restricted metadata or all article text in client chunks, static exports, sitemaps, public search JSON, RSC prefetches to unauthorized sessions or shared caches. Parse/cache tenant-independent raw content internally by revision/locale; authorize every user-facing response.
- Derive current effective capabilities and entitlements using existing authenticated settings/backend code, server-side. Overviews require relevant feature access; privileged action tutorials require the exact backend action route permission. Shared lookup/search/article route must call the same authorization evaluator. Feature-specific FAQs/videos follow their article's policy. A guide may not embed an unrestricted privileged section; split articles when permissions differ.
- Honor subscription feature visibility for feature docs. General support, account/subscription recovery and “how to contact support” articles remain baseline-available. Do not make the help engine depend on operational tickets.access.
- Require real en/bn published pairs and matching source revision before publication. A draft can have an explicit development-only English fallback but cannot accidentally publish an untranslated/stale Bangla article. Language switch preserves article ID; use existing lang cookie/language conventions, normalizing en/bn. Do not mutate module-global server i18n locale per request.
- Search allowed titles/summaries/keywords and text, returning only authorized matches/snippets. Unicode-aware Bangla/English normalization and case handling; bounded query length/results; no telemetry of private query contents. Rank current-page and localized title matches first. An internal prebuilt index is acceptable if inaccessible to clients; filter before snippets/results. No external search SaaS in v1.
- Protected media includes screenshots/downloads if any. Use synthetic screenshots without personal/credential data; never place permission-restricted screenshots in unguarded public paths. Source video IDs must be known and valid, never raw iframe HTML. Do not invent real YouTube IDs or publish placeholder embeds; a video is optional until a real reviewed URL is supplied. Text tutorials remain sufficient without a video.
- Add validation for duplicate IDs/slugs, missing translations, stale revisions, unknown permissions, internal/related links, route mappings, unsafe video URLs and unpublished related content. Validate article permission names against the backend permission catalog via checked export/build artifact, not a live production call during builds. Add a documented update command and review ownership for that artifact.

## Initial content

Write real en/bn getting-started, contacting platform support, creating an issue, chat/images/conversion, clients overview/create, and invoices overview articles. Verify each procedure against current source/screens rather than assumed API fields. Do not teach unverified financial rules or expose legacy authorization gaps as ordinary workflow instructions.

## Acceptance

- PS-007-A: direct URL, search/snippet/related FAQ/video/media and build/browser output hide forbidden articles; authorized articles render real Markdown in both languages.
- PS-007-B: en/bn pairing and revision validator fail deliberately broken fixtures; real published content passes. English/Bangla concurrent sessions receive correct locale and permissions.
- PS-007-C: changing optional permissions/entitlements changes allowed docs without a rebuild; pure content changes require the documented application build/release. No database writes/content rows.
- PS-007-D: initial articles are accurate and readable, safe rendering blocks scripts/HTML/unsafe URLs, arbitrary path/locale attempts fail. No invented videos or restricted assets publicly bundled.

## Verification and handoff

Vitest policy/search/locale/path/renderer tests, validator check and frontend-check. Record dependency approval/install status truthfully. PS-008 cannot claim the Markdown feature complete while a renderer approval is pending; unaffected support tasks remain independently reviewable.

## Implementation record

Changed files: `content/help/` (catalog, permission snapshot, English/Bangla articles, README), `lib/help/` (authorization, catalog matching, content loader, Markdown render, search, validator, settings actor, HTTP delivery), `app/api/help/` article, search, and media routes, `scripts/check-help-content.mjs`, `scripts/export-help-permission-catalog.mjs`, `types/server-only.d.ts`, `tests/unit/help/`, `package.json`, `package-lock.json`, `tsconfig.json`, `vitest.config.ts`. No isp-backend files. No Help Centre page. That stays in PS-008.

Commands/results:

- `npm install markdown-it@15.0.3 server-only@0.0.1` — completed. `package.json` and `package-lock.json` gained only those two packages and markdown-it's dependencies.
- `node scripts/export-help-permission-catalog.mjs` — wrote 395 permission names from the sibling PermissionSeeder and PlatformSupportPermissions sources.
- `node scripts/check-help-content.mjs` — `help content ok (12 articles)`. Node prints a module-type warning because the checker imports TypeScript and this package is not `"type": "module"`. The exit code is 0.
- `npx vitest run tests/unit/help` — 3 files, 17 passed.
- `scripts/ai/typecheck` — exited 0.
- `scripts/ai/frontend-check` — typecheck exited 0. Full Vitest then failed 19 tests in maps, reseller-client, client dashboard, column visibility, date-picker, and pay files. Those files were not part of this change. 680 tests passed.
- `scripts/ai/status` and `scripts/ai/diff` inspected after the edits.

Acceptance evidence:

- PS-007-A: `tests/unit/help/delivery.test.ts` requests the article and search routes. A staff actor without `clients.create` gets 404 and the body does not contain the create-article title or "Network Package". Search for that phrase returns no snippet. Related links on the contact article omit "Report an issue" until `platform-support.create` is present. The renderer test escapes `<script>`, drops `javascript:`, `data:`, and `file:` URLs, and rewrites a local image to `/api/help/media/...`. Media for an unauthorized actor is 404 with `nosniff` and `private, no-store`. A source scan rejects `use client` imports of `@/lib/help` and `@/content/help`. `lib/help/content.ts` and `lib/help/actor.ts` import `server-only` and the settings fetch uses `cache: "no-store"`. A production `next build` and a browser session were not run, so the compiled client chunk and a live page were not inspected.
- PS-007-B: the validator test fails duplicate ids, a missing Bangla front matter, a stale `translated_from_revision`, an unknown permission, an unsafe video id, a `javascript:` URL, a missing related id, and a `../` route. The published tree passes. Concurrent English and Bangla requests for `clients.create` return "Add a client" and "ক্লায়েন্ট যোগ করা". A draft with `developmentEnglishFallback` serves English in development and is hidden when drafts are off. A published article does not fall back. Help code does not call `changeLanguage`.
- PS-007-C: `canReadHelpArticle` reads the actor's permissions, `subscription.state`, `disabled_features`, and `read_only_features`. An expired disabled `clients` feature hides the client guides even if the permission is still present. An active subscription does not. An expired read-only `billing` feature keeps the invoice overview and hides a write tutorial. No database write and no content row were added. Permission changes are evaluated per request. A Markdown edit still needs the documented content check and an application release to reach production.
- PS-007-D: the 12 published articles were written from the current client form, client table, invoice table, subscription page, and platform-support composer. They do not describe bill calculation or the client activation bill. The renderer and path resolver reject raw HTML, unsafe URLs, bad locales, and `../` paths. No YouTube id was added. `video_status` is `not_configured`. No screenshot was placed under `public/`.

Remaining blockers: there is no Help Centre page yet, so these routes are the delivery API for PS-008. The production client bundle was not built. No browser session was signed in. The permission snapshot can drift until someone runs `node scripts/export-help-permission-catalog.mjs` and reviews it. The checker prints a Node module-type warning. Videos remain unset until a reviewed id is supplied. PS-008 was not started.
