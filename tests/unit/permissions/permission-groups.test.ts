import { describe, expect, it } from "vitest";
import {
  GENERAL_GROUP,
  buildPermissionGroups,
  canPinGroup,
  filterPermissionGroups,
  orderPermissionGroups,
  permissionActionName,
  togglePin,
} from "@/components/permissions/permission-groups";

const rows = [
  "clients.access",
  "clients.create",
  "clients.image.upload",
  "invoices.access",
  "invoices.delete",
  "sub-zones.access",
  "dashboard",
].map((name) => ({ name }));

describe("permission groups", () => {
  // ব্যবহারকারীর অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «groups by the route-name prefix in API order»।
  it("Permission groups: groups by the route-name prefix in API order", () => {
    const groups = buildPermissionGroups(rows);
    expect(groups.map((group) => group.name)).toEqual(["clients", "invoices", "sub-zones", "dashboard"]);
    expect(groups[0].permissions.map((row) => row.name)).toEqual([
      "clients.access",
      "clients.create",
      "clients.image.upload",
    ]);
  });

  // ব্যবহারকারীর অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «puts pinned groups first in pin order and skips unknown pins»।
  it("Permission groups: puts pinned groups first in pin order and skips unknown pins", () => {
    const groups = buildPermissionGroups(rows);
    const ordered = orderPermissionGroups(groups, ["sub-zones", "gone", "invoices"]);
    expect(ordered.map((group) => group.name)).toEqual(["sub-zones", "invoices", "clients", "dashboard"]);
  });

  // ব্যবহারকারীর অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «adds a new pin at the top and removes an existing one»।
  it("Permission groups: adds a new pin at the top and removes an existing one", () => {
    expect(togglePin(["clients"], "invoices")).toEqual(["invoices", "clients"]);
    expect(togglePin(["invoices", "clients"], "invoices")).toEqual(["clients"]);
  });

  // ব্যবহারকারীর অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «searches group names, with dashes read as spaces»।
  it("Permission groups: searches group names, with dashes read as spaces", () => {
    const groups = buildPermissionGroups(rows);
    const none = new Set<string>();
    expect(filterPermissionGroups(groups, "sub zo", "all", none).map((group) => group.name)).toEqual(["sub-zones"]);
    expect(filterPermissionGroups(groups, " INV ", "all", none).map((group) => group.name)).toEqual(["invoices"]);
    // Group search only: a permission action does not match.
    expect(filterPermissionGroups(groups, "upload", "all", none)).toEqual([]);
  });

  // ব্যবহারকারীর অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «narrows to granted or not granted permissions and drops empty groups»।
  it("Permission groups: narrows to granted or not granted permissions and drops empty groups", () => {
    const groups = buildPermissionGroups(rows);
    const selected = new Set(["clients.access", "invoices.access", "invoices.delete"]);

    const granted = filterPermissionGroups(groups, "", "granted", selected);
    expect(granted.map((group) => group.name)).toEqual(["clients", "invoices"]);
    expect(granted[0].visible.map((row) => row.name)).toEqual(["clients.access"]);

    const missing = filterPermissionGroups(groups, "", "not_granted", selected);
    expect(missing.map((group) => group.name)).toEqual(["clients", "sub-zones", "dashboard"]);
  });

  // ব্যবহারকারীর অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «labels the action without the group prefix»।
  it("Permission groups: labels the action without the group prefix", () => {
    expect(permissionActionName("clients", "clients.image.upload")).toBe("image upload");
    expect(permissionActionName("dashboard-card", "dashboard-card.product-stock")).toBe("product stock");
  });

  // ব্যবহারকারীর অনুমতি যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «only pins real group names»।
  it("Permission groups: only pins real group names", () => {
    expect(canPinGroup("sub-zones")).toBe(true);
    // The backend accepts the same pattern, so the general group can be pinned too.
    expect(canPinGroup(GENERAL_GROUP)).toBe(true);
    expect(canPinGroup("Clients")).toBe(false);
  });
});
