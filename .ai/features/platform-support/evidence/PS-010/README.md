# PS-010 design review

The redesign is implemented and ready for review in the development app. This evidence covers selected live browser states and the automated checks. The full visual matrix and fixture-dependent acceptance are still open.

## Browser evidence

Captured in Chrome with existing development staff sessions. Desktop captures use the full browser window before cropping. Mobile captures use a 390 × 844 emulated viewport. Crops remove browser chrome, the signed-in account header, and DevTools. The conversation captures use the existing CP test issue and chat. No attachment contents are shown.

- Stage 1, MK tenant staff, desktop English light. [Help before](before-help-desktop.png) and [Help after](help-desktop.png) show the move from a flat list to a search hero and authorized topic cards. [Mobile English light](help-mobile.png) and [mobile Bangla dark](help-mobile-bangla-dark.png) show the stacked layout.
- Stage 2, MK tenant staff, desktop English light. [My requests](requests-desktop.png) shows the scope, summary, and list. [Report an issue](issue-dialog-desktop.png) shows the dialog and attachment controls.
- Stage 3, CP tenant staff, mobile English light. [Issue](requester-issue-mobile.png), [chat](chat-mobile.png), and [conversion dialog](conversion-mobile.png) show the stacked conversation, composer, and conversion controls.
- Stage 4, APP platform staff, English light. [Desktop inbox](inbox-desktop.png), [desktop thread](inbox-thread-desktop.png), and [mobile thread](inbox-thread-mobile.png) show requester and company context and the change from an adjacent sidebar to stacked details.
- Stage 5, [mobile Help drawer](help-drawer-mobile.png) shows contextual help and pinned contact actions. [Mobile guide](guide-mobile.png) shows the CP staff reader in English light. The same guide and related links were also inspected on desktop.

## Adaptations

- Support and help use the existing sidebar and theme. Issues and Chats use the current submenu style and are selected from the route. The Help launcher sits above the existing mobile navigation.
- Lists use the app's DataTable, scoped summary endpoints, and per-action permissions. The documentation index groups authorized file-based content and reports counts from that content. Featured guides use a curated selection from the allowed cards. Videos use the configured catalog and its empty state.
- The conversation uses one panel for history and replies and a details section that stacks at mobile widths. The new issue and conversion forms use the shared form and dialog. Optional article helpfulness voting was omitted.
- Existing Laravel endpoints and response fields met the requirements. The Help page, search, and contextual results now include topic metadata after authorization. No backend migration or API change was needed.

## Acceptance evidence

- **A01 · Design coherence** — All redesigned surfaces were inspected in at least one viewport. User feedback and baseline captures for surfaces other than Help remain open.
- **A02 · Navigation and shell** — The existing menu implementation renders the Help and Support entries. Menu permission and active-state tests pass. Full collapsed and hover-state review remains open.
- **A03 · Help authorization** — Help content validation and tests for authorized search and topic metadata passed. The Help Centre and a real guide were checked in the browser.
- **A04 · Requester access** — Existing requester scope and permission tests passed. Tenant-staff views were checked. Live reseller and company-wide persona checks remain open.
- **A05 · Conversation workflow** — Focused tests passed for the existing support model and composer behavior, including request IDs and attachment limits. The browser displayed the issue, chat, and conversion form. Live sends, upload retries, lifecycle changes, and linked conversion completion require disposable write fixtures.
- **A06 · Agent workflow** — The live APP inbox and thread show the requesting company, staff identity, and available controls. Focused inbox tests passed. Live assignment, conflicts, and read-only persona checks remain open.
- **A07 · Polling and read state** — Existing polling and history tests passed. A live backlog, reconnect, and draft-preservation scenario remains open.
- **A08 · Localization and theme** — The browser showed English light and Bangla dark on Help, and translation parity checks passed. The full language and theme cross-product remains open.
- **A09 · Responsive and accessibility** — Desktop and mobile layouts were inspected as listed above. Opening the mobile drawer placed focus on its Close control. Tablet, full per-screen viewport coverage, keyboard traversal, focus restoration, and image viewer checks remain open.
- **A10 · Feedback states** — The affected components retain loading, empty, stale, failure and retry states. The full live failure-state and long-content matrix remains open.
- **A11 · Verification** — Typecheck passed. The Help catalog validated 184 articles. The focused Help, platform support, and menu suites passed 90 tests in 12 files. The full suite reported 693 passes and 19 pre-existing failures in maps, reseller-client, client dashboard, column visibility, date pickers, and pay. PS-009 release readiness remains open.
- **A12 · Integration** — Checked the existing Laravel summary resources and used their verified counts and filter scope. The change is confined to the frontend, with no changes to the legacy customer-ticket feature, backend schema, or attachment transport.
