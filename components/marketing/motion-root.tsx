"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/* Tags every revealable element on a marketing page with a variant, then shows each one as it scrolls into view.
 * Order matters: the first match wins, and anything inside an already tagged element (a card, a panel) moves with it. */
const VARIANTS: [string, string][] = [
  [".mkt-label", "left"],
  ["h1, h2", "wipe"],
  ["figure, [data-slot], .mkt-panel", "zoom"],
  ["li, tr, dl > *, details, form > *, .mkt-price-plan, .mkt-btn", "item"],
  ["h3, p, aside, fieldset, img", "up"],
];
const SKIP = ".mkt-hero, .mkt-nav, [data-rv]";
const ROOTS = ".mkt-page, .mkt-foot";

export default function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    const html = document.documentElement;
    if (!matchMedia("(prefers-reduced-motion: no-preference)").matches || !("IntersectionObserver" in window)) {
      html.classList.add("mkt-motion");
      return;
    }

    const show = (el: Element) => {
      el.setAttribute("data-rv-in", "");
      io.unobserve(el);
      pending.delete(el);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) show(e.target);
      },
      { threshold: 0.15 },
    );

    /* The observer only reports elements crossing into view. One skipped past (End key, a fast fling, restored scroll)
       never crosses, so after any scroll, show everything whose top is already above the bottom of the screen. */
    const pending = new Set<Element>();
    let ticking = false;
    const sweep = () => {
      ticking = false;
      for (const el of pending) if (el.getBoundingClientRect().top < innerHeight) show(el);
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(sweep);
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll, { passive: true });

    const frame = requestAnimationFrame(() => {
      const all = VARIANTS.map(([sel]) => sel).join(", ");
      for (const root of document.querySelectorAll(ROOTS)) {
        for (const el of root.querySelectorAll<HTMLElement>(all)) {
          if (el.hasAttribute("data-rv") || el.parentElement?.closest(SKIP)) continue;
          const variant = VARIANTS.find(([sel]) => el.matches(sel))![1];
          // Siblings that arrive together cascade: items by column (up to 4), heads in reading order (up to 5).
          const prev = el.previousElementSibling;
          const i = prev?.hasAttribute("data-rv") ? Number(prev.getAttribute("data-rv-i")) + 1 : 0;
          el.setAttribute("data-rv", variant);
          el.setAttribute("data-rv-i", String(variant === "item" ? i % 4 : Math.min(i, 5)));
          io.observe(el);
          pending.add(el);
        }
      }
      html.classList.add("mkt-motion");
      sweep();
    });

    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  return null;
}
