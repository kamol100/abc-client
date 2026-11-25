import type { LucideIcon } from "lucide-react";
import type { NavMenuItem } from "@/hooks/use-menu-items";
import type { MenuIconName } from "@/lib/menu/menu-icons";
import { orderBySavedKeys, type MenuLayout, type MenuLayoutItem } from "@/lib/menu/menu-layout";

/** One row in the menu editor. Labels come from the app; only order and icon are edited. */
export interface EditorSubItem {
  url: string;
  title: string;
}

export interface EditorItem {
  id: number;
  title: string;
  defaultIcon: LucideIcon;
  icon: MenuIconName | null;
  children: EditorSubItem[];
}

/** The editor rows: the admin's default menu put in the saved order, with saved icons. */
export function editorItemsFrom(menu: NavMenuItem[], layout: MenuLayout | null): EditorItem[] {
  const base: EditorItem[] = menu.map((item) => ({
    id: item.id,
    title: item.title,
    defaultIcon: item.icon,
    icon: null,
    children: (item.items ?? []).map((sub) => ({ url: sub.url, title: sub.title })),
  }));
  if (!layout) return base;

  const saved = new Map(layout.items.map((item) => [item.id, item] as const));
  return orderBySavedKeys(base, (item) => item.id, layout.items.map((item) => item.id)).map((item) => {
    const entry = saved.get(item.id);
    if (!entry) return item;
    return {
      ...item,
      icon: entry.icon,
      children: orderBySavedKeys(item.children, (sub) => sub.url, entry.children),
    };
  });
}

/** What gets saved for the editor rows. */
export function layoutItemsFrom(items: EditorItem[]): MenuLayoutItem[] {
  return items.map((item) => ({
    id: item.id,
    icon: item.icon,
    children: item.children.map((sub) => sub.url),
  }));
}

/**
 * Keeps saved items this admin cannot see (another role's pages) in the layout, right
 * after the item that came before them, so saving does not move them for others.
 */
export function withHiddenItems(visible: MenuLayoutItem[], saved: MenuLayout | null): MenuLayoutItem[] {
  if (!saved) return visible;
  const shown = new Set(visible.map((item) => item.id));
  const result = [...visible];
  saved.items.forEach((item, index) => {
    if (shown.has(item.id)) return;
    let position = 0;
    for (let before = index - 1; before >= 0; before--) {
      const at = result.findIndex((entry) => entry.id === saved.items[before].id);
      if (at !== -1) {
        position = at + 1;
        break;
      }
    }
    result.splice(position, 0, item);
    shown.add(item.id);
  });
  return result;
}

export function sameLayout(a: EditorItem[], b: EditorItem[]): boolean {
  return JSON.stringify(layoutItemsFrom(a)) === JSON.stringify(layoutItemsFrom(b));
}

/** How many rows moved and how many icons changed against the saved menu. */
export function countChanges(draft: EditorItem[], saved: EditorItem[]): { moved: number; icons: number } {
  let moved = 0;
  let icons = 0;
  draft.forEach((item, index) => {
    const savedIndex = saved.findIndex((entry) => entry.id === item.id);
    const before = saved[savedIndex];
    if (savedIndex !== index) moved++;
    if (!before) return;
    if (before.icon !== item.icon) icons++;
    if (before.children.map((sub) => sub.url).join("|") !== item.children.map((sub) => sub.url).join("|")) moved++;
  });
  return { moved, icons };
}
