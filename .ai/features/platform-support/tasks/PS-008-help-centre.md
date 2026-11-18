# PS-008 — Contextual Help Centre, FAQs, videos and content coverage

Status: reviewable
Repository: shadcn-client
Depends on: PS-005–007 complete.

## Goal

Complete the help launcher and full Help Centre with permission-filtered English/Bangla feature guides, FAQs and optional reviewed YouTube videos.

## UI work

- Add thin `app/(dashboard)/help/page.tsx` and `help/[...slug]/page.tsx`, components under `components/help/`, server article/search delivery using PS-007. Read article permissions before rendering or emitting metadata. If adding `/api/help/search`, authenticate and authorize it server-side, return private/no-store, and reuse PS-007 policy. This same-origin help endpoint serves files, not a fabricated Laravel docs database API.
- Integrate one existing PS-005 Help launcher with Help for this page, search, feature guide/FAQ/video tabs, Report an issue and Chat. Retain existing widget/chat state when opening an article. Full reader provides table of contents, related permitted guides, language switch and links back to current feature. No inaccessible article titles leak through empty states or breadcrumbs.
- Route-to-help mappings use most-specific match and verified screen permissions. Unmapped routes offer general support rather than an unrelated privileged guide. Forms can open exact action guides without duplicating the widget.
- Video component accepts only reviewed ID metadata, lazy loads responsive titled privacy-enhanced YouTube iframe without autoplay, and identifies spoken language. Bangla text accompanies an English-only video. Render an unavailable/failure link only for actual configured videos, not placeholder players. YouTube links are not private entitlement enforcement.
- Use sanitized path/article context on support submission with visible “Include this page” control. Strip all query/hash by default. An article link never includes form values/customer details. Bilingual labels, keyboard navigation, accessible dialogs/drawer, dark/light and mobile supported.

## Feature coverage work — implement as sequential batches

Create `content/help/coverage.json` from verified current dashboard navigation and real interactive routes. Each entry records actual route, backend permission/entitlement, audience, article IDs, en/bn revision readiness, FAQ IDs, optional real video and review evidence. A grouped overview can cover several simple read-only routes only if each route is mapped and access remains exact. Action procedures with stricter permissions need separate articles. Do not equate a navigation parent permission with every child's permission.

Execute batches one at a time; record each batch's completion/evidence in this task:

1. Getting started, dashboard, platform support, clients/create/edit/archive/maps, zones and sub-zones; then invoices, payments and invoice types.
2. Expenses/types, funds/transactions, wallets, resellers, agents/transactions, packages and reseller reports.
3. Networks, MikroTik packages/sync/commands, devices/types, OLTs/ONUs/NOC, TJ boxes/maps. Document source-verified actions and warnings for device-impacting operations without executing them to produce documentation.
4. Legacy customer tickets, subjects and tags (documentation only); SMS/templates/Telegram/communication queues/logs/gateways; inventory/products/in/out/categories/units/vendors and related reports.
5. Staff/HR/salary, roles/permissions, notifications/preferences, company/profile/settings, remaining reports and actual authenticated feature pages. Inventory current source first; names here are grouping guidance, not assertions of exact endpoints.
6. Platform-only company/user/subscription/feature/demo/activity administration and the new platform inbox. Protect all platform articles with their real platform-only capabilities; tenant staff must not receive their titles/snippets/assets.

For each supported feature supply an overview, at least one real FAQ and task tutorials for its major available actions. Disabled/commented legacy navigation and developer/demo-only pages need an explicit excluded reason rather than fake content. Some real pages are not in the main menu; include them via a reviewed route inventory. Known unsupported/business-ambiguous behavior is documented as a limitation, never invented. A useful initial release may ship batches 1–2, but mark that release partial; this task is not complete until all current supported feature entries are covered or explicitly agreed out of scope.

No real tutorial video URLs were provided in the request. Do not block text/FAQ coverage on that missing optional content, invent URLs, download videos or publish placeholders. Mark video status `not_configured` and provide the documented catalog procedure to add a reviewed English/Bangla video later. Video embedding capability must still be tested with controlled fixtures.

## Acceptance

- PS-008-A: Help works from authenticated tenant and reseller staff routes; documentation language switch preserves article; context suggestions respect action/feature permissions.
- PS-008-B: forbidden direct articles, search, breadcrumbs, FAQ/video tab data, media and browser payloads do not disclose restricted information. A user without a feature sees general help only.
- PS-008-C: full reader/mobile drawer/keyboard/theme/error states work; optional support context is safe and user-controlled. Existing tickets and public marketing FAQ remain intact.
- PS-008-D: every current supported dashboard feature has validated bilingual coverage or an explicit reviewed exclusion. Per-batch inventory/evidence distinguish complete from partial; all published revision pairs match.
- PS-008-E: configured real video embeds work with language labels and no autoplay; absent videos show no fake player. Documentation publishing workflow is reproducible.

## Verification and handoff

Run content validator, focused help/route/search/i18n tests and frontend-check; browser checks under PS-009. Track content-review limitations honestly (a key-existence test is not proof of Bangla translation quality). No database documentation storage.

## Implementation record

Status is reviewable. Acceptance IDs below are evidenced only for the checks named. Browser, keyboard, theme, and mobile checks stay in PS-009. No acceptance ID is marked complete.

Changed files:

- Pages: `app/(dashboard)/help/page.tsx`, `app/(dashboard)/help/[...slug]/page.tsx`. Both are `force-dynamic` and `revalidate = 0`. Metadata uses the article title only after `loadHelpArticle` authorizes it.
- Context API: `app/api/help/context/route.ts`, `lib/help/context.ts`, `lib/help/pages.ts`, `lib/help/http.ts`. Same-origin, staff-only, `private, no-store`. No Laravel docs endpoint was added.
- Reader and launcher: `components/help/help-centre.tsx`, `components/help/help-reader.tsx`, `components/help/help-launcher-panel.tsx`, `components/platform-support/support-widget.tsx`, `support-launcher.tsx`, `support-composer.tsx`, `support-home.tsx`, `support-model.ts`.
- Form links: `app/(dashboard)/clients/create/page.tsx`, `app/(dashboard)/invoices/create/page.tsx`.
- Content: `content/help/catalog.ts` (184 published policies), `content/help/coverage.json`, English and Bangla Markdown for the new guides and FAQs, revision 2 of getting started, `content/help/README.md`.
- Validator and labels: `lib/help/validate.ts`, `lib/help/render.ts`, `lib/help/headings.ts`, `lib/help/video.ts`, `scripts/check-help-content.mjs`, `public/lang/en.json`, `public/lang/bn.json`.
- Tests: `tests/unit/help/centre.test.ts`, `tests/unit/platform-support/support-launcher.test.tsx`, `tests/unit/platform-support/support-model.test.ts`.
- Records: this task file, `.ai/features/platform-support/README.md`, and `.ai/report.md`.

Commands and results:

- `scripts/ai/status` before editing: `master` tracking `origin/master`, clean.
- `node scripts/check-help-content.mjs`: exit 0, `help content ok (184 articles)`. Node prints the existing module-type warning.
- `npx vitest run tests/unit/help tests/unit/platform-support/support-model.test.ts tests/unit/platform-support/support-launcher.test.tsx`: 6 files, 44 passed, then the added context case was included in the full run.
- `scripts/ai/typecheck`: exit 0.
- `scripts/ai/frontend-check`: typecheck exit 0. Full Vitest then failed 19 tests in maps, reseller-client, client dashboard, column visibility, date-picker, and pay. 689 passed. Those failing files were not part of this change.
- `scripts/ai/status` and `scripts/ai/diff` after the code edit. Tracked diff was 18 files, +4083/−73, and 4606 lines. Untracked help routes, components, and articles were only in status. After this record, status shows 21 modified files and 140 untracked paths. Branch `master` is not ahead. Nothing was committed or pushed. isp-backend was not edited.

Acceptance evidence:

- PS-008-A: `helpContextResponse` returns `clients.create` for a staff actor with `clients.create`, and only the three general articles for `/clients/create` without that permission. The same general fallback is used for `/tables` and for `/companies` without `companies.access`. The reader calls `setLanguage` and `router.refresh()`. No signed-in tenant or reseller session was opened, so language persistence and a live reseller route are not evidenced.
- PS-008-B: the forbidden context body does not contain `Add a client`. `/platform-support-admin` without `platform-support-admin.access` does not contain `Platform inbox` or `platform.inbox`. A route value with `phone=01700000000` is stored as `/clients/create` and the phone is absent from the JSON. Article 404 and search hiding remain covered by the PS-007 delivery tests. Breadcrumbs render `help.title` plus the authorized article title only. No browser network capture was taken.
- PS-008-C: `supportSubmissionContext` strips the query and hash, attaches `article_id` only on `/help/...`, and returns null when include-page is off. The launcher test shows Help without `platform-support.access` and hides Report an issue and Chat in that case. Desktop dialog has Escape and a tab loop; mobile uses `MyDrawer`. Those interactions were not exercised in a browser. Legacy ticket files and the public marketing FAQ were not in the diff.
- PS-008-D: `validateHelpCoverage` returns no errors. Inventory has 121 routes, 113 covered entries, and 9 exclusions. Published revision pairs match through the content checker. English and Bangla `help` keys match, and the Bangla description is not a copy of the English one. That is not a translation review.
- PS-008-E: fixture id `FixtureVid1` embeds on `https://www.youtube-nocookie.com` without autoplay. An invalid id is null. A Bangla view of an English-only fixture sets `spoken_locale` to `en`. Every coverage entry is `not_configured`. No catalog policy has a video id. The add-a-video steps are in `content/help/README.md` and `coverage.json` `video_procedure`. No real YouTube playback was run.

Batch evidence, from `coverage.json` review labels and `node scripts/check-help-content.mjs`:

1. 21 routes. Getting started, dashboard, existing platform-support articles, clients create/edit/archive/restore/maps, zones, sub-zones, invoices, payments, and invoice types.
2. 16 routes. Expenses and expense types, funds and fund transactions, wallets, resellers, agents and agent transactions, client and reseller packages, and the reseller client report.
3. 14 routes. Networks, MikroTik packages, sync, and the four print commands, devices and device types, OLT list/show/access-test/monitoring, ONU list, NOC, and TJ boxes/map. No router or OLT action was executed.
4. 21 routes. Customer tickets, subjects, and tags; SMS send and templates; Telegram; communication queue, logs, and gateways; products, stock in/out, product reports, categories, units, and vendors.
5. 32 routes. Staff, salaries, roles, permissions, notifications, settings, the reports that have their own permissions, histories, payment gateways, and staff/company profile.
6. 9 routes. Companies, users, subscription plans, features, company subscriptions, demo requests, activity logs, and the platform inbox and thread. Inbox and thread use audience `platform` and `platform-support-admin.access` / `platform-support-admin.show`.

Documented limitations, not UI workarounds: `client.dashboard` is not in the permission snapshot; `notifications.index`, `company.profile.view`, `reseller.profile.view`, and `staff.account` differ from the menu or snapshot names; the zones table does not locally check `zones.create`; the product-out report menu uses `products-in.report`; `devices.*` maps to feature `olts` while the menu groups it under network; `agents.*` maps to inventory; `monitoring.summary` has no feature prefix. Article summaries are clipped at about 160 characters.

Remaining blockers:

- No signed-in browser pass. Theme, mobile drawer, keyboard, and language switch were not clicked.
- Bangla guide text was written in this change. A reviewer still needs to read it. Key parity is not that review.
- The chat page shows Include this page after the first chat request is sent. The launcher checkbox is the control that can be set before Chat or Report an issue. Checking the box later records the path of the page that is open then, still without the query or hash.
- No reviewed YouTube id was supplied, so no production embed exists.
- PS-009 was not started.
