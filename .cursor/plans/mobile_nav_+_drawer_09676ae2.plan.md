---
name: Mobile nav + drawer
overview: On small screens (<768px), make the bottom `MobileMenuBar` the primary navigation and open the full menu inside a configurable left/right drawer that respects theme animation and keeps all page content constrained between the sticky header and bottom bar. Desktop sidebar behavior remains unchanged.
todos:
  - id: mobile-wrapper-contract
    content: Apply consistent mobile wrapper sizing (h-dvh/flex/overflow-hidden) and define --mobile-nav-height in SidebarInset
    status: completed
  - id: mobile-drawer-safe-area
    content: Adjust mobile SheetContent to stop above bottom bar and keep existing animations
    status: completed
  - id: mobile-menu-primary-nav
    content: Rebuild MobileMenuBar to use useMenuItems(), highlight active route, and open drawer from rightmost button
    status: completed
  - id: theme-setting-drawer-side
    content: Add navDrawerSide (left/right) to theme settings types/provider, /api/theme cookies, and UI toggle
    status: completed
  - id: wire-drawer-side
    content: Use theme navDrawerSide to control Sidebar sheet side on mobile only
    status: completed
  - id: mobile-content-fit
    content: Add mobile-only bottom padding to PageContainer scroll area and offset sticky form actions above bottom bar
    status: completed
isProject: false
---

## Goals

- **Mobile only (<768px)**: bottom `MobileMenuBar` is the primary navigation.
- **Rightmost bottom-bar button** opens a drawer containing **all menu items**.
- **Drawer direction configurable** (left/right) via the existing Theme Customizer settings (cookie-backed `/api/theme`).
- **Layout safety on mobile**: page content (tables/forms) stays within the visible region between the sticky `TopNavbar` and the bottom bar; avoid page-level scrolling; allow internal scrolling.
- **Desktop untouched**: existing sidebar + layout behavior on md+ remains the same.

## Key observations (current code)

- Mobile sidebar is already a `Sheet` in `[components/ui/sidebar.tsx](C:/wamp64/www/shadcn-isp-client/components/ui/sidebar.tsx)` when `useIsMobile()` is true.
- Bottom bar is already rendered on mobile via `SidebarInset`.
- Current `SidebarProvider` wrapper layout classes only apply when `!isMobile`, which can allow body/page scrolling on mobile.
- `PageContainer` controls the sticky header (`TopNavbar`) and the inner scroll container.

## Implementation plan

### 1) Add a single mobile layout contract (CSS var for bottom bar)

- In `[components/ui/sidebar.tsx](C:/wamp64/www/shadcn-isp-client/components/ui/sidebar.tsx)` inside `SidebarInset` (mobile path), define a CSS variable like `--mobile-nav-height: 65px` and reuse it everywhere that needs bottom-safe spacing.
- Ensure the main app wrapper uses `flex h-dvh overflow-hidden` **on mobile too** (move the wrapper classes in `SidebarProvider` to apply regardless of `isMobile`).

### 2) Make the mobile drawer stop above the bottom bar

- In the mobile `SheetContent` branch of `Sidebar` (in `components/ui/sidebar.tsx`), adjust the content positioning/height so the drawer ends at `bottom: var(--mobile-nav-height)` (your choice: “keep bottom bar visible”).
- Keep using the existing `Sheet` animation classes from `[components/ui/sheet.tsx](C:/wamp64/www/shadcn-isp-client/components/ui/sheet.tsx)` so transitions remain theme-consistent.

### 3) Turn `MobileMenuBar` into real primary navigation

- Rewrite `[components/mobile-menu-bar.tsx](C:/wamp64/www/shadcn-isp-client/components/mobile-menu-bar.tsx)` to:
  - Build its buttons from `useMenuItems()` (permission-aware).
  - Render up to 4 “primary” routes (e.g. first items where `url !== "#"` and no sub-items), with active styling based on `usePathname()`.
  - Keep the **rightmost** button as “More” (menu icon) that calls `toggleSidebar()` to open the full drawer.
  - Remove placeholder buttons / `console.log`.

### 4) Add a Theme Customizer toggle for drawer direction

- Extend the theme settings model to include `navDrawerSide: "left" | "right"`:
  - `[types/theme-types.tsx](C:/wamp64/www/shadcn-isp-client/types/theme-types.tsx)`
  - `[context/theme-data-provider.tsx](C:/wamp64/www/shadcn-isp-client/context/theme-data-provider.tsx)` default + setters
  - `[app/api/theme/route.ts](C:/wamp64/www/shadcn-isp-client/app/api/theme/route.ts)` zod schema + cookie read/write
  - `[app/layout.tsx](C:/wamp64/www/shadcn-isp-client/app/layout.tsx)` read cookie and pass into `ThemeSettingsProvider.initialSettings`
  - Add UI in `[components/theme-customizer.tsx](C:/wamp64/www/shadcn-isp-client/components/theme-customizer.tsx)` and `[components/settings/themes.tsx](C:/wamp64/www/shadcn-isp-client/components/settings/themes.tsx)` as a small ToggleGroup (Left/Right).

### 5) Wire the drawer side into the mobile sidebar sheet

- In `[components/app-sidebar.tsx](C:/wamp64/www/shadcn-isp-client/components/app-sidebar.tsx)`, read `navDrawerSide` from `useThemeSettings()` and pass it to `Sidebar` **only on mobile** (desktop remains left).

### 6) Constrain content between header and bottom bar (mobile only)

- In `[components/page-container.tsx](C:/wamp64/www/shadcn-isp-client/components/page-container.tsx)`, detect mobile (`useSidebar().isMobile` or `useIsMobile()`) and add bottom padding to the scroll container:
  - Replace `p-4` with `px-4 pt-4` and add `pb-[calc(theme(spacing.4)+var(--mobile-nav-height))]` on mobile.
- In `[components/form-wrapper/form-wrapper.tsx](C:/wamp64/www/shadcn-isp-client/components/form-wrapper/form-wrapper.tsx)`, when using sticky action buttons (`sticky bottom-0`), offset them on mobile to `bottom-[var(--mobile-nav-height)]` so Save/Cancel never sit behind the bottom bar.
- In `[app/(dashboard)/top-navbar.tsx](C:/wamp64/www/shadcn-isp-client/app/(dashboard)/top-navbar.tsx)`, hide `SidebarTrigger` on mobile (since the bottom bar becomes the primary nav); keep it on md+.

## Verification (manual)

- Mobile (<768px):
  - Bottom bar always visible.
  - “More” opens drawer above bottom bar; direction follows Theme Customizer.
  - Tables: header toolbar visible, table scrolls internally, pagination visible (not behind bottom bar).
  - Forms/accordions: Save/Cancel visible and not covered.
  - No page-level body scrolling unless a specific page intentionally forces it.
- Desktop (>=768px): sidebar collapse/rail/inset behavior unchanged.

