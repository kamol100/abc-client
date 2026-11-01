## Summary

The theme system now has a Jomuna preset taken from the reference payroll app: cool slate surfaces, a teal-to-blue brand gradient, IBM Plex Sans with Hind Siliguri for Bengali, and soft active navigation. Existing color, density, radius, and drawer settings still work. Default stays the previous zinc look.

## Architecture

Presets, gradients, type, shadow, and border live as `data-*` attributes and CSS variables on `<html>`, same path as the existing color and density tokens. Custom colors are optional HSL overrides on the same element, so they win over a preset without a second theme engine. Preferences stay in the existing theme cookies (`themePrefs` plus the older color, density, and radius cookies). That is per browser, not per company. A later company-branding field can store the same settings object. No backend migration.

## Frontend

- Tokens, Jomuna light/dark palettes, and gradient utilities are in `app/globals.css`. Tailwind reads radius, type, shadow, border strength, success, and info from those variables.
- Settings and the header customizer share `components/settings/themes.tsx`, with a live preview.
- Layout, header, page canvas, dialogs, primary buttons, and the active sidebar item consume the tokens.
- English and Bengali strings are in `public/lang/en.json` and `public/lang/bn.json`.

## Checks

- `scripts/ai/typecheck` passed.
- `npx vitest run tests/unit/theme/theme-settings.test.ts` passed (9 tests).

## Follow-up

Checked switches use the same brand gradient as primary buttons when gradients are on. The header wallet chip uses the header surface, border, and foreground text, so the balance stays readable in dark mode instead of the bright primary color.

Status badges use the theme success, warning, danger, and info tokens instead of fixed green, red, and amber utilities. Jomuna success and info are readable ink colors in both modes, so soft badges stay legible on dark surfaces.

## Browser

Signed in at `http://vp.isp.test` as `vp`. Jomuna light and dark applied without a reload. After a full navigation to Clients, dark Jomuna was still active: table header `#1b252e`, header text `#a3b1b8`, page `#0e141a`, sidebar `#151d24`, primary `#2bb3a0`. The Add button used the teal-to-blue gradient. The theme was then set back to Default and Light.

A hydration overlay appeared once on the theme page during hot reload and named `ThemePreview`. A later full load of the dashboard and clients table did not show it.

## Security

Theme cookies are not an authorization boundary. Company branding is not stored on the API yet.
