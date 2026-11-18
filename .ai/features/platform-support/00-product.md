# Product contract

## Confirmed by the user

- A separate platform-support product. Existing tenant/customer support tickets are preserved.
- Every tenant user and reseller user, including their staff, can ask the platform team for help.
- Separate support issues and direct chats. Chat can become an issue with linked history.
- Visibility is permission-based.
- App-tenant administrators and staff granted platform-support permissions handle requests.
- Issues and chat support images: JPEG/PNG/WebP, at most five images per message, each at most 5 MB; images remain private behind authentication and authorization.
- In-app unread badges/notifications. React Query polling; no sockets initially.
- The original requirement remains: feature documentation/tutorials and FAQs in file-based English/Bangla Markdown, selected by feature permissions, with embedded YouTube tutorials. No database storage for documentation.

## Implementation defaults

These fill in unspecified details; they are explicit defaults, not additional user answers.

- “User” means an active authenticated Laravel User principal, including tenant owners who have no Staff relation. Subscriber Client principals are not platform-support requesters in v1.
- Everyone receives baseline create/read/reply permissions for their own conversations. Optional permissions expand visibility to their reseller or company; optional write permissions separately allow replying/managing those visible conversations. The user did not approve universal visibility within a company.
- Reseller-wide means the same reseller only; no implicit parent/child reseller access. Company-wide visibility is restricted to non-reseller staff and includes reseller requests of that company. No tenant permission grants cross-company access.
- Issue priorities: low, normal, high; normal by default. Categories: general, account, billing, technical, bug, other. These are support categories, not the legacy ticket subjects/tags.
- Issues: open → in_progress → waiting_for_requester → resolved → closed. Requesters can resolve and reopen their own issue; closing and arbitrary workflow changes belong to authorized managers/platform agents. Requester replies to waiting/resolved reopen it; closed issues must be explicitly reopened first.
- Chats: open → closed or converted. At most one open chat per requester in the current ownership scope. A closed chat may be reopened if no other open chat exists. Converted chats remain read-only with a linked issue.
- Conversations/messages are append-only in v1. No sent-message editing, individual image deletion, public sharing, hard deletion or automatic expiry. Users may remove pending image selections before sending. Future retention/redaction needs a separate specification and review.
- Multiple open issues are allowed. Only one issue may be created by conversion of a particular chat. Conversion preserves history by reference, without copying images or notifying historical messages again.
- Message body: up to 10,000 Unicode characters. Text or at least one image is required. Issue subject: 3–200 characters. Chat subject is optional and may be generated from a translated default without altering stored user content. No rich HTML in messages.
- One platform assignee per conversation; unassigned is valid. Assignment does not by itself grant access. No typing indicators, online-presence claims, external SMS/email, automation/chatbot, voice/video calls or guaranteed response SLA in v1.
- Numeric limits use binary bytes: 5 MB in the product UI means at most 5 × 1024 × 1024 bytes; display the limit consistently. Maximum decoded dimensions: 12,000 pixels on either side and 40 megapixels total. Staged upload request cap: 6 MiB including multipart overhead. These resource limits are implementation defaults.

## Core flows

### Requester: issue

Open Help anywhere in the authenticated staff app → choose Report an issue → supply subject/category/priority and first message/images → see reference and history → receive reply badge → read/reply → resolve/reopen. Show only conversations allowed by current permissions. Offer own, reseller and company scopes only when granted. Broader list access does not authorize an action automatically.

### Requester: direct chat

Help → Chat with support → resume the existing open chat or start a new one → send text/images → see confirmed/pending/failed delivery and last successful refresh. If the platform team is unavailable, messages remain asynchronous; do not display “online” based on polling.

### Convert chat

Requester or authorized platform agent selects Create issue from chat → subject/category/priority form → creates exactly one new issue in the original requester's scope → original chat becomes converted/read-only → both show links. The issue shows a read-only linked history section and its own follow-up messages. A reader must independently pass authorization for the linked source. A link never grants additional access. Source/target keep the same requester, company and reseller.

### Platform agent

App tenant → Platform Support inbox → separate Issues and Chats tabs → see tenant name/domain, reseller if present, requester identity, subject/reference, status, priority, assignee, unread and last activity → open/read/reply with images → assign/transition/convert when authorized. Prioritize unassigned and unread items. Never require impersonating the requester to respond. Requester UI identifies responses as platform support, with the agent display name; it must not expose internal agent account details.

### Help Centre

Persistent Help launcher → relevant guide for the current route, bilingual search, FAQs and video → open full article or contact support. Keep route/article context optional and sanitized. No automatic collection of form data, full query strings, secrets or customer records. In-app UI changes language; messages retain the language originally written.

## Operational expectations

With a healthy connection and queue worker, new requests/replies become visible through the relevant inbox/thread polling interval; never claim instantaneous push. Platform inbox summaries poll every 10 seconds while visible; requester closed-widget unread every 30 seconds; active thread every 5 seconds. Focus/reconnect refresh immediately. Hidden/offline surfaces stop polling. Full acceptance targets in PS-009.

Use neutral Help/Platform Support labels so the new product is distinguishable from existing Support Tickets. No changes to legacy menus, notification events or customer-ticket behaviors except adding independent new navigation entries.
