# PS-008 — Contextual Help Centre, FAQs, videos and content coverage

Status: not started
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

Changed files: pending. Commands/results: pending. Acceptance evidence: pending. Batch 1–6 evidence: pending. Remaining blockers: pending.
