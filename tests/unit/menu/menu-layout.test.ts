import { describe, expect, it } from "vitest";
import { Contact, FileText, LayoutDashboard, LifeBuoy, Users } from "lucide-react";
import { applyMenuLayout, orderBySavedKeys, parseMenuLayout } from "@/lib/menu/menu-layout";
import { MENU_ICONS } from "@/lib/menu/menu-icons";
import {
  countChanges,
  editorItemsFrom,
  layoutItemsFrom,
  withHiddenItems,
} from "@/components/settings/menu-layout/menu-layout-editor";
import type { NavMenuItem } from "@/hooks/use-menu-items";

const menu: NavMenuItem[] = [
  { id: 1, title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { id: 2, title: "Clients", url: "/clients", icon: Users },
  {
    id: 13,
    title: "Support Tickets",
    url: "#",
    icon: LifeBuoy,
    items: [
      { title: "Support Tickets", url: "/tickets" },
      { title: "Subjects", url: "/subjects" },
      { title: "Tags", url: "/tags" },
    ],
  },
  { id: 9, title: "Invoice", url: "#", icon: FileText, items: [{ title: "Invoice", url: "/invoices" }] },
];

describe("parseMenuLayout", () => {
  // মেনুর বিন্যাস ও অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «reads a saved layout and drops icons we do not know»।
  it("Menu layout: reads a saved layout and drops icons we do not know", () => {
    const layout = parseMenuLayout({
      items: [
        { id: "2", icon: "contact", children: [] },
        { id: 1, icon: "skull" },
      ],
      updated_by: "vp",
    });
    expect(layout?.items).toEqual([
      { id: 2, icon: "contact", children: [] },
      { id: 1, icon: null, children: [] },
    ]);
    expect(layout?.updated_by).toBe("vp");
  });

  // মেনুর বিন্যাস ও অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «treats nothing saved, an empty list or a broken value as the default menu»।
  it("Menu layout: treats nothing saved, an empty list or a broken value as the default menu", () => {
    expect(parseMenuLayout(undefined)).toBeNull();
    expect(parseMenuLayout(null)).toBeNull();
    expect(parseMenuLayout({ items: [] })).toBeNull();
    expect(parseMenuLayout("menu")).toBeNull();
  });
});

describe("orderBySavedKeys", () => {
  // মেনুর বিন্যাস ও অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «puts an item the saved order does not know right after its default neighbour»।
  it("Menu layout: puts an item the saved order does not know right after its default neighbour", () => {
    expect(orderBySavedKeys(["a", "b", "new", "c"], (key) => key, ["c", "b", "a"])).toEqual(["c", "b", "new", "a"]);
    expect(orderBySavedKeys(["first", "a", "b"], (key) => key, ["b", "a"])).toEqual(["first", "b", "a"]);
  });

  // মেনুর বিন্যাস ও অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «ignores saved keys that are no longer in the menu»।
  it("Menu layout: ignores saved keys that are no longer in the menu", () => {
    expect(orderBySavedKeys(["a", "b"], (key) => key, ["gone", "b", "a"])).toEqual(["b", "a"]);
  });
});

describe("applyMenuLayout", () => {
  // মেনুর বিন্যাস ও অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «orders the sidebar, swaps icons and orders sub-items»।
  it("Menu layout: orders the sidebar, swaps icons and orders sub-items", () => {
    const result = applyMenuLayout(menu, {
      items: [
        { id: 13, icon: "headset", children: ["/tags", "/tickets"] },
        { id: 1, icon: null, children: [] },
        { id: 2, icon: "contact", children: [] },
      ],
    });

    // Invoice is not in the layout (a page added later): it follows Support Tickets, as it does by default.
    expect(result.map((item) => item.id)).toEqual([13, 9, 1, 2]);
    expect(result[0].icon).toBe(MENU_ICONS.headset);
    expect(result[0].items?.map((sub) => sub.url)).toEqual(["/tags", "/tickets", "/subjects"]);
    expect(result[2].icon).toBe(LayoutDashboard);
    expect(result[3].icon).toBe(Contact);
  });

  // মেনুর বিন্যাস ও অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «returns the menu unchanged without a layout»।
  it("Menu layout: returns the menu unchanged without a layout", () => {
    expect(applyMenuLayout(menu, null)).toBe(menu);
  });
});

describe("menu editor helpers", () => {
  // মেনুর বিন্যাস ও অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «builds rows from the saved layout and turns them back into the same layout»।
  it("Menu layout: builds rows from the saved layout and turns them back into the same layout", () => {
    const saved = {
      items: [
        { id: 2, icon: "contact" as const, children: [] },
        { id: 13, icon: null, children: ["/tags", "/tickets", "/subjects"] },
        { id: 1, icon: null, children: [] },
        { id: 9, icon: null, children: ["/invoices"] },
      ],
    };
    const rows = editorItemsFrom(menu, saved);

    expect(rows.map((row) => row.id)).toEqual([2, 13, 1, 9]);
    expect(rows[1].children.map((sub) => sub.url)).toEqual(["/tags", "/tickets", "/subjects"]);
    expect(layoutItemsFrom(rows)).toEqual(saved.items);
  });

  // মেনুর বিন্যাস ও অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps saved items this admin cannot see after their saved neighbour»।
  it("Menu layout: keeps saved items this admin cannot see after their saved neighbour", () => {
    const saved = { items: [{ id: 1, icon: null, children: [] }, { id: 28, icon: "globe" as const, children: [] }, { id: 2, icon: null, children: [] }] };
    const visible = [{ id: 2, icon: null, children: [] }, { id: 1, icon: null, children: [] }];

    expect(withHiddenItems(visible, saved).map((item) => item.id)).toEqual([2, 1, 28]);
  });

  // মেনুর বিন্যাস ও অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «counts moved rows, reordered groups and changed icons»।
  it("Menu layout: counts moved rows, reordered groups and changed icons", () => {
    const saved = editorItemsFrom(menu, null);
    const draft = editorItemsFrom(menu, {
      items: [
        { id: 2, icon: "contact", children: [] },
        { id: 1, icon: null, children: [] },
        { id: 13, icon: null, children: ["/subjects", "/tickets", "/tags"] },
        { id: 9, icon: null, children: ["/invoices"] },
      ],
    });

    expect(countChanges(draft, saved)).toEqual({ moved: 3, icons: 1 });
    expect(countChanges(saved, saved)).toEqual({ moved: 0, icons: 0 });
  });
});
