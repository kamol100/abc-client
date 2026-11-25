import { FileText, KeyRound, Landmark, Network, PackageOpen, UserCheck, Users } from "lucide-react";
import { describe, expect, it } from "vitest";
import { buildMenuConfig } from "@/hooks/use-menu-items";
import { FALLBACK_GROUP_ICON, permissionGroupIcons } from "@/components/permissions/permission-group-icons";

describe("permission group icons", () => {
  const icons = permissionGroupIcons(buildMenuConfig((key) => key));

  it("uses the sidebar item's icon for its groups", () => {
    expect(icons.get("clients")).toBe(Users);
    expect(icons.get("invoices")).toBe(FileText);
    expect(icons.get("payments")).toBe(FileText);
    expect(icons.get("olts")).toBe(Network);
    expect(icons.get("products")).toBe(PackageOpen);
  });

  it("prefers the item that lists the group itself over a sub-item elsewhere", () => {
    // funds is also a Reports sub-item, and resellers is also a Network sub-item.
    expect(icons.get("funds")).toBe(Landmark);
    expect(icons.get("resellers")).toBe(UserCheck);
  });

  it("borrows an icon for groups with no menu item", () => {
    expect(icons.get("products-in")).toBe(PackageOpen);
    expect(icons.get("products-out")).toBe(PackageOpen);
    expect(icons.get("dashboard-card")).toBe(icons.get("dashboard"));
  });

  it("leaves unknown groups to the fallback", () => {
    expect(icons.get("not-a-group")).toBeUndefined();
    expect(FALLBACK_GROUP_ICON).toBe(KeyRound);
  });

  it("follows an admin-picked icon", () => {
    const menu = [{ icon: Users, permissions: ["clients.access"] }];
    expect(permissionGroupIcons(menu).get("clients")).toBe(Users);
    expect(permissionGroupIcons([{ ...menu[0], icon: Landmark }]).get("clients")).toBe(Landmark);
  });
});
