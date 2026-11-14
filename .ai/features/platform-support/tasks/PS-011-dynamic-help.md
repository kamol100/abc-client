# PS-011 — Database-backed Help Centre

Status: **Implemented and verified on SQLite.** The target database migration and seed, seeded browser acceptance, and static Markdown removal are pending. This document covers the Laravel API and seeder in the sibling `isp-backend` repository and the Next.js Help Centre and management UI in `shadcn-client`.

The app tenant manages the shared library. Authenticated tenant staff use the current Help Centre, contextual drawer, search, and article pages. Articles are read from the database after the seed import is verified.

## 1. Laravel schema and access

- Create `help_categories` with `id`, unique `category_key`, `name_en`, and `name_bn`.
- Create `help_articles` with `id`, required category foreign key, unique `article_key` and `slug`, `kind` (`guide`, `faq`, or `video`), `status` (`draft`, `published`, or `archived`), timestamps, English/Bangla pairs for title, summary, and Markdown body, and one optional video URL. The original migration leaves the legacy Bangla video column in place; the API ignores it. Use the agreed nullable content columns. Restrict deletion of a category with articles. The library is shared, so the tables carry no tenant ownership fields.
- Require both title and body translations when publishing written guides and FAQs, following current bilingual publishing behavior. Require a title in both languages and a supported video URL for a published video. Video text is optional. Accept guide and FAQ video URLs as supplemental content. Normalize supported YouTube URLs to the video ID before using the existing embed helper, and show the same video in both languages.
- Generate the category key from the English name and the article key and slug from the English title when creating a record. Resolve duplicates with numeric suffixes. Preserve identifiers on rename and during seed import.
- Expose authenticated staff read operations for categories, lists, article detail, search, and page context. Filter before returning article content, summaries, search results, or related links. Reject anonymous, subscriber, and locked users. Return published content to readers and limit draft preview to editors. Use private responses for permission-filtered reads and draft previews.
- Use the existing named platform company constant (company ID 1) and platform-only route permissions for category and article management. Enforce them in Laravel. Deny management to other tenants, including users assigned a similarly named role, and to impersonated sessions. Use the existing activity log for management actions.
- Keep route patterns, related links, search keywords, ordering, and existing article access rules in backend-owned metadata keyed by `article_key`. Do not add the declined schema columns. For new articles, use the general published staff policy explicitly, with empty route mappings and related links until metadata is added. Do not apply that default to a previously restricted key. Keep stable keys and slugs after publishing so metadata and links continue to resolve.

## 2. App-tenant management UI

- Add a permission-gated Help management entry for the app tenant. Provide separate Articles and Article Categories submenu pages, create/edit forms, draft preview, publish, and archive. Use existing form, table, dialog, query, and mutation components.
- Place titles first in the article form. Edit bilingual summaries and bodies in rich text and store them as Markdown. Provide one video URL field and show validation when publishing. Render previews through the same safe Markdown and video rules used by readers.
- Keep the existing reader routes and layout. The reader has no management controls. Verify the management forms on desktop and mobile.

## 3. Laravel seeder and import verification

- Export the current catalog and Markdown into a versioned seed dataset in the Laravel repository before removing the source files. Parse Markdown front matter into title, summary, keyword, language, and revision fields for import validation. Copy the Markdown body separately. The production seeder must run from the Laravel checkout alone.
- Seed categories from the existing topic mapping. Insert articles by stable key with their original slugs, kinds, publication state, and English/Bangla content. Keep contextual route patterns, related article keys, and permission metadata keyed to those same entries. Preserve internal help links and any referenced media. Inventory existing videos and media before deciding whether there is anything to transfer.
- Make the Laravel seeder transactional and safe to rerun. Insert missing records and report conflicts. Preserve admin edits on existing records. Validate duplicate keys/slugs, missing translations, invalid category references, broken internal links, and missing policy for restricted entries before writing.
- Compare a pre-import manifest with seeded rows by key, locale, slug, category, kind, status, and normalized content checksum. Import all 184 article keys in the current inventory, including the four restricted articles. Test a fresh SQLite seed and a second run after an editor changes a seeded row.

## 4. Reader cutover and Markdown removal

- Keep `/help`, existing article URLs, and the contextual drawer. Adapt the Next.js Help data loaders and route handlers to the authorized Laravel reads and keep the existing staff navigation, cards, FAQ expansion, Videos tab, search, locale behavior, and visual design. Use database categories for grouping while retaining the existing presentation. Support standalone video entries alongside any configured guide videos.
- Deploy the schema, run the approved seeder, and verify seeded data before switching readers to the API. Test both locales, direct links, search, FAQ expansion, video playback, related articles, and context from a known route. Verify permission behavior using ordinary tenant staff, an authorized app-tenant editor, and an unauthorized caller. Check mobile and desktop for layout shifts and loading/error behavior.
- Remove the static article Markdown under `content/help/en/` and `content/help/bn/` only after the seeded API reads and parity checks pass. Remove the old filesystem article loader and replace the Markdown-only validation path with seed and API checks. Keep the Laravel seed dataset so a fresh environment can still populate the library. Keep asset delivery working for any images referenced by imported content.
- Before cleanup, the previous frontend release can serve as the rollback for the reader. Preserve the database and edits during a frontend rollback. Verify an install from the Laravel seed dataset again after the frontend Markdown is removed.

## Restricted platform content

Import `platform.inbox`, `platform.inbox.faq`, `platform.thread`, and `platform.thread.faq`. Laravel enforces their existing platform-only permissions through metadata keyed by `article_key`. The inbox pair requires `platform-support-admin.access` and the thread pair requires `platform-support-admin.show`. These keys fail closed if their policy metadata is absent.

## Acceptance

- Authorized app-tenant editors can manage both languages and publish guides, FAQs, and videos. Other tenants have read-only access to content they are eligible to see.
- An editor's change appears in the existing staff Help UI through the API. Existing in-scope URLs and links resolve in both languages.
- Verify that each of the four restricted articles is available to authorized platform staff and hidden from ordinary tenant staff in lists, search, direct links, related articles, and contextual help.
- Seed verification accounts for the complete source inventory. The seeder runs after frontend Markdown removal and never overwrites editor changes.
- Backend Pest covers authorization, publication, search visibility, and seed repeatability. Frontend checks cover the existing reader behavior and admin forms. Record browser evidence and the production seed verification before deleting Markdown content.

## Cutover checklist

1. Apply the Laravel migration on the approved target database. Run `Database\Seeders\Project\PermissionSeeder` to register the route permissions, then run `Database\Seeders\HelpLibrarySeeder`.
2. Confirm the import and access checks in the target environment. The staff reader selects the Laravel data when the seed transaction has completed. Before that point, the API reports an unseeded library and the frontend continues reading the existing published Markdown.
3. Verify the seeded editor and staff flows in Chrome on desktop and mobile, including Bangla, contextual help, playback, and refresh behavior. Then remove the static Markdown and obsolete filesystem reader in a cleanup change.
