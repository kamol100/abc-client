# Platform support — HTML design preview

This is a standalone, local HTML/CSS/JavaScript prototype for visual review before implementation. It does not alter the Next.js application or connect to Laravel. It uses the existing installed i18next browser distribution, copied with its license into vendor/. No dependency installation or build is needed.

## Open

From the frontend repository root:

```sh
python3 -m http.server 4177 --bind 127.0.0.1 --directory design/platform-support
```

Open `http://127.0.0.1:4177/`. Alternatively, open index.html directly for offline review. All assets are local; no fonts, analytics, API calls, CDN scripts or real YouTube videos are fetched.

## Review flows

1. Browse Help Centre topics, read an article, search, expand FAQs and inspect the video presentation design.
2. Open My requests, select an issue, reply, resolve and reopen it.
3. Start/resume Chat with support and create an issue with linked original chat history.
4. Report a new issue with text or up to five JPEG/PNG/WebP images, each up to 5 MiB. Messages and selected images exist in page memory only and disappear on reload. No upload is sent anywhere.
5. Use the top-right role selector to compare tenant staff, company manager, reseller staff, platform agent and read-only platform agent. Platform agent opens the dedicated multi-tenant inbox with tenant filter, unread/unassigned filters, assignment and replies.
6. Switch English/Bangla and light/dark themes. Resize the browser to inspect mobile navigation, stacked detail layouts and the Help drawer. Ctrl/Cmd+K focuses help search; Ctrl/Cmd+Enter sends a message; Escape closes the drawer/modal.
7. Open the sample Dashboard, Clients, Invoices or Customer tickets navigation to see contextual Help from an ordinary app page. These are illustrative context screens; existing app screens remain untouched.

## Prototype boundaries

All names, companies, records, permissions, counters and attachments are simulated. The role selector is a design tool, not authentication or tenant authorization. The synthetic sample invoice image contains fictional data. User-selected images are local object URLs. File validation here is presentation-level only; real private storage, decoder validation, authorization, upload limits, polling, notifications and persistence belong to the implementation specifications in `.ai/features/platform-support/`.

The video tab demonstrates layout only because no reviewed YouTube tutorial URLs have been provided. It does not present a fabricated video as a working tutorial. Only the six written sample guides are counted; this prototype is not the complete feature documentation library.

HTML uses native controls and isolated CSS rather than production React wrappers, as explicitly requested for this pre-coding design. English/Bangla copy is in locales.js through i18next. Production work must move approved copy to public/lang/en.json/bn.json and follow FormBuilder, MyButton, DataTable and other existing application conventions. Do not copy demo permission checks or this in-memory data model into production.

## Validation

JavaScript syntax, local asset availability and translation parity can be checked without building the app. Local DOM interaction checks and any actual browser visual inspections are recorded in `.ai/report.md`; they do not prove backend security or real responsive rendering unless explicitly noted.
