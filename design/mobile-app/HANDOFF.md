# ISP mobile app: handoff to the cloud session

State on 2026-11-03. This branch carries the design work started in a local Claude Code session.
Read this file first, then `SPEC.md`.

## Live artifacts (claude.ai, same account)

- Feature plan doc: https://claude.ai/artifact/4bNpq1kZKQq3sSi1Xx7bPW
  (overview, platform inventory, competitors, 58-feature catalogue with MVP/v1/v2, on-device tooling,
  architecture, backend gaps, roadmap, open questions).
- Design canvas: https://claude.ai/artifact/YY8ZE1uTxNfmzGHugdXk8w
  (61 boards on 5 pages). Its source is `project/` in this folder; publish changes to the same URL with
  `root` = this folder (`design/mobile-app`), only the files you changed. Read the canvas first if someone
  may have edited it in the browser.

## Decisions taken

- Flutter, Android first; iOS in v1 with a reduced diagnostics set (no Wi-Fi scan, RSSI, ARP on iOS).
- Two apps: one STAFF app (platform admin, ISP admin, reseller/collector, technician) with a role-based
  home and tab bar driven by `permissions[]` from `/user-settings`; one SUBSCRIBER app, white-label per ISP.
- Look: new ISP design system from the abc-client marketing skins: Mint (light, accent #047857) and
  Glow (dark, coral #ff9a76 on navy #0d1324). Fonts Geist, Hind Siliguri (Bangla), Geist Mono.
  The "HR Payroll" design system on the account is unrelated and not used.
- The phone never holds router, OLT or payment-gateway credentials: every device action goes through the API.

## Backend facts that shape the app (isp-backend, Laravel 13 + Sanctum)

- Tenant is chosen only at login from a `host` value matched to `companies.domain`; the app needs a
  company code / QR step (not built yet).
- `POST /v1/refresh` routes to a missing method; tokens last 1 year; no device-session list.
- No push (no FCM, no device_tokens), no websockets (Reverb not installed); web app polls.
- Only bKash is implemented (public create/execute, caller-supplied callback, no IPN); paying does not
  re-enable a disabled PPPoE client.
- Security gaps to fix before release: a subscriber (Client) token passes admin routes in
  `routes/api.php` ~601-746 that lack `permissions` middleware (e.g. `GET /v1/dropdown-clients`);
  login, signup, public pay and bKash endpoints are unthrottled.
- Network scope today: PPPoE via MikroTik RouterOS API; OLT drivers VSOL, BDCOM, Huawei (no ZTE);
  no RADIUS, hotspot, static IP or queues.

## Design canvas contents

Pages and file prefixes under `project/`:
- foundations: `Main.dc.html` (design system), `auth-*` (8 sign-in screens)
- subscriber: `sub-*` (15)
- reseller: `res-*` (8)
- technician: `tech-*` (14; the toolkit row is dark)
- admin: `adm-*` (14) and `plat-Tenants`

134 screens (every web feature, see COVERAGE.md) sit on one canvas page and are a click-through prototype (Play on any board, start at auth-Splash); link map in NAV.md. In-screen controls (tabs, toggles) are still static.
Nobody has visually reviewed the rendered boards yet.

## Open questions (from the feature plan)

Tenant onboarding method; subscriber OTP at MVP or later; field jobs as extended tickets or a new
work-order model; Nagad vs SSLCommerz next; who hosts LibreSpeed; OSM PMTiles vs Google Maps;
ZTE/hotspot priority; repo for the Flutter app.

## Suggested next steps

1. Review the rendered canvas and fix overflow/clipping
2. Add missing states: empty, loading, error, offline, 402 subscription-expired, permission-denied.
3. Turn SPEC.md into Flutter theme tokens (ThemeData light/dark) when the Flutter repo exists.
