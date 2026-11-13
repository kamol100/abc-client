# PS-007 — File-based bilingual documentation engine

Status: not started
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

Changed files: pending. Commands/results: pending. Acceptance evidence: pending. Remaining blockers: pending.
