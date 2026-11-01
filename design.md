# Design: ISP marketing site (app/(public), components/marketing)

The locked system. Every Hallmark run reads this first and pages share it. Change it on purpose; the file is the rule.

## System
- Genre: modern-minimal
- Shape of the first page: Spec Sheet, a MikroTik-style product carousel hero over spec sections
- Theme: brand (mikrotik.com style reference, by request; `.hallmark/brand-spec.md`)
- Axes: light/grotesk-sans/neutral · posture: Stage

## Tokens
`components/marketing/tokens.css` is the source of truth, scoped to `.mkt` (the public layout's wrapper) so the admin app is untouched. The roles:
```css
.mkt {
  --color-paper: #ffffff;  --color-paper-2: #f1f1f2;  --color-paper-3: #ececec;
  --color-ink: #0e0e10;  --color-ink-2: #2c2c2e;  --color-muted: #67676b;  --color-rule: #dadada;
  --color-accent: #1961bc;  --color-accent-ink: #ffffff;  --color-focus: #1961bc;
  --color-ok: #009245;  --color-warn: #fa9300;  --color-bad: #e00000;   /* status in product samples only */
  --color-night: #0e0e10;  --color-night-ink: #ffffff;  --color-night-muted: #b3b3b6;  --color-night-rule / --color-night-fill: white 25%;
  --font-display / --font-body / --font-outlier: JetBrains Mono for ALL text (what mikrotik.com actually renders), Bengali fallback;
  --radius-card: 0;  --radius-pill: 0;  --rule-hair: 1px;  --shadow-card: none;
}
```
`.dark .mkt` redefines every colour. Spacing, type scale, easings and durations live in `tokens.css`; use `var(--space-*)`, `var(--text-*)`, never raw lengths.

## Controls
- `.mkt-btn`: MikroTik's bracket button. Transparent, side rules plus 12px corner ticks, 12px bold uppercase, fills from the right on hover. On `.mkt-night` / `.mkt-foot` the lines are white 25%.
- `.mkt-btn--line` is the same bracket (kept for existing markup).

## Section opening (mikrotik.com)
- `<span class="mkt-label">HARDWARE</span>` small bold uppercase label, then `<h2>` (40px bold uppercase) containing `<span class="mkt-title-sub">` (32px light uppercase second line), then a mono paragraph (max ~880px), then the section's grid.
- Footer: `--color-foot` (#808085) ground, white text.

## Surfaces
- `.mkt-section` (paper) and `.mkt-section--alt` (paper-2) alternate with hairline rules; `.mkt-night` is the black band (hero, one closing band at most per page).
- Square corners everywhere, hairline borders, no shadows, no gradients, no glows.
- Product samples (`.mkt-panel`) are the interface built with real field names from the app, inside a `data-slot` that a real screenshot replaces.

## Motion
- Character: brisk; `transform` and `opacity` only; one reveal at most per page; under reduced motion everything ends at once.

## Copy
- Every string through react-i18next, keys in both `public/lang/en.json` and `bn.json`.
- No eyebrows, no middle-dot strings, no arrows glued to links, no em or en dashes, no invented numbers, logos or quotes.

## Exports
`components/marketing/tokens.css` in this project.
