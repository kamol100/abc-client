import { z } from "zod";
import type { LucideIcon } from "lucide-react";
import { isMenuIconName, menuIcon, type MenuIconName } from "@/lib/menu/menu-icons";

/**
 * The sidebar menu layout a company or reseller admin saves (settings.menu_layout).
 * It only orders items and picks icons: labels, links and permissions stay in
 * hooks/use-menu-items.ts. Mirrors isp-backend App\Services\MenuLayout\MenuLayoutRules.
 */
export interface MenuLayoutItem {
  /** Top-level menu id from buildMenuConfig. */
  id: number;
  /** Picked icon, or null for the item's default icon. */
  icon: MenuIconName | null;
  /** Sub-item links in their saved order. */
  children: string[];
}

export interface MenuLayout {
  items: MenuLayoutItem[];
  updated_at?: string | null;
  updated_by?: string | null;
}

const storedLayoutSchema = z.object({
  items: z.array(
    z.object({
      id: z.coerce.number().int().positive(),
      icon: z.string().nullable().optional(),
      children: z.array(z.string()).optional(),
    }),
  ),
  updated_at: z.string().nullable().optional(),
  updated_by: z.string().nullable().optional(),
});

/** The saved layout, or null for the default menu (nothing saved, or a value we cannot read). */
export function parseMenuLayout(value: unknown): MenuLayout | null {
  const parsed = storedLayoutSchema.safeParse(value);
  if (!parsed.success || parsed.data.items.length === 0) return null;
  return {
    items: parsed.data.items.map((item) => ({
      id: item.id,
      icon: isMenuIconName(item.icon) ? item.icon : null,
      children: item.children ?? [],
    })),
    updated_at: parsed.data.updated_at ?? null,
    updated_by: parsed.data.updated_by ?? null,
  };
}

/**
 * Puts a list in a saved order. Keys the saved order does not know (a menu item added
 * to the app later) go right after the item that comes before them by default, so
 * new pages appear where we designed them instead of at the end.
 */
export function orderBySavedKeys<T, K>(list: T[], keyOf: (item: T) => K, saved: K[]): T[] {
  const byKey = new Map(list.map((item) => [keyOf(item), item] as const));
  const result: T[] = [];
  const placed = new Set<K>();
  for (const key of saved) {
    const item = byKey.get(key);
    if (item !== undefined && !placed.has(key)) {
      result.push(item);
      placed.add(key);
    }
  }
  list.forEach((item, index) => {
    const key = keyOf(item);
    if (placed.has(key)) return;
    let position = 0;
    for (let before = index - 1; before >= 0; before--) {
      const at = result.findIndex((entry) => keyOf(entry) === keyOf(list[before]));
      if (at !== -1) {
        position = at + 1;
        break;
      }
    }
    result.splice(position, 0, item);
    placed.add(key);
  });
  return result;
}

interface LayoutTarget {
  id: number;
  icon: LucideIcon;
  items?: { url: string }[];
}

/** The sidebar items in the saved order, with saved icons and sub-item order. */
export function applyMenuLayout<T extends LayoutTarget>(items: T[], layout: MenuLayout | null): T[] {
  if (!layout) return items;
  const saved = new Map(layout.items.map((item) => [item.id, item] as const));
  const ordered = orderBySavedKeys(items, (item) => item.id, layout.items.map((item) => item.id));
  return ordered.map((item) => {
    const entry = saved.get(item.id);
    if (!entry) return item;
    return {
      ...item,
      icon: menuIcon(entry.icon, item.icon),
      ...(item.items ? { items: orderBySavedKeys(item.items, (sub) => sub.url, entry.children) } : {}),
    };
  });
}
