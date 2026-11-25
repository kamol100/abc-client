import { groupBy } from "@/lib/helper/helper";
import type { PermissionRow } from "@/components/permissions/permission-type";

/** Permissions with no "group." prefix land here. */
export const GENERAL_GROUP = "__general__";

/** Same rule as the backend: the route-name prefix before the first dot. */
const PINNABLE_GROUP = /^[a-z0-9_-]{1,64}$/;

export type PermissionGroup = {
  name: string;
  permissions: PermissionRow[];
};

/** "All" shows every permission; the other two narrow to the role's state. */
export type PermissionShowFilter = "all" | "granted" | "not_granted";

export type VisiblePermissionGroup = PermissionGroup & {
  /** The permissions left after the show filter. */
  visible: PermissionRow[];
};

export function buildPermissionGroups(permissions: PermissionRow[]): PermissionGroup[] {
  const grouped = groupBy(permissions, (permission) => {
    const [group] = permission.name.split(".");
    return group || GENERAL_GROUP;
  });

  return Object.entries(grouped).map(([name, list]) => ({ name, permissions: list }));
}

export function canPinGroup(name: string): boolean {
  return PINNABLE_GROUP.test(name);
}

/** Pinned groups first, in pin order; the rest keep their API order. */
export function orderPermissionGroups(groups: PermissionGroup[], pins: string[]): PermissionGroup[] {
  const byName = new Map(groups.map((group) => [group.name, group]));
  const pinned = pins
    .map((name) => byName.get(name))
    .filter((group): group is PermissionGroup => group !== undefined);
  const pinnedNames = new Set(pinned.map((group) => group.name));

  return [...pinned, ...groups.filter((group) => !pinnedNames.has(group.name))];
}

/** A new pin goes to the top; pinning again removes it. */
export function togglePin(pins: string[], name: string): string[] {
  return pins.includes(name) ? pins.filter((pin) => pin !== name) : [name, ...pins];
}

export function filterPermissionGroups(
  groups: PermissionGroup[],
  query: string,
  show: PermissionShowFilter,
  selected: ReadonlySet<string>,
): VisiblePermissionGroup[] {
  const needle = query.trim().toLowerCase();

  return groups
    .filter((group) => needle === "" || groupSearchText(group.name).includes(needle))
    .map((group) => ({
      ...group,
      visible: group.permissions.filter((permission) => {
        if (show === "granted") return selected.has(permission.name);
        if (show === "not_granted") return !selected.has(permission.name);
        return true;
      }),
    }))
    .filter((group) => show === "all" || group.visible.length > 0);
}

export function grantedCount(group: PermissionGroup, selected: ReadonlySet<string>): number {
  return group.permissions.filter((permission) => selected.has(permission.name)).length;
}

/** "sub-zones" → "sub zones". The general group is labelled by the caller. */
export function groupDisplayName(name: string): string {
  return name.replace(/[-_]/g, " ");
}

/** "clients.image.upload" in group "clients" → "image upload". */
export function permissionActionName(group: string, permission: string): string {
  const action = permission.startsWith(`${group}.`) ? permission.slice(group.length + 1) : permission;
  return action.replace(/[.\-_]/g, " ");
}

function groupSearchText(name: string): string {
  return `${name} ${groupDisplayName(name)}`.toLowerCase();
}
