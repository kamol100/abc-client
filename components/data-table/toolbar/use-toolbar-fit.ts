"use client";

import { useLayoutEffect, useRef, useState } from "react";

/**
 * Lets a table toolbar give up room in steps when its one row no longer fits.
 *
 * Put `anchorRef` on any element inside the toolbar's start slot (the title).
 * `level` starts at 0 (everything in full). While the row is wider than the
 * toolbar, the level goes up one step at a time, up to `maxLevel`; the page
 * draws each level a little narrower. When the toolbar is again wide enough for
 * the level before, it goes back. The row is measured before the browser paints,
 * so the steps in between are never seen.
 *
 * `resetKey` is anything that changes when the toolbar's content changes (loading,
 * totals, count). The fit is then worked out again from level 0.
 */
export function useToolbarFit(maxLevel: number, resetKey?: unknown) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [level, setLevel] = useState(0);
  // The row width each level needed when it did not fit.
  const needs = useRef<number[]>([]);

  useLayoutEffect(() => {
    needs.current = [];
    setLevel(0);
  }, [resetKey]);

  useLayoutEffect(() => {
    const row = anchor?.closest<HTMLElement>('[data-toolbar-slot="start"]')?.parentElement;
    if (!row) return;

    const check = () => {
      const width = row.clientWidth;
      if (row.scrollWidth > width + 1) {
        if (level < maxLevel) {
          needs.current[level] = row.scrollWidth;
          setLevel(level + 1);
        }
        return;
      }
      const need = needs.current[level - 1];
      if (level > 0 && need !== undefined && width >= need) setLevel(level - 1);
    };

    check();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(check);
    observer.observe(row);
    for (const slot of Array.from(row.children)) observer.observe(slot);
    return () => observer.disconnect();
  }, [anchor, level, maxLevel, resetKey]);

  return { level, anchorRef: setAnchor };
}
