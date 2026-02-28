---
name: Table fixed/full layout mode
overview: Add a global Fixed (default) vs Full table layout mode toggled from the DataTable toolbar. Fixed mode constrains the dashboard to the viewport and scrolls only the table content; Full mode allows natural page scrolling while keeping the dashboard header fixed. Also improve the table skeleton loader to be theme-safe and avoid flicker/jumps.
todos:
  - id: add-layout-mode-provider
    content: Create global Fixed/Full layout mode context persisted to localStorage and wire it into the dashboard layout.
    status: completed
  - id: fix-pagecontainer-navbar
    content: Refactor `PageContainer` flex/height model and make `TopNavbar` sticky so the dashboard header never scrolls.
    status: completed
  - id: data-table-fixed-vs-full
    content: Update `DataTable` to switch between fixed internal table scrolling vs full natural page layout, including header/pagination stickiness rules.
    status: completed
  - id: toolbar-toggle
    content: Implement the toolbar layout toggle button behavior and visual state, respecting button/icon spacing rules.
    status: completed
  - id: skeleton-loader
    content: Implement a theme-safe, non-flickery table skeleton that matches table layout and uses stable row/column sizing.
    status: completed
  - id: user-table-rendering
    content: Ensure user table renders during loading (no `users.length > 0` guard) so skeleton prevents UI popping.
    status: completed
isProject: false
---

### Goals

- **Fixed Layout (default)**: no outer page scrollbar; only the table content area scrolls; table header + pagination stay visible; dashboard header never scrolls.
- **Full Layout**: normal page scrolling; table grows naturally; no internal table scroll; dashboard header stays fixed.
- **Scalable**: one global layout mode usable by any table.
- **Loading UX**: theme-safe skeleton that avoids flicker and minimizes layout jumping.

### Current constraints (from code)

- `PageContainer` uses a hard-coded height `h-[calc(100dvh-40px)]` but `TopNavbar` is `h-16` (64px), which prevents reliable viewport-fit behavior.
- `DataTable` currently applies vertical overflow to `TableBody` and uses sticky header/pagination unconditionally; loading uses skeleton for both `isLoading` and `isFetching`, which can cause flicker.
- The `Table` primitive wraps the `<table>` in a `div` with `overflow-auto` (good for horizontal scroll), so vertical scrolling should be controlled by a parent “scroll region” wrapper.

### Design

- Add a **global client-side layout mode** (`"fixed" | "full"`) persisted in **localStorage**.
- Expose it via a small provider/hook (e.g. `useTableLayoutMode`) so **any** table toolbar can toggle it and **any** table can read it.
- Implement the layout differences purely via Tailwind classes (theme-safe) and flexbox (`min-h-0` + `overflow-`*) to ensure correct scroll containment.

### Implementation details

- **New context/hook**
  - Add `context/table-layout-provider.tsx` (or equivalent) exporting:
    - `TableLayoutProvider`
    - `useTableLayoutMode()` → `{ mode, setMode, toggleMode }`
  - Persist to `localStorage` key like `"tableLayoutMode"`, defaulting to `"fixed"`.
- **Wire provider at dashboard level**
  - Wrap the dashboard content in the provider in `[app/(dashboard)/layout.tsx](c:/wamp64/www/shadcn-isp-client/app/(dashboard)/layout.tsx)` so all dashboard tables share the same mode.
- **Make dashboard header non-scrolling (always)**
  - Update `[app/(dashboard)/top-navbar.tsx](c:/wamp64/www/shadcn-isp-client/app/(dashboard)/top-navbar.tsx)` header to be `sticky top-0 z-* bg-background`.
- **Fix `PageContainer` viewport/flex structure**
  - Update `[components/page-container.tsx](c:/wamp64/www/shadcn-isp-client/components/page-container.tsx)` to remove the incorrect `calc(100dvh-40px)` sizing and instead use a flex layout that supports both modes:
    - container: `min-h-dvh flex flex-col`
    - content wrapper: `flex-1 min-h-0 p-4 flex flex-col`
  - This lets Fixed mode work (children can be height-constrained) and Full mode work (children can grow and body scroll naturally).
- **DataTable: implement Fixed vs Full rendering**
  - Update `[components/data-table/data-table.tsx](c:/wamp64/www/shadcn-isp-client/components/data-table/data-table.tsx)` to read `mode` and:
    - Fixed mode:
      - Root/table frame become `flex flex-col min-h-0`.
      - Introduce a **scroll region** wrapper around the `Table` with `flex-1 min-h-0 overflow-auto`.
      - Apply sticky header class (`sticky top-0 z-10 bg-muted/90 backdrop-blur-xs`).
      - Keep pagination visible via `sticky bottom-0` (and mobile offset) **only in fixed mode**.
    - Full mode:
      - Remove height constraints (`min-h-0`/`flex-1`) from the table frame.
      - Scroll region becomes non-scrolling (`overflow-visible`), so the page scrolls normally.
      - Remove sticky positioning from table header/pagination.
    - Move vertical overflow off `TableBody` (it’s a `<tbody>` and shouldn’t be the scroll container).
- **Toolbar toggle button**
  - Update `[components/data-table/data-table-toolbar.tsx](c:/wamp64/www/shadcn-isp-client/components/data-table/data-table-toolbar.tsx)` (the button at lines 115–119) to:
    - call `toggleMode()` on click
    - reflect current state (icon swap + accessible label)
    - remove icon margin classes like `mr-2` per workspace button-spacing rule
  - (Optional cleanup) also remove `mr-2` in `[components/data-table/data-table-view-options.tsx](c:/wamp64/www/shadcn-isp-client/components/data-table/data-table-view-options.tsx)` for consistency.
- **Skeleton loader improvements (no flicker/jumps)**
  - Update `DataTable` loading logic:
    - Show skeleton when **initially loading** (e.g. `isLoading || (isFetching && data.length === 0)`), but **do not** replace the table with skeleton during background refetches.
  - Replace the generic `SkeletonLoader` table mode with a **DataTable-specific skeleton** that:
    - matches the table frame (same border container)
    - uses `Skeleton` tokens (`bg-primary/10`) for theme compatibility
    - uses **stable row count** based on `pagination?.per_page` / table pageSize to reduce UI jumping
    - uses the current visible column count to avoid width changes
- **Ensure user table renders while loading**
  - Update `[components/users/user-table.tsx](c:/wamp64/www/shadcn-isp-client/components/users/user-table.tsx)` to render `DataTable` even when `users.length === 0` (so skeleton can appear and prevent layout pop-in).

### Test plan

- Navigate to the Users table page.
- **Default**: verify Fixed mode has no outer page scrollbar and only table content scrolls; TopNavbar remains visible.
- Toggle to **Full**: verify the page scrolls normally, table grows, no internal table scroll appears; TopNavbar stays fixed.
- Verify pagination remains visible in Fixed mode and scrolls with page in Full mode.
- Verify skeleton:
  - shows on first load with stable height
  - does not flash/replace content during background refetch
- Verify on mobile:
  - pagination positioning remains usable (existing `bottom-16` offset still applies in Fixed mode).

