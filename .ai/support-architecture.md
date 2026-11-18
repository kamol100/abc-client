# ISP Help Centre and platform support — architecture advice

Reviewed 13 November 2026. This is a source-based proposal, not an implementation or a live security verification. Scope assumes tenant staff need help from the SaaS platform team. Subscribers contacting their own ISP remain a separate support audience.

## Recommendation

Build an integrated Help Centre with private, Git-managed English/Bangla Markdown, contextual help throughout the dashboard, and a separate Laravel platform-support conversation service. Use TanStack Query polling initially. Keep documentation, FAQs and video metadata in files; keep conversations, messages and read state in the database. These are different storage needs.

## What the repositories already provide

- Next.js layouts already load authenticated settings/profile into AppProvider. `context/app-provider.tsx` exposes `usePermissions().hasPermission()`. Staff navigation is centralized in `hooks/use-menu-items.ts`.
- `hooks/use-api-query.ts` accepts TanStack Query options, including intervals and enabled conditions. It defaults `refetchOnWindowFocus` to false; support queries can override this. `app/actions.ts` keeps API access server-side and uses `cache: "no-store"`.
- Staff and subscriber message components already poll every five seconds: `components/tickets/ticket-message-thread.tsx` and `components/client-area/tickets/client-ticket-message-thread.tsx`.
- Laravel has tenant/reseller-scoped Ticket, TicketMessage, assignment, statuses, tags, subjects, notifications and ticket routes. These represent ISP operations; subscriber endpoints explicitly check client ownership. This is reusable experience and UI structure, not a ready-made platform inbox.
- English/Bangla UI translation infrastructure exists. The public marketing FAQ exists in `components/marketing/faq/faq-page.tsx`; it is not a permission-aware feature knowledge base.
- The inspected package.json has no declared Markdown/MDX renderer. A maintained renderer would require a dependency decision and installation approval before implementation.

## User experience

Mount one Help launcher in the authenticated staff layout, available across routes. On mobile, open a drawer; on desktop, a help panel. Include Help for this page, Search documentation, FAQs/videos, and Contact platform support. Also provide a full Help Centre page with deep links, article headings and related guides. Keep the launcher available for users without operational ticket permissions.

Use a central route-to-help registry: `/clients` maps to the client overview; `/clients/create` maps to client creation. Match the most specific route first. This avoids implementing a separate help system in every form. Reuse MyButton, MyDrawer/MyDialog and existing theme tokens. Put short UI copy in en.json/bn.json; long articles stay in Markdown.

Contact support should carry an optional article ID and a sanitized page path. Explain the context being attached. Strip query parameters and fragments unless explicitly allowlisted; never automatically attach form values, router credentials, tokens or customer billing data. Show sent/pending/failed states and the time of the last successful refresh. Call this support messaging, with a response expectation, rather than implying agents are always online.

## Documentation files and localization

Suggested future structure:

```text
content/help/catalog.ts
content/help/en/clients/overview.md
content/help/en/clients/create.md
content/help/bn/clients/overview.md
content/help/bn/clients/create.md
content/help/en/faq/billing.md
content/help/bn/faq/billing.md
lib/help/                         # server-only loader and authorization
components/help/                  # shared interactive help UI
app/(dashboard)/help/[...slug]/page.tsx
```

Use stable article IDs and slugs shared across languages. Keep access policy in one typed catalog so translators cannot accidentally change permissions between languages. Catalog entries should contain ID, feature, audience, permissionsAll/permissionsAny, routes, related IDs, order, publication state, review date and locale-specific video IDs. Titles, summaries, keywords and article body can be localized file metadata. FAQ entries use the same access policy as articles. A restricted section should be a separate article or explicitly protected block; avoid one overview that embeds instructions for every privileged action.

Write actual English and Bangla editions, not browser-time machine translation. Reuse existing technical transliteration conventions. On language switch, retain the article ID. Require both editions before publishing; during drafting, an explicit English fallback with a translation notice is acceptable. Track source revision/review state so an existing but outdated Bangla file is detected. Validate language pairs, duplicate slugs, internal links, permission names and video IDs during the build/check workflow.

Start with plain .md and a maintained Markdown renderer, disabling arbitrary raw HTML and unsafe URL schemes. Store video IDs as metadata and render them with a controlled component outside the Markdown body. This meets the embedded-video requirement without executable MDX. Use MDX only if inline custom components are truly needed; restrict it to trusted repository authors. Next.js supports local Markdown/MDX, but MDX adds executable content and build configuration. See [Next.js documentation](https://nextjs.org/docs/app/guides/mdx).

Deploy content with the application first. A later alternative is a separate private content Git repository, pulled during CI into a versioned release. That supports separate editorial ownership but adds publication and version coordination. Neither requires document rows in a database. A standalone documentation site is reasonable for public guides, but requires additional integration for per-user permissions and contextual help.

## Enforcing documentation permissions

Treat this as real access control, not only hiding menu items:

1. The Laravel permission/entitlement policy remains authoritative. Resolve fresh effective permissions server-side using the existing authenticated API infrastructure; verify how settings permissions reflect subscription entitlements before using them as the only policy input.
2. Require feature access for an overview; require the specific action permission for an action tutorial. For example client creation requires `clients.create`; editing uses the actual backend route permission `clients.edit`, not an invented `clients.update`.
3. Check access before returning article content, titles, summaries, related links, FAQ answers, video metadata or search snippets. Apply the same resolver to direct URLs and search endpoints.
4. Keep content outside public/. Do not import the complete content catalog/bodies into a client bundle or publish a complete search JSON. Check attached images/downloads too. Resolve slugs through the catalog and allowlist en/bn rather than constructing arbitrary filesystem paths from input.
5. Pure Markdown files/parsed content may be cached internally by content revision and locale. Authorized responses must remain private; filter on every request. Query caches need identity/audience context and must clear on logout/impersonation or scope change. Company/reseller IDs in cache keys identify cached data; they never authorize API access.

Begin search with permitted titles, summaries and bilingual keywords. Add full-text search only when content volume justifies it; an internal prebuilt index is fine, but filter before returning matches. Never ship restricted text in a public browser index. Anonymous login/recovery articles need an explicit public audience and should contain no private feature instructions. Subscriber help is a separate audience and needs its own capability mapping; do not assume staff Spatie permissions describe subscribers.

## Video guidance

Attach separate en/bn YouTube IDs where possible; otherwise identify the spoken language and supply a translated text tutorial/transcript. Use a responsive, lazy-loaded, titled player from an allowlisted ID with playback controls and no autoplay. YouTube supports privacy-enhanced embedding through youtube-nocookie.com; see [YouTube guidance](https://support.google.com/youtube/answer/171780?hl=en). Unlisted YouTube links are shareable, so app permissions cannot make the underlying video confidential. Keep private operational information out of videos/screenshots; use another delivery mechanism if video access itself must be enforced.

## Platform support conversations

Recommended: separate support_conversations, support_messages and support_participants/read-state tables, with Laravel policies. Names and routes here are proposals; none should be treated as existing endpoints.

Conversations need company ownership from the authenticated session, requester user, optional reseller scope, subject/category, status, assignee, last-message sequence and timestamps. Messages need conversation, authenticated author identity, body, sequence and client-generated submission ID. Persist author type and user identity even for tenant owners/platform agents without a Staff record. Read state is per participant, not a single global is_read flag. Start with text only; add attachments later with private storage and access checks.

Default tenant visibility: requester and explicitly authorized participants. Company admins may receive a separate permission for company-wide conversations; reseller users must not automatically see other reseller/company conversations. Company ownership is not enough for every staff member to read every conversation. Platform agents use an explicit platform-only inbox and reply permissions, with audited access and explicit target-conversation scoping. Never infer access from company_id = 1 in the browser or globally disable tenant scopes.

Separate this from the existing subscription-gated operational `tickets.*` feature. General help, account recovery and contacting the platform should remain available without the ticket add-on and during subscription problems. Implement a narrow entitlement exemption while retaining authentication, ownership, authorization and rate limits. This requires deliberate FeatureSeeder/SubscriptionService policy design; an unmapped new route name alone is not a complete solution.

The support team also needs an inbox with assignment, open/waiting/resolved filters, unread indicators, replies, reopen behavior and response expectations. The floating widget is only half the workflow. Keep internal agent notes separate from customer-visible messages if introduced.

## Polling now, sockets later

- Reuse useApiQuery and useApiMutation. Poll an open active conversation approximately every 5 seconds; poll one lightweight unread-summary query every 30–60 seconds while the panel is closed. Tune from observed usage. Stop active-thread polling when the panel closes, identity changes or the conversation is unavailable. Avoid background-tab polling and refetch on focus/reconnect. TanStack Query exposes these controls: [useQuery reference](https://tanstack.com/query/latest/docs/framework/react/reference/functions/useQuery).
- Fetch a bounded latest page initially; poll only messages after the last acknowledged sequence and load older history separately. Keep stable server ordering and deduplicate by message ID. The current getMessages endpoints return the full thread; cursor/delta support would be new backend work.
- Confirm sends via POST, invalidate/update thread plus unread/inbox summaries, and use a unique submission ID to prevent duplicate inserts on retry. Incremental append cursors do not capture edits/deletions; either make messages append-only initially or add revision/tombstone synchronization.
- Persist last-read sequence on the server. Mark read when visible to the participant; deriving unread from the latest message alone loses multi-device state. Use bounded retry/backoff for failures, limits on message length/send frequency, and pause on authorization failure.
- Capacity illustration, not a measurement: 500 simultaneously open chats / 5 seconds = approximately 100 poll requests per second before unread summaries and other API traffic. Measure the full browser → Next server action → Laravel cost before shortening intervals.
- Keep message creation and authorization in a Laravel service. After a committed write, later broadcast a private conversation event and have the frontend update/invalidate the same Query keys. REST remains the source of truth for initial load and reconnect catch-up. Private channel authorization must repeat the same participant/platform policy. This limits future transport changes without promising zero migration work.

## Alternatives

1. **Integrated Markdown + dedicated platform inbox — recommended.** Fits the existing stack, gives exact permissions and bilingual control, and separates platform support from subscriber tickets. Requires backend tables/policies and an agent inbox.
2. **Extend existing tickets with an explicit platform-support type.** Potentially less duplicated UI, but current company/reseller scopes, subscriber relations, notifications, plan mapping and message authorization need careful redesign. Merely adding a widget around /tickets will not create cross-tenant platform support. Useful only if a unified ticket domain is a deliberate product decision.
3. **Separate documentation site + external help desk.** Can reduce development of agent workflows, but authenticated per-feature docs, tenant identity, bilingual search and contact integration become extra work. A public site alone cannot satisfy private documentation permissions. Compare actual vendors only if this direction is preferred; no vendor pricing or capability assessment was performed.

## Existing gaps relevant to reuse

These are static source findings, not newly reproduced attacks:

- `TicketMessage` has no tenant/reseller trait. Generic `TicketMessageController::index/show/update/destroy` does not constrain by an authorized parent ticket. StoreTicketMessageRequest uses a bare exists:tickets,id check. Generic routes have permission middleware, but that does not establish object ownership. Avoid copying these endpoints into platform chat; add parent-based policies and isolation regression tests before reuse.
- `routes/api.php:628–629` places tickets.reply/messages under authentication + subscription without the permissions middleware. Parent Ticket binding supplies tenant/reseller scoping, but TicketController::getMessages/storeMessage has no separate action-permission check. Binding does not replace action authorization. The staff UI hiding a reply button cannot enforce the API permission.
- UpdateTicketRequest accepts client_id/subject_id/assigned_to without scoped relation validation. Existing frontend report records a foreign-client reassignment failure. Recheck and fix with backend regressions before expanding ticket reuse; this review did not rerun that scenario.
- Nested message reads fetch the entire conversation on every poll. This is acceptable as a small starting pattern, not the desired long-term chat API.

## Suggested delivery sequence

1. Confirm the audiences and default conversation visibility. Build the shared Help launcher, server-authorized catalog, bilingual articles, FAQ/video presentation and permission-safe search. Pilot clients and invoices plus a general getting-started guide.
2. Implement platform-support ownership/policies, text conversations, tenant widget and platform inbox together. Correct relevant existing ticket gaps before any ticket-domain reuse. Add explicit support access during subscription problems.
3. Add incremental polling, read cursors, retry/deduplication and diagnostics. Cover tenant A/B, requester/colleague, reseller, platform agent and ordinary company-1 user cases.
4. Expand documentation with feature releases and enforce translation/link/permission checks. Add private attachments and socket events only when actual support needs justify them.

Acceptance checks should include forbidden direct article links, restricted search snippets/media, language switching and stale translations; company/reseller/participant isolation; forged ownership/author inputs; subscription-problem access; duplicate sends; reconnect catch-up; and unread counts across devices. No application tests were run for this advice-only review.
