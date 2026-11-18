# PS-009 platform support acceptance

Browser specifications for the platform-support and Help Centre acceptance pass. Legacy customer tickets stay in [SUPPORT-001](../support-tickets/SUPPORT-001-support-tickets.md). This file does not mark a scenario passed. Passing requires a recorded run in the coverage register.

`npm run test:e2e:platform-support` uses `playwright.platform-support.config.ts`. Login uses the CP or MK host from the ignored tenant env, with the session kept in memory. The isolated project creates a thread only after `E2E_PLATFORM_SUPPORT_DISPOSABLE=1` and a fixture file that names a database created for that run. This suite does not create that database. The 2026-11-13 evidence is in [PS-009.json](../../../../.ai/features/platform-support/evidence/PS-009.json).

- PS-E01 [P0]: Tenant owner and reseller staff open separate issues and chats. The platform inbox shows the reference, requester, and source tenant. Customer tickets stay separate.
- PS-E02 [P0]: A user with no role and an owner without a staff record can send. Anonymous, client, and locked principals are denied. Baseline support does not require tickets, notifications, or the paid support feature.
- PS-E03 [P0]: An own-only user cannot read a colleague request. A reseller reader sees that reseller only. A company reader sees that company only. Team reply or manage does not grant visibility by itself.
- PS-E04 [P0]: Tenant B cannot read tenant A by UUID, detail, message, image, cursor, or filter, in either direction. Prohibited ownership fields are ignored. A scope move drops access and leaves the historical row in place.
- PS-E05 [P0]: A platform administrator can see permitted inbox rows and source identity. Ordinary company-1 staff and a non-platform Super Admin are denied. A read-only agent cannot send, upload, or manage. Impersonation does not keep platform powers.
- PS-E06 [P0]: Text, image-only, and five-image messages work from both sides. The 5 MiB boundary is accepted and unsafe images are rejected. A copied image URL still requires the current session. There is no public image path.
- PS-E07 [P0]: Staging, draft binding, expiry, partial upload failure, and send rollback leave no partial message. A lost success response creates one message, one attachment set, and one notification per recipient.
- PS-E08 [P0]: Two chat starts leave one active chat. Two conversions leave one issue. Source history stays authorized separately. The converted chat is read-only.
- PS-E09 [P0]: Resolve, reopen, closed, waiting, and reply transitions match the contract. A stale expected version returns 409. Assignment accepts only an eligible platform agent.
- PS-E10 [P0]: An active chat catches up, including a delta over 100 messages. A hidden, offline, or closed panel stops polling. A 429 backs off. There is no socket and no background five-second loop.
- PS-E11 [P0]: Unread cursors stay independent. Own messages are excluded. Read marks only visible messages. Summary and list filters agree with detail permissions.
- PS-E12 [P0]: Under a healthy clock, network, and running worker, the measured poll intervals match the contract. A failed worker or network is not called delivered.
- PS-E13 [P0]: A transaction or job retry does not duplicate notifications. The worker switches company context. Muting the bell does not remove thread unread. No SMS, email, Telegram, or legacy ticket event is produced.
- PS-E14 [P0]: Permitted English and Bangla articles, FAQs, and the honest video state render. A language switch keeps the article. Forbidden and invalid content stays hidden.
- PS-E15 [P0]: Contextual help matches the verified inventory. Privileged guides require the action permission. Platform guides stay hidden from tenant users. Page context omits the query string and form values.
- PS-E16 [P1]: Mobile, desktop, keyboard, the image viewer, scroll position, errors, English and Bangla, dark and light, and logout or impersonation cache reset work. A failed refetch is not an empty inbox.
- PS-E17 [P0]: Legacy ticket and customer behavior, notification routes, and private profile images stay unchanged. General subscription restrictions stay intact.

MySQL row locking for PS-E08 is a separate disposable-database plan and is not started.
