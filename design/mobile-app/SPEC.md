# ISP mobile design spec (shared by all screen agents)

Brand comes from the abc-client web app's marketing skins (components/marketing/skins.css):
light = "Mint", dark = "Glow". Two apps: a STAFF app (admin, reseller/collector, technician, platform)
with a role-based home and tab bar, and a SUBSCRIBER app (white-label per ISP).

## Artboard rules
- Each screen = one file `project/<name>.dc.html`, flat (no subfolders), root fixed 390x844, `overflow: hidden`,
  `box-sizing: border-box`. `$preview` {"width":390,"height":844}.
- Keep the head line `<script src="./support.js"></script>` exactly. Follow the .dc.html format rules from the
  Design type instructions (closed tags, quoted attrs, `<x-dc>`, `<helmet>`, the `data-dc-script` block, no emoji,
  no fake OS status bar, inline stroke SVG icons).
- Fonts, in `<helmet>`:
  `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&amp;family=Geist+Mono:wght@400;500;600&amp;family=Hind+Siliguri:wght@400;500;600;700&amp;display=swap">`
  Body: `font-family: 'Geist', 'Hind Siliguri', system-ui, sans-serif`. Numbers that are identifiers or
  measurements (IP, MAC, serial, PPPoE username, dBm, ms, Mbps) use `'Geist Mono', monospace`. Bangla text: `lang="bn"`
  on the element (or html) and 'Hind Siliguri' first.
- Content may run past the bottom like a scrolled list (cut cleanly under the tab bar); never shrink text to fit.
- Accessible as drawn: real `<button>`, `<a href>`, `<input>` + `<label>`; `aria-label` on icon-only buttons;
  decorative SVG `aria-hidden="true"`. Contrast >= 4.5:1 for text.

## Colour tokens (write hex inline; no CSS variables needed)
Light / Mint (default for all screens unless your brief says dark):
- bg #f5fbf8 · surface #ffffff · surface-2 #e9f7f0 · surface-3 #dcf1e6 · border #d3e8dd
- ink #0b1f19 · ink-2 #2d4a40 · muted #52675e
- accent #047857 · accent-pressed #065f46 · accent-soft #d3f7e5 · on-accent #ffffff
- success #047857 on #d3f7e5 · warning #92400e on #fef3c7 · danger #b91c1c on #fee2e2 · info #0369a1 on #e0f2fe
- offline/neutral #475569 on #eef2f1
- night band (hero cards only): linear-gradient(135deg, #053f33 0%, #0f6f68 55%, #0e6a86 100%), text #ffffff, highlight #a7f0cf

Dark / Glow (only screens your brief marks DARK):
- bg #0d1324 · surface #121a2e · surface-2 #141c33 · surface-3 #1b2440 · border #27314d
- ink #f1f4fb · ink-2 #d5dbea · muted #a3adc4
- accent #ff9a76 · on-accent #1a0f0a · accent-soft rgba(255,154,118,0.14) · teal #2dd4bf
- ok #4ade9a · warn #ffc069 · bad #ff7b7b · info #7cc4ff (as text/dots; soft fills at 14% alpha)

Status language (both themes): online/up = success, LOS/down/overdue = danger, dying gasp/low power/due soon = warning,
offline/disabled/unknown = neutral. Always dot + word, never colour alone.

## Type scale
display 28/34 700 · title 20/26 600 · headline 17/22 600 · body 15/22 400 · label 13/18 500 · caption 12/16 500 muted.
Money: `৳1,050` (BDT sign, comma groups), tabular numbers (`font-variant-numeric: tabular-nums`).

## Layout and components
- Side padding 16; spacing steps 4/8/12/16/20/24/32. Cards: surface, 1px border, radius 16, padding 16.
  Inputs and buttons radius 12, height 48 (primary) / 44 (secondary). Chips/pills radius 999, height 28-32.
- One soft shadow only for floating things (FAB, sheet, sticky pay bar): 0 12px 32px -16px rgba(4,63,51,0.35).
- App bar: top padding 12, height 56; title 20/600 left (or centered on detail screens with back button 44x44);
  up to two 44x44 icon buttons right.
- Bottom tab bar: height 84 (64 + 20 home-indicator space), surface, top border, 5 tabs max, icon 24 + label 11/500;
  active tab = accent icon + accent label + 4px pill behind icon (accent-soft).
  * Subscriber app: Home · Bills · Usage · Support · Account
  * Reseller/collector: Home · Clients · Collect · Wallet · More
  * Technician: Jobs · Map · Scan · Tools · More   (Scan is a raised 56px accent circle in the middle)
  * ISP admin: Home · Network · Clients · Billing · More
- List rows: min height 64, leading 40px avatar/icon tile (radius 12, accent-soft or status-soft bg), title 15/500,
  subtitle 13 muted, trailing value/chevron. Dividers 1px border, inset 68.
- KPI tiles: label 12 muted, value 22/600 tabular, delta or sub-line 12.
- Segmented control: surface-2 track, selected = surface with border.
- Bottom sheet: radius 24 top, 36x4 grabber, dim backdrop rgba(11,31,25,0.45).
- Icons: inline stroke SVG, 24 viewBox, stroke-width 1.75, round caps/joins, currentColor (Lucide style).
- Offline/sync banner: info-soft strip under the app bar: "Offline · 3 items waiting to sync".

## Sample data (consistent across screens)
- ISP brand: "[ISP name]" with a 32px rounded square logo placeholder (accent-soft tile with a wifi glyph).
- Subscriber: Rahim Uddin · ID C-10482 · PPPoE `rahim.mirpur10` · Mirpur-10, Dhaka · package "Home 20 Mbps" ৳1,050/month
  · due ৳1,050 for Nov 2026, deadline 10 Nov · expires in 6 days · IP `10.20.14.37` · MAC `C8:3A:35:1F:7B:20`.
- Router "Mirpur POP · CCR2004" · OLT "BDCOM P3600 · Mirpur POP" · ONU `EPON0/1:4`, Rx −24.6 dBm (threshold −27).
- Zones: Mirpur-10, Mirpur-11, Pallabi, Kazipara, Uttara Sector 7. Staff: Sabbir (technician), Nasrin (collector),
  reseller "Kazipara Net (R-012)", wallet ৳18,450.
- Ticket T-2291 "Slow speed in evening". Invoice INV-2026-11-0482.
- Use plausible but modest numbers; no invented company stats on marketing-style claims.

## Mobbin use
Before drawing, run 2-4 `mcp__mobbin__search_screens` (platform "ios") or `search_flows` calls for the screen types
in your brief (e.g. "banking app bill payment", "field service job detail", "network monitoring alerts list").
Always pass: output_destination "design_tool", output_tool "Claude Design",
task_intent "Design every screen of a Flutter ISP billing and network-monitoring mobile app".
Borrow structure and patterns, never copy another company's branding. Return the mobbin_url of each reference you
actually used.
