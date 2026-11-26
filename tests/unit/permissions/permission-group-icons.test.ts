import { FileText, KeyRound, Landmark, Network, PackageOpen, UserCheck, Users } from "lucide-react";
import { describe, expect, it } from "vitest";
import { buildMenuConfig } from "@/hooks/use-menu-items";
import { FALLBACK_GROUP_ICON, permissionGroupIcons } from "@/components/permissions/permission-group-icons";

describe("permission group icons", () => {
  const icons = permissionGroupIcons(buildMenuConfig((key) => key));

  // ব্যবহারকারীর অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «uses the sidebar item's icon for its groups»।
  it("Permission group icons: uses the sidebar item's icon for its groups", () => {
    expect(icons.get("clients")).toBe(Users);
    expect(icons.get("invoices")).toBe(FileText);
    expect(icons.get("payments")).toBe(FileText);
    expect(icons.get("olts")).toBe(Network);
    expect(icons.get("products")).toBe(PackageOpen);
  });

  // ব্যবহারকারীর অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «prefers the item that lists the group itself over a sub-item elsewhere»।
  it("Permission group icons: prefers the item that lists the group itself over a sub-item elsewhere", () => {
    // funds is also a Reports sub-item, and resellers is also a Network sub-item.
    expect(icons.get("funds")).toBe(Landmark);
    expect(icons.get("resellers")).toBe(UserCheck);
  });

  // ব্যবহারকারীর অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «borrows an icon for groups with no menu item»।
  it("Permission group icons: borrows an icon for groups with no menu item", () => {
    expect(icons.get("products-in")).toBe(PackageOpen);
    expect(icons.get("products-out")).toBe(PackageOpen);
    expect(icons.get("dashboard-card")).toBe(icons.get("dashboard"));
  });

  // ব্যবহারকারীর অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «leaves unknown groups to the fallback»।
  it("Permission group icons: leaves unknown groups to the fallback", () => {
    expect(icons.get("not-a-group")).toBeUndefined();
    expect(FALLBACK_GROUP_ICON).toBe(KeyRound);
  });

  // ব্যবহারকারীর অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «follows an admin-picked icon»।
  it("Permission group icons: follows an admin-picked icon", () => {
    const menu = [{ icon: Users, permissions: ["clients.access"] }];
    expect(permissionGroupIcons(menu).get("clients")).toBe(Users);
    expect(permissionGroupIcons([{ ...menu[0], icon: Landmark }]).get("clients")).toBe(Landmark);
  });
});
