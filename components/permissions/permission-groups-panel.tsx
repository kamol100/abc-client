"use client";

import { FC, useMemo, useState } from "react";
import { Pin, PinOff, Search, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import MyButton from "@/components/my-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  GENERAL_GROUP,
  canPinGroup,
  filterPermissionGroups,
  grantedCount,
  groupDisplayName,
  orderPermissionGroups,
  permissionActionName,
  type PermissionGroup,
  type PermissionShowFilter,
} from "@/components/permissions/permission-groups";
import type { PermissionRow } from "@/components/permissions/permission-type";
import { cn } from "@/lib/utils";

type Props = {
  groups: PermissionGroup[];
  selected: string[];
  show: PermissionShowFilter;
  disabled: boolean;
  onTogglePermission: (name: string, checked: boolean) => void;
  onToggleGroup: (permissions: PermissionRow[], checked: boolean) => void;
  pins: string[];
  canPin: boolean;
  pinDisabled: boolean;
  onTogglePin: (group: string) => void;
  /** The sidebar menu icon for a group. */
  groupIcon: (group: string) => LucideIcon;
};

/** Same frame height on both panes, so switching groups never moves the page. */
const PANE_HEIGHT = "md:h-[calc(100dvh-15rem)] md:min-h-[26rem]";

/**
 * Permission groups as a searchable list (pinned first) beside the chosen
 * group's permissions. Granting and revoking go through the same callbacks as before.
 */
const PermissionGroupsPanel: FC<Props> = ({
  groups,
  selected,
  show,
  disabled,
  onTogglePermission,
  onToggleGroup,
  pins,
  canPin,
  pinDisabled,
  onTogglePin,
  groupIcon,
}) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | null>(null);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const pinSet = useMemo(() => new Set(pins), [pins]);
  const ordered = useMemo(() => orderPermissionGroups(groups, pins), [groups, pins]);
  const visible = useMemo(
    () => filterPermissionGroups(ordered, query, show, selectedSet),
    [ordered, query, show, selectedSet],
  );

  // The chosen group, or the first one the search and filter leave.
  const current = visible.find((group) => group.name === active) ?? visible[0];

  const CurrentIcon = current ? groupIcon(current.name) : null;

  const label = (name: string) =>
    name === GENERAL_GROUP ? t("permission.general_group") : groupDisplayName(name);

  return (
    <div className="grid overflow-hidden rounded-[var(--radius)] border bg-card md:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className={cn("flex min-h-0 flex-col border-b md:border-b-0 md:border-r", PANE_HEIGHT)}>
        <div className="border-b p-2">
          <label className="relative block">
            <span className="sr-only">{t("permission.search_groups")}</span>
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="permission-group-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("permission.search_groups")}
              className="h-9 pl-8"
            />
          </label>
        </div>

        <nav aria-label={t("permission.groups")} className="max-h-64 flex-1 overflow-y-auto md:max-h-none">
          {visible.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">{t("permission.no_group_match")}</p>
          ) : (
            <ul>
              {visible.map((group) => {
                const granted = grantedCount(group, selectedSet);
                const total = group.permissions.length;
                const isCurrent = group.name === current?.name;
                const isPinned = pinSet.has(group.name);
                const GroupIcon = groupIcon(group.name);
                return (
                  <li
                    key={group.name}
                    className={cn(
                      "flex items-center gap-1 border-b pr-1 last:border-b-0",
                      isCurrent && "bg-accent",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setActive(group.name)}
                      aria-current={isCurrent ? "true" : undefined}
                      className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1.5 px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <GroupIcon
                          className={cn("size-4 shrink-0", isCurrent ? "text-primary" : "text-muted-foreground")}
                          aria-hidden
                        />
                        <span className="truncate text-sm font-medium capitalize">{label(group.name)}</span>
                      </span>
                      <span
                        className={cn(
                          "text-xs tabular-nums text-muted-foreground",
                          total > 0 && granted === total && "text-primary",
                        )}
                      >
                        {granted}/{total}
                      </span>
                      <progress
                        value={granted}
                        max={Math.max(total, 1)}
                        aria-hidden
                        className="col-span-2 h-1 w-full appearance-none overflow-hidden rounded-full bg-muted [&::-moz-progress-bar]:bg-primary [&::-webkit-progress-bar]:bg-muted [&::-webkit-progress-value]:bg-primary"
                      />
                    </button>
                    {canPin && canPinGroup(group.name) && (
                      <MyButton
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn("size-7 shrink-0", isPinned ? "text-primary" : "text-muted-foreground")}
                        onClick={() => onTogglePin(group.name)}
                        disabled={pinDisabled}
                        aria-pressed={isPinned}
                        aria-label={t(isPinned ? "permission.pin.unpin" : "permission.pin.pin")}
                        tooltip={t(isPinned ? "permission.pin.unpin" : "permission.pin.pin")}
                      >
                        {isPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                      </MyButton>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </nav>
      </aside>

      <section className={cn("min-w-0 overflow-y-auto p-4", PANE_HEIGHT)}>
        {current ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Checkbox
                id={`permission-group-${current.name}`}
                checked={
                  current.permissions.length > 0 &&
                  grantedCount(current, selectedSet) === current.permissions.length
                }
                onCheckedChange={(value) => onToggleGroup(current.permissions, value === true)}
                disabled={disabled}
              />
              <label
                htmlFor={`permission-group-${current.name}`}
                className="flex cursor-pointer items-center gap-2 text-lg font-semibold capitalize"
              >
                {CurrentIcon && <CurrentIcon className="size-5 shrink-0 text-primary" aria-hidden />}
                {label(current.name)}
              </label>
              <span className="text-sm tabular-nums text-muted-foreground">
                {t("permission.granted_of", {
                  granted: grantedCount(current, selectedSet),
                  total: current.permissions.length,
                })}
              </span>
            </div>

            {current.visible.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("permission.empty_permissions")}</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {current.visible.map((permission) => {
                  const checkboxId = `permission-${permission.name}`;
                  return (
                    <li key={permission.name}>
                      <label
                        htmlFor={checkboxId}
                        className={cn(
                          "flex h-full items-center gap-3 rounded-[var(--radius)] border px-3 py-2.5",
                          disabled ? "cursor-not-allowed opacity-70" : "cursor-pointer hover:bg-accent",
                        )}
                      >
                        <Checkbox
                          id={checkboxId}
                          checked={selectedSet.has(permission.name)}
                          onCheckedChange={(value) => onTogglePermission(permission.name, value === true)}
                          disabled={disabled}
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium capitalize">
                            {permissionActionName(current.name, permission.name)}
                          </span>
                          <span className="block break-all font-mono text-xs text-muted-foreground">
                            {permission.name}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{t("permission.select_group")}</p>
        )}
      </section>
    </div>
  );
};

/** Matches the panel's two panes so the page does not jump when permissions arrive. */
export const PermissionGroupsPanelSkeleton: FC = () => (
  <div className="grid overflow-hidden rounded-[var(--radius)] border bg-card md:grid-cols-[18rem_minmax(0,1fr)]">
    <div className={cn("flex flex-col border-b md:border-b-0 md:border-r", PANE_HEIGHT)}>
      <div className="border-b p-2">
        <Skeleton className="h-9 w-full" />
      </div>
      <div className="max-h-64 flex-1 space-y-4 overflow-hidden p-3 md:max-h-none">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-1 w-full" />
          </div>
        ))}
      </div>
    </div>
    <div className={cn("space-y-4 p-4", PANE_HEIGHT)}>
      <Skeleton className="h-6 w-48" />
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    </div>
  </div>
);

export default PermissionGroupsPanel;
