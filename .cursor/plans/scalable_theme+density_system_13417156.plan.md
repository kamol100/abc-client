---
name: Scalable theme+density system
overview: Unify mode (next-themes) + color + radius + density into a single, SSR-safe theme settings system using HTML data-attributes + CSS variables, with Tailwind configured to read spacing from CSS vars so density globally affects `p-*`, `gap-*`, `h-*`, etc. Persist per-user settings via `/api/theme` (DB + cookie) while keeping color palettes as static presets in CSS.
todos:
  - id: define-theme-types
    content: Create a unified `ThemeSettings` type (color/mode/density/radius) and normalize `ThemeColors` to include all supported colors (including red).
    status: completed
  - id: css-density-tokens
    content: Add `--space-*` CSS variables and `data-density` selectors in `app/globals.css` for compact/comfortable/large.
    status: completed
  - id: tailwind-spacing-vars
    content: Update `tailwind.config.ts` to map key spacing scale values to `var(--space-*)` while preserving Tailwind defaults.
    status: completed
  - id: css-color-presets
    content: Implement per-color CSS variable blocks keyed by `data-theme-color` (and preview-scope selector) for light + dark palettes.
    status: completed
  - id: theme-settings-provider
    content: Replace `theme-data-provider.tsx` with a unified provider that applies `data-*` attrs globally and exposes setters + persistence helpers.
    status: completed
  - id: update-theme-settings-ui
    content: Update `components/settings/themes.tsx` to add Density controls and remove dynamic Tailwind class generation.
    status: completed
  - id: api-theme-settings
    content: Refactor `/api/theme` route to GET/PUT per-user theme settings (validate input, persist to DB, set cookies).
    status: completed
  - id: ssr-initial-attributes
    content: Update `app/layout.tsx` to read theme cookies and set initial `<html data-theme-color data-density data-radius>` attributes to prevent FOUC/hydration mismatch.
    status: completed
isProject: false
---

## Architecture (providers + tokens)

- **Single source of truth (client)**: `ThemeSettingsProvider` holds `{ mode, color, density, radius }` and exposes setters + a `save()` helper.
  - **Applies theme globally** by setting attributes on the root element:
    - `document.documentElement.dataset.themeColor = "zinc" | "green" | ...`
    - `document.documentElement.dataset.density = "compact" | "comfortable" | "large"`
    - `document.documentElement.dataset.radius = "0" | "0_3" | "0_5" | "0_75" | "1_0"` (or named presets)
  - **Persists** by calling `PUT /api/theme` with the settings; on success, server sets cookies + persists to DB.
- **Mode (light/dark/system)** stays owned by `next-themes`.
  - Keep `ThemeProvider` from `next-themes` as you already do in `[app/layout.tsx](c:\wamp64\www\shadcn-isp-client\app\layout.tsx)`.
  - Keep `suppressHydrationWarning` on `<html>` (already present).
- **Server-first initial render (no hydration issues / no flash)**:
  - Read theme cookies in `[app/layout.tsx](c:\wamp64\www\shadcn-isp-client\app\layout.tsx)` and set initial `data-`* attributes on `<html>` so the first paint uses the correct **color + density + radius**.
  - Client provider hydrates using the same cookie-derived defaults and then stays in sync.
- **Design tokens**:
  - **Color tokens** remain `--background`, `--primary`, etc (already in `[app/globals.css](c:\wamp64\www\shadcn-isp-client\app\globals.css)`), but are moved from “JS mutation after fetch” to **CSS selectors by attribute**.
  - **Density tokens** are new CSS variables `--space-1`, `--space-2`, `--space-4`, `--space-10`, … and they change under `:root[data-density="compact"]` / `comfortable` / `large`.
  - **Radius tokens** remain `--radius` and are set by `:root[data-radius="..."]` selectors.

## Density implementation (global spacing scale)

- Add CSS variables for the spacing keys that matter most (matching Tailwind/shadcn usage): `0.5, 1, 2, 3, 4, 6, 8, 10, 12, 16`.
- In `[tailwind.config.ts](c:\wamp64\www\shadcn-isp-client\tailwind.config.ts)`, override `theme.spacing` for those keys to `var(--space-*)` while preserving the rest of Tailwind’s default spacing via `defaultTheme.spacing`.
  - Result: `**p-4`, `gap-4`, `h-10`, `rounded-lg` (already) become density-aware globally** without rewriting components.

## Color themes (no dynamic Tailwind classes)

- Replace runtime `bg-${color}-...` and JS-based CSS var mutation.
  - Today `ThemeSettings` creates dynamic classes:

```16:26:c:\wamp64\www\shadcn-isp-client\components\settings\themes.tsx
  const bgColor = (color: string) => {
    const value: any = {
      green: 600,
      red: 600,
      zinc: 900,
      rose: 600,
      orange: 500,
      blue: 600,
    };
    return `bg-${color}-${value[color]}`;
  };
```

- Move each palette into CSS blocks like:
  - `:root[data-theme-color="green"], [data-theme-scope="preview"][data-theme-color="green"] { --primary: ...; ... }`
  - `.dark:root[data-theme-color="green"], .dark [data-theme-scope="preview"][data-theme-color="green"] { ... }`
- Then the UI preview dots can simply use stable classes like `bg-primary` inside a preview scope.

## Backend + persistence (/api/theme)

- Repurpose `[app/api/theme/route.ts](c:\wamp64\www\shadcn-isp-client\app\api\theme\route.ts)` from “editing palettes in JSON” to “persisting per-user settings”.
  - Today it rewrites `data/theme-settings.json`:

```7:16:c:\wamp64\www\shadcn-isp-client\app\api\theme\route.ts
export async function PUT(request: Request) {
    try {
        const form = await request.json();
        const data = await fs.readFile(filePath, "utf-8");
        const json = JSON.parse(data);

        json["colors"][form?.target]["light"][form?.key] = form.value;
        await fs.truncate(filePath, 0); // Clears the file
        await fs.writeFile(filePath, JSON.stringify(json, null, 2), "utf-8");
```

- New behavior:
  - **GET**: return current user settings (from DB if authed; else from cookie; with safe defaults).
  - **PUT**: validate input (zod), persist to DB, and set cookies (`themeColor`, `density`, `radius`, optionally `mode`) so SSR can render it immediately next request.

## State shape + TypeScript

- Replace `ThemeColors` with a normalized, lowercase union (matches `data-theme-color`), and include `red` since it’s currently offered by UI but missing from the type.
- Introduce `ThemeDensity` and `ThemeRadiusPreset` unions.
- Remove `any` usage in settings components and providers.

## Example files to update

- Providers/state
  - `[context/theme-provider.tsx](c:\wamp64\www\shadcn-isp-client\context\theme-provider.tsx)`: keep the `next-themes` wrapper, but export a composed `AppThemeProvider` that includes `ThemeSettingsProvider`.
  - `[context/theme-data-provider.tsx](c:\wamp64\www\shadcn-isp-client\context\theme-data-provider.tsx)`: replace with the unified settings provider (or rename and update imports) so we stop doing mounted-null rendering and stop fetching `/api/theme` just to set vars.
- UI
  - `[components/settings/themes.tsx](c:\wamp64\www\shadcn-isp-client\components\settings\themes.tsx)`: add Density toggle group; make color options use preview-scope + `bg-primary`; persist `{color,density,radius,mode}` via the new API.
- Tokens/config
  - `[app/globals.css](c:\wamp64\www\shadcn-isp-client\app\globals.css)`: add density + radius selectors, and per-color token blocks keyed by `data-theme-color`.
  - `[tailwind.config.ts](c:\wamp64\www\shadcn-isp-client\tailwind.config.ts)`: override spacing keys to CSS vars (density-aware).
- SSR defaults
  - `[app/layout.tsx](c:\wamp64\www\shadcn-isp-client\app\layout.tsx)`: read cookies and set `<html data-theme-color data-density data-radius>` defaults.
- API
  - `[app/api/theme/route.ts](c:\wamp64\www\shadcn-isp-client\app\api\theme\route.ts)`: implement GET/PUT for settings persistence (DB + cookie) + input validation.

## Best practices baked in

- **No dynamic Tailwind class names**: only static classes + CSS variables and `data-`* attributes.
- **Scalable additions**:
  - Add a new color: add one CSS block for light/dark tokens + include it in the typed union + settings UI list.
  - Add a new density: add one `data-density` block that sets the `--space-`* variables.
- **Hydration-safe**: SSR sets `data-`* attributes from cookies; client provider only syncs/updates after mount; `next-themes` keeps handling the `dark` class.

