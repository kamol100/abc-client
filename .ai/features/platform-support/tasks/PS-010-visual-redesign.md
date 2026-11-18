# PS-010 — Redesign platform support using the HTML reference and current app design

Status: implemented and ready for design review. Full acceptance remains open.
Priority: high — design review follow-up
Type: coordinated frontend/backend redesign and integration refactor
Created: 13 November 2026
Repositories: shadcn-client (frontend) and isp-backend (necessary API/backend work)
Depends on: the existing PS-001–009 implementation as currently committed; inspect actual source rather than assuming all earlier acceptance scenarios passed.

## Goal

Redesign the implemented Help Centre and separate platform-support feature using `design/platform-support/` as a visual and interaction reference, adapted to the current application design philosophy. The feature is not yet in production: necessary frontend, backend API, resource, service, model and schema changes are authorized within this ticket. Preserve the agreed product capabilities, security boundaries and data integrity, rather than freezing the current implementation. Use this ticket as the implementation and subsequent feature-review checklist.

The user likes the HTML prototype and dislikes the current implemented presentation. This is a redesign of the existing pre-production feature, with coordinated implementation changes where useful. Existing tenant/customer tickets remain separate and unchanged.

## Required reading and design reference

- Repository AGENTS.md, `.ai/workflows/frontend-feature.md`, `.ai/workflows/code-review.md`, the applicable frontend agent skill and `.cursor/rules/architecture.mdc`.
- Relevant installed Next.js guidance under `node_modules/next/dist/docs/` before writing code. Read canonical sibling `isp-backend/docs/architecture/multi-tenancy.md` before touching scoped data, auth, caching or API view models.
- Product, authorization and API contracts in this specification folder; current implementation/resources take precedence over outdated proposed field names. Record a verified mismatch rather than inventing a new endpoint.
- [HTML entry](../../../../design/platform-support/index.html), [styles](../../../../design/platform-support/styles.css), [rendering reference](../../../../design/platform-support/app.js), [prototype instructions](../../../../design/platform-support/README.md).

Prototype rendering functions identify the intended screens: `helpPage`, `listPage`, `threadPanel`, `detailSidebar`, `detailPage`, `chatPage`, `articlePage`, `drawer`, `issueModal`. Prototype CSS illustrates spacing, hierarchy, composition, states and responsive layout. Adapt those choices to the application’s actual typography, theme, density and shared components; it is not a pixel-for-pixel specification. Prototype JavaScript business behavior is simulated and must not replace real implementation logic.

## User clarification and design precedence

The user explicitly confirms that this feature is not yet in production and permits backend/API changes and other necessary implementation work. Do not require a new product-scope approval merely to add a required metric, change a support resource/route or improve the data model. Keep those changes coordinated across both repositories and covered by appropriate tests.

Design precedence is: (1) current application design philosophy and shared menu/component/theme conventions; (2) agreed platform-support product/accessibility/security requirements; (3) the HTML prototype as adaptable visual/interaction guidance. For example, the support sidebar menu must look and behave like the existing menu even when the prototype shows a different style. Pixel-perfect reproduction is explicitly not the goal.

Necessary schema migration authoring, API additions/changes and frontend consumer updates are in scope. Since the module is pre-production, its internal API does not need compatibility shims solely to preserve the earlier draft implementation. Inspect other consumers and update all affected consumers/tests/docs together; preserve unrelated API consumers and the standard application envelope. Preserve existing development data where feasible; pre-production status is not authorization for destructive resets, wipes or unreviewed migration execution against a non-test database. Existing repository rules for package installs, production settings, push and deploy continue to apply.

## Current problem and intended result

- Help Centre currently has a basic heading/search and flat article links. Target: a composed search hero, topic cards, underlined guide/FAQ/video tabs, popular real guides and a support contact panel.
- Requester and platform lists have functional tables/tabs but lack the prototype's page hierarchy, summary presentation and compact filter arrangement. Target: clear headings, consistent tabs, readable status/priority badges and real summary counts.
- Thread metadata, conversation, conversion and reply areas are currently separate stacked cards. Target: a coherent conversation panel with message bubbles, integrated composer and an adjacent details sidebar on desktop; stack cleanly on mobile.
- Launcher content is functional but visually basic. Target: the prototype's persistent Help button, contextual drawer hierarchy, article suggestions and clear chat/report actions.
- Article reader should adopt the prototype's readable measure, typography, topic navigation, metadata and related/contact affordances without weakening server-side content authorization.

Deliver the prototype’s useful composition and clarity through the current application’s design language. Do not blindly reproduce its mock shell, dimensions, green palette or individual controls. In particular, sidebar menu entries must follow the current menu’s grouping, icons, sizing, spacing, active/hover behavior, collapse behavior and permission conventions. Acceptance is based on a cohesive native app experience that visibly improves on the current feature, not exact screenshot matching. Record meaningful adaptations and why they fit the app.

## Scope and source map

Primary presentation files:

- `components/help/help-centre.tsx`, `help-launcher-panel.tsx`, `help-reader.tsx`.
- `components/platform-support/support-home.tsx`, `support-column.tsx`, `support-form-schema.ts`.
- `components/platform-support/support-thread.tsx`, especially `MessageList` and thread layout.
- `components/platform-support/support-composer.tsx`, including issue creation, conversion, image draft presentation and reply composer.
- `components/platform-support/admin/inbox-home.tsx`, `inbox-column.tsx`, `inbox-filter.ts`, `inbox-assignees.tsx`, `inbox-thread.tsx`.
- `components/platform-support/support-launcher.tsx`, `support-widget.tsx` for presentation integration and existing widget state.
- Existing thin pages under `/help`, `/platform-support`, `/platform-support-admin`; modify only necessary presentation props/metadata/integration.

Current data/policy integration points to inspect and adapt as needed:

- `support-model.ts`, `admin/inbox-model.ts`, query keys, request IDs, parsing, cursor/history merge and lifecycle helpers.
- `lib/platform-support/attachment-transport.ts`, `attachment-proxy.ts` and current authenticated upload/image routes.
- `lib/help/pages.ts`, `http.ts`, `catalog.ts`, `authorization.ts`, `context.ts`, `search.ts` and existing server-only article delivery.
- `useApiQuery`, `useApiMutation`, authenticated settings/capability output and per-record abilities.

These are a source map, not a requirement to edit every file or freeze existing internals. Reuse working code where practical; refactor or replace affected logic when necessary for a coherent implementation and verify equivalent product behavior with tests.

## Design and implementation rules

1. Preserve the existing application sidebar, navbar, branding and theme/density behavior. The prototype's surrounding mock workspace is not a request to redesign the entire application. Add or adjust only necessary support/help navigation affordances.
2. Translate reference HTML into React components and Tailwind using project theme tokens and cn(). Do not import the prototype's global `body`, `button`, `table`, `.sidebar`, `.main` or `:root` styles into the app. No document-wide styles, inline styles, embedded standalone app, iframe replacement or dangerously injected prototype HTML.
3. Reuse MyButton, Card, MyDialog/MyDrawer, DataTable and FormBuilder/AccordionFormBuilder. Style local wrappers/instances through supported props. Do not edit shadcn primitives or shared component defaults to force one feature's appearance. If a wrapper truly needs an extension, keep it optional, backwards-compatible and covered by a focused check.
4. Follow the current app’s selected theme, typography, density, radii, spacing, icons and interaction patterns. The prototype’s green is optional inspiration, not a required override. Prefer existing semantic tokens; any necessary feature-specific tokens must work in light/dark without replacing global colors. Adapt the reference’s composition rather than forcing its exact measurements.
5. Use the existing Lucide icon package and existing fonts. No new UI kit, icon system or dependency is expected. All changed UI strings and accessibility labels use react-i18next with matching en/bn keys in public/lang. Keep user-authored messages untranslated and escaped.
6. Reuse or factor suitable display components: page heading, tabs, status/priority badges, summary cards, conversation bubbles, metadata rows and attachment presentation. Choose tab and control styling consistent with current application conventions. Data ownership, hooks and models may be reorganized when needed for this redesign; keep the work scoped and test product outcomes.
7. Preserve the existing app's auth and role controls. Do not port the prototype's Preview as selector, fake permissions, sample data, in-memory messages, fictional counts, demo footer or synthetic invoice image into the production UI.
8. Responsive behavior is mandatory. Desktop thread content/details form two columns; mobile uses one column and accessible navigation/actions without clipping. Tables may use their existing intentional horizontal-scroll container; the page itself must not overflow horizontally. Drawers, dialogs and image viewers remain usable with an on-screen keyboard.
9. Functional feedback must remain visible: loading skeletons, refresh/stale status, retries, empty lists/search, failed uploads, ambiguous-send recovery, 409 conflicts, read-only/denied access and unavailable video states. Do not hide these to make the happy path resemble the reference.

## Preserve product behavior; evolve implementation as needed

Redesign must preserve permission-based access, own/reseller/company boundaries, platform-only inbox access, identity-scoped caches, meaningful pagination/filter behavior, no-store/private images, private staging and upload validation. Platform-support API URLs, payload/resource fields, query helpers and internal contracts may change with coordinated frontend/backend updates. Keep the repository’s standard API envelope and shared authentication/security conventions unless a separate explicit product decision changes them.

Retain five-image/5 MiB limits, previews, progress, remove-before-send, image-only messages, retry/deduplication and draft/request IDs. Preserve the fix for origins where crypto.randomUUID is unavailable. Do not replace upload state with the prototype's File/object-URL-only simulation.

Retain polling intervals/presence/backoff, cursor draining/deduplication, older-history pagination, scroll preservation, visible-message observation/read acknowledgement, unread indicators, conversion links/history, expected-version updates, assignment and lifecycle operations. Changing DOM structure must not detach refs/observers or mark unseen messages read. Do not recreate the composer on ordinary refetch and lose pending drafts/images.

Retain permission-filtered article/search/context/media delivery, Markdown files, real FAQs, language switching, related links and reviewed video handling. Do not return all article metadata to the browser merely to build topic cards.

Necessary backend/API/database redesign and directly related functional fixes are included, with their own implementation and test evidence. Sockets, unrelated product workflows, external messaging integrations, production deployment/configuration and legacy ticket repairs are not implied by permission to redesign this feature. Record unrelated defects separately.

## Real-data differences to resolve

### Topic grouping

Current HelpCardView exposes id/slug/kind/title/summary/video_status but no topic/category. Inspect the existing catalog for grouping metadata. Add or reshape the server-authorized topic/card view and its page/search/context consumers/types/tests as needed. Backend metadata endpoints or resources may be added/changed when justified. Article/tutorial bodies, FAQs and video metadata remain file-based per the product contract. Return only allowed content and grouping metadata; do not hardcode prototype topics/counts as the real library.

### Summary cards

Inventory actual requester/platform summary resource fields before designing statistics. Add or change backend summary metrics, queries and resources where the final UI needs them, and update frontend types/consumers and tests in the same work. Every metric must use a verified definition and correct permission/tenant/filter scope. Never compute a global total from one loaded page, merely assume an endpoint exists, or use demo numbers. Omit statistics that do not help the user rather than copying every prototype card.

### Real content and videos

Keep the implemented documentation library. Topic counts, popular/featured guides and related links must come from permitted real content; a simple curated article-ID list can select featured content after authorization. FAQ answers remain actual authorized content. Show a real video player only for configured reviewed IDs. Empty videos must not show prototype placeholder tutorials in production.

### App shell and accent

Capture a baseline with the actual app sidebar/navbar. Use its current navigation/menu patterns for support entries; preserve shell interactions and theme selection. Compare content/launcher composition to the reference while evaluating whether it belongs in the current application. Adjust prototype layout/color/spacing where necessary instead of changing unrelated application design to fit the mockup.

## Ordered implementation and review checkpoints

Implement in small reviewable stages; keep screenshots and acceptance status for each. A review checkpoint records whether the visual result matches; it is not permission to deploy. Do not claim the whole ticket complete after only stage 1.

### Stage 1 — Help Centre and shared visual vocabulary

Capture baseline screenshots and identify current app component/menu/theme conventions. Adapt the reference’s hierarchy into reusable presentation components. Build useful hero/search, permission-filtered topic cards, popular guides, contact panel and guide/FAQ/video tabs, with necessary real-data/API changes. Include loading/search-empty/error/video-empty states. Review this first so later screens reuse the same app-consistent choices.

### Stage 2 — Requester list and issue creation

Restyle My requests heading, verified summary cards, tabs, scope selector, filters and DataTable cells. Present report-issue form in the established MyDialog/MyDrawer pattern matching the prototype's form hierarchy. Preserve compose deep links, first-message validation, image uploads and routing after acknowledgement. A direct compose URL must still open the appropriate UI.

### Stage 3 — Issue and chat conversation screens

Build header/back/reference/actions, conversation panel, sender/agent identity, message bubbles/timestamps, image previews/viewer, composer, details sidebar and linked history. Preserve distinct issues/chats and existing start/resume behavior. Apply conversion UI without changing conversion semantics. Verify long messages, missing optional metadata, large history and disabled/read-only actions.

### Stage 4 — Platform inbox and agent detail

Adapt list/summary/tab/filter hierarchy, tenant/reseller/requester identity and assignment/status presentation to the app’s conventions. Make coordinated backend metrics/filter/resource changes when needed. Reuse approved conversation display in agent detail where useful, while retaining separate platform authorization and audit context. Platform read-only agents have no write controls. Clear ownership context stays visible while composing a reply.

### Stage 5 — Contextual Help drawer and article reader

Adapt the persistent launcher, unread badge, drawer intro, contextual suggestions, links and action hierarchy to the current app’s controls and interaction patterns. Retain focus management, small-screen drawer behavior and include-page controls. Finish article typography/readable width, topic navigation, table of contents, language/metadata/related/contact presentation using real content. A helpfulness/feedback action is optional: implement an appropriate API and authorized behavior only if it improves the chosen design, or omit it with a note. Backend permission does not make every prototype affordance mandatory; documentation content itself stays file-based.

### Stage 6 — Cross-screen, API integration and regression review

Apply the review matrix and checks below, resolve visual inconsistencies, record exact evidence and leave implementation/release status truthful. No changes to existing PS-009 readiness claims without new evidence.

## Acceptance criteria

- PS-010-A01 — Design coherence: Help Centre, requester list, issue creation, issue detail, chat/conversion, platform inbox/detail, Help drawer and article reader use the reference’s useful composition while fitting the current app’s visual/interaction philosophy. No blind copying or pixel-perfect requirement; meaningful adaptations are documented.
- PS-010-A02 — Native navigation/shell: support sidebar entries match existing menu grouping, icons, typography, spacing, active/hover/collapsed states and permission behavior. Navbar/theme/density and unrelated screens remain compatible; no copied mock sidebar, leaked prototype CSS, sample records, preview-role switch or fake metrics.
- PS-010-A03 — Help content: topics/search/FAQ/video/related cards use current permitted content, real counts and existing authorized delivery. Forbidden titles/snippets/media remain hidden. Empty video state is honest.
- PS-010-A04 — Requester access: tenant staff, reseller staff and authorized company-wide staff see their actual allowed records/actions. UI redesign cannot expand scope or alter requests' tenant ownership.
- PS-010-A05 — Conversation behavior: text/image-only/mixed sends, max-five images, failed upload/retry, draft preservation, duplicate-send recovery, resolve/reopen and chat-to-issue linked history continue working.
- PS-010-A06 — Agent workflow: platform inbox retains clear source tenant/reseller/requester identity, real filters/pagination/summary, assignment/version conflicts and per-action controls. Ordinary company-1 users cannot access it and read-only agents cannot mutate it.
- PS-010-A07 — Polling/read state: hidden/offline/backoff/reconnect, cursor backlog, older history, scrolling and visible-read acknowledgements retain behavior after DOM/layout changes; incoming messages do not steal focus or discard a draft.
- PS-010-A08 — Localization/theme: English and Bangla in light and dark themes render with correct keys, readable labels, wrapping and contrast. No new hardcoded user-facing strings or fixed global colors.
- PS-010-A09 — Responsive/accessibility: desktop and mobile pass the review matrix; keyboard-only launcher/dialog/form/image viewer navigation, Escape/close, focus restoration, field labels and error announcements work. Hover-only controls have keyboard/touch equivalents.
- PS-010-A10 — States: loading, empty, search failure, stale refresh, denied/read-only, upload/send failure, conflicts and long-content states remain visible and usable. No successful empty inbox is shown for a request failure.
- PS-010-A11 — Verification: relevant automated checks and actual visual comparisons have recorded results, not just screenshots of prototype/mock data. Missing fixtures or browser access are explicit limits. Existing PS-009 gaps are not relabeled passed because styling is complete.
- PS-010-A12 — Coordinated changes: necessary frontend/backend/API/schema changes are implemented together, documented and tested; no stale field/route consumer or unsupported metric remains. Original customer tickets, file-based documentation, authorization/private-image guarantees and unrelated features remain intact. Repository approval rules for installs, production configuration, non-test data operations, push and deployment still apply.

## Visual review matrix and evidence

Use controlled synthetic/disposable data and current actual permissions. Never capture credentials, tokens, private customer messages or images in committed evidence.

Capture reference and implementation at comparable viewport/content widths, and include the current app baseline to assess native consistency rather than exact pixel equality. Minimum desktop viewport: 1440 × 900; minimum mobile viewport: 390 × 844. Check an intermediate tablet width around 768 pixels for layout transitions. Include English/Bangla and light/dark screenshots across the redesigned screen set; at minimum every screen has desktop/mobile coverage and each shared presentation component is exercised in all language/theme combinations. Do not describe an untested combination as passed.

Evidence folder: `.ai/features/platform-support/evidence/PS-010/`. Create an evidence index during implementation with screenshot paths, stage, route, viewport, language/theme, permitted persona, synthetic fixture reference, observed result, deviations and remaining issues. Include an acceptance checklist keyed PS-010-A01–A12. Record a before/after comparison for every redesigned surface. Keep design review outcomes distinct from automated test results and full feature-release readiness.

Functional checks use the existing unit suites under `tests/unit/platform-support/` and `tests/unit/help/`, adding/updating meaningful assertions for changed behavior. For affected backend endpoints/resources/services/schema, add focused Pest coverage including actual tenant/reseller/platform visibility, validation, summary/filter correctness and any changed contract. Run backend tests and changed-file Pint/PHPStan in the backend repository according to its AGENTS.md. Preserve existing test IDs where they describe the same action. Tests tied to obsolete presentation may be updated to semantic assertions; do not delete permission/retry/private-image tests to make a layout pass.

Run relevant focused tests and `scripts/ai/frontend-check`; report unrelated existing failures precisely. Do not rebuild the broken lint config. Browser visual inspection is required to establish visual acceptance, but do not run the production Playwright e2e suite merely for CSS work. If this ticket changes/adds e2e tests, use the dedicated existing support config and safe fixture requirements; never invent environment attestations or mutate real tenant data. Reading preserved PS-009 evidence is not a substitute for checking the redesigned screens.

## Definition of done

All six stages are implemented and visually reviewed; acceptance IDs have evidence; justified deviations are recorded; required checks have actual results; no unresolved redesign regression remains. User design feedback is incorporated or explicitly left as a pending review item. Update ticket status accordingly and report any inherited functional/release blockers separately. Update `.ai/report.md` and inspect diff/status. Deployment is outside this ticket.

## Suggested implementation prompt

> Implement PS-010 stage 1 from `.ai/features/platform-support/tasks/PS-010-visual-redesign.md`. Use `design/platform-support/` as inspiration and a composition reference, not a template to copy blindly. Maintain the current application’s design philosophy, especially sidebar/menu, theme and shared component conventions. This feature is pre-production: necessary coordinated backend API/resource/service/schema and frontend changes are authorized. Preserve the agreed capabilities, tenant/reseller/platform security and file-based documentation. Follow both repositories’ rules, implement and test real data needs, and capture desktop/mobile evidence. Complete and report stage 1 for design review before proceeding. Do not mark the full ticket complete or alter earlier PS-009 readiness status without new evidence.

For an explicitly requested full-ticket run, continue through all stages and record each checkpoint; the stage-1 prompt above deliberately limits work to the first reviewable slice.

## Implementation and review record

- Stage 1 implemented. The Help Centre has a search hero, permission-filtered topics, featured guides, FAQ and video tabs, and contact actions.
- Stage 2 implemented. My requests uses scoped summary counts and the issue form uses the shared dialog and form components.
- Stage 3 implemented. Issues and chat share the conversation presentation, with an integrated composer, details, and a linked issue conversion dialog.
- Stage 4 implemented. The platform inbox and thread show requester and company context and retain authorized agent actions.
- Stage 5 implemented. Contextual Help uses a right-side desktop drawer and a mobile bottom sheet. The article reader uses the authorized Markdown content and related guides.
- Stage 6 completed for the recorded browser and automated checks. The full visual matrix and write scenarios still need verification.
- [Browser evidence, adaptations, and PS-010-A01–A12 checklist](../evidence/PS-010/README.md)
- The Help content check validated 184 articles. Typecheck and 90 focused tests passed. The full Vitest run reported 693 passes and 19 existing unrelated failures.
- The existing scoped summary APIs and mutation contracts supplied the redesign. The only data contract additions were frontend server-authorized Help view metadata.
- User design feedback is pending. PS-009 remains reviewable and not release-ready.
