"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Top room for focus rings. The page scroll area clips at the toolbar's top edge,
 * so without it the ring of a focused filter input or button is cut off. Every
 * layout (closed, open filter row, mobile) has the same room, so toggling the
 * filter does not move the table.
 */
const TOOLBAR_ROOT = "pt-1";

type ToolbarLayoutProps = {
  isMobile: boolean;
  start?: ReactNode;
  center?: ReactNode;
  end?: ReactNode;
  /** Mobile only: left side of the first row (page size). */
  mobileLead?: ReactNode;
  /** Mobile only: "row" puts the end actions on their own row. */
  mobileActions?: "inline" | "row";
  /** Mobile only: items that asked for their own full-width row. */
  mobileRows?: { key: string; node: ReactNode }[];
  /** Desktop only: when set, replaces the slots (the open filter row). */
  expanded?: ReactNode;
  /** Full-width row under everything (mobile simple search). */
  below?: ReactNode;
  /** Desktop only: the filter panel under the toolbar (panel position). */
  panel?: ReactNode;
  panelOpen?: boolean;
  /** id of the panel region, for the filter button's aria-controls. */
  panelId?: string;
};

/**
 * The only place that decides where toolbar slots sit.
 *
 * Desktop without center: start grows and wraps, end keeps its width on the
 * right (the long-standing toolbar layout).
 * Desktop with center: start | center | end on a 3-column grid. Both sides
 * grow equally, so the center stays in the middle; each side is never
 * narrower than its content.
 * Mobile: page size + end actions, then center, start, and each "row" item on
 * its own full-width row. Empty rows are not rendered.
 * Panel: under the desktop toolbar, collapsed to zero height while closed.
 */
export function ToolbarLayout({
  isMobile,
  start,
  center,
  end,
  mobileLead,
  mobileActions = "inline",
  mobileRows = [],
  expanded,
  below,
  panel,
  panelOpen = false,
  panelId,
}: ToolbarLayoutProps) {
  if (isMobile) {
    const actionsOnOwnRow = mobileActions === "row";
    return (
      <div className={cn("flex flex-col gap-2", TOOLBAR_ROOT)} data-toolbar-layout="mobile">
        <div className={cn("flex justify-end", actionsOnOwnRow && "flex-wrap")}>
          <div className="flex w-full flex-1 flex-wrap items-center gap-x-2">
            <div className="flex w-full justify-between">
              <div>{mobileLead}</div>
            </div>
          </div>
          <div
            className={cn(
              "ml-3 flex items-center gap-2",
              actionsOnOwnRow && "ml-0 w-full justify-end",
            )}
            data-toolbar-slot="end"
          >
            {end}
          </div>
        </div>
        {center && (
          <div className="flex min-h-5 w-full flex-wrap items-center justify-center gap-2" data-toolbar-slot="center">
            {center}
          </div>
        )}
        {start && (
          <div className="flex min-h-5 w-full flex-wrap items-center justify-center gap-2" data-toolbar-slot="start">
            {start}
          </div>
        )}
        {mobileRows.map((row) => (
          <div key={row.key} className="flex min-h-5 w-full items-center justify-center" data-toolbar-row={row.key}>
            {row.node}
          </div>
        ))}
        {below && <div className="w-full">{below}</div>}
      </div>
    );
  }

  if (expanded) {
    return (
      <div className={cn("flex w-full flex-col gap-2", TOOLBAR_ROOT)} data-toolbar-layout="expanded">
        {expanded}
        {below && <div className="w-full">{below}</div>}
      </div>
    );
  }

  const panelSlot = panel ? <ToolbarPanel id={panelId} open={panelOpen}>{panel}</ToolbarPanel> : null;

  if (!center) {
    return (
      <div className={TOOLBAR_ROOT} data-toolbar-layout="desktop">
        <div className="flex flex-col gap-2">
          <div className="flex justify-end">
            <div className="flex w-full flex-1 flex-wrap items-center gap-x-2" data-toolbar-slot="start">
              {start}
            </div>
            <div className="ml-3 flex items-center gap-2" data-toolbar-slot="end">
              {end}
            </div>
          </div>
          {below && <div className="w-full">{below}</div>}
        </div>
        {panelSlot}
      </div>
    );
  }

  return (
    <div className={TOOLBAR_ROOT} data-toolbar-layout="desktop-centered">
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-[minmax(max-content,1fr)_auto_minmax(max-content,1fr)] items-center gap-3">
          <div className="flex min-h-9 flex-wrap items-center gap-x-2" data-toolbar-slot="start">
            {start}
          </div>
          <div className="flex items-center justify-center gap-2" data-toolbar-slot="center">
            {center}
          </div>
          <div className="flex justify-end">
            {/* Content-sized, so a child's ml-auto cannot split the group. */}
            <div className="flex items-center gap-2" data-toolbar-slot="end">
              {end}
            </div>
          </div>
        </div>
        {below && <div className="w-full">{below}</div>}
      </div>
      {panelSlot}
    </div>
  );
}

/**
 * Opens and closes by animating the row height (0fr ↔ 1fr) with a fade and a
 * small slide, so the table moves down smoothly instead of jumping. Closed, it
 * takes no space and its fields leave the tab order. The gap above the panel is
 * inside the animated area, so the closed toolbar is exactly as tall as before.
 */
function ToolbarPanel({ id, open, children }: { id?: string; open: boolean; children: ReactNode }) {
  return (
    <div
      id={id}
      role="region"
      data-toolbar-panel={open ? "open" : "closed"}
      aria-hidden={!open}
      inert={!open}
      className={cn(
        "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
        open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
      )}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={cn(
            "pt-2 transition-transform duration-200 ease-out motion-reduce:transition-none",
            open ? "translate-y-0" : "-translate-y-2",
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
