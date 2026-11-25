"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, GripVertical } from "lucide-react";
import Card from "@/components/card";
import MyButton from "@/components/my-button";
import { MyDialog } from "@/components/my-dialog";
import { Input } from "@/components/ui/input";
import { usePermissions, useProfile, useSettings } from "@/context/app-provider";
import useApiMutation from "@/hooks/use-api-mutation";
import { useMenuItems } from "@/hooks/use-menu-items";
import { MENU_ICON_NAMES, MENU_ICONS, menuIcon, type MenuIconName } from "@/lib/menu/menu-icons";
import { parseMenuLayout, type MenuLayoutItem } from "@/lib/menu/menu-layout";
import { cn } from "@/lib/utils";
import {
  countChanges,
  editorItemsFrom,
  layoutItemsFrom,
  sameLayout,
  withHiddenItems,
  type EditorItem,
} from "@/components/settings/menu-layout/menu-layout-editor";

/** What PUT and DELETE /menu-layout return (isp-backend MenuLayoutStore::read). */
interface MenuLayoutResponse {
  layout: { items: MenuLayoutItem[] } | null;
  updated_at: string | null;
  updated_by: string | null;
  scope: "company" | "reseller";
}

const TOP = "top";
const topId = (id: number) => `item-${id}`;
const subId = (groupId: number, url: string) => `sub-${groupId}-${url}`;

/** A sortable row; the grip button is the only drag handle, so the icon and chevron stay clickable. */
function SortableRow({
  id,
  container,
  label,
  className,
  children,
}: {
  id: string;
  container: string;
  label: string;
  className?: string;
  children: (handle: ReactNode) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { container },
  });

  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label={label}
      className="grid size-8 shrink-0 cursor-grab touch-none place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing"
    >
      <GripVertical className="size-4" aria-hidden="true" />
    </button>
  );

  return (
    <li
      ref={setNodeRef}
      // dnd-kit moves rows with a transform it computes while dragging; it can only be set inline.
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("relative list-none", isDragging && "z-10 opacity-80", className)}
    >
      {children(handle)}
    </li>
  );
}

export function MenuLayoutSettingsPage() {
  const { t, i18n } = useTranslation();
  const { hasPermission } = usePermissions();
  const { profile } = useProfile();
  const { settings, updateSettings } = useSettings();
  const canEdit = hasPermission("menu-layout.edit");
  // Stable id for dnd-kit's screen-reader text, so server and browser HTML match.
  const dndId = useId();
  const isReseller = !!profile?.reseller;

  const defaultMenu = useMenuItems({ withLayout: false });
  const savedLayout = useMemo(() => parseMenuLayout(settings.menu_layout), [settings.menu_layout]);
  const savedItems = useMemo(() => editorItemsFrom(defaultMenu, savedLayout), [defaultMenu, savedLayout]);
  const defaultItems = useMemo(() => editorItemsFrom(defaultMenu, null), [defaultMenu]);

  // null: nothing edited yet, so the rows follow the saved menu.
  const [draft, setDraft] = useState<EditorItem[] | null>(null);
  const items = draft ?? savedItems;
  const dirty = draft !== null && !sameLayout(draft, savedItems);
  const isCustom = savedLayout !== null;
  const changes = dirty ? countChanges(items, savedItems) : { moved: 0, icons: 0 };

  const [open, setOpen] = useState<Record<number, boolean>>({});
  const [pickerFor, setPickerFor] = useState<EditorItem | null>(null);
  const [iconQuery, setIconQuery] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  const storeResponse = (response: MenuLayoutResponse) => {
    updateSettings({
      menu_layout: response.layout
        ? { items: response.layout.items, updated_at: response.updated_at, updated_by: response.updated_by }
        : null,
    });
    setDraft(null);
  };

  const save = useApiMutation<MenuLayoutResponse, { items: MenuLayoutItem[] }>({
    url: "/menu-layout",
    method: "PUT",
    successMessage: "menu_layout.saved",
    onSuccess: storeResponse,
  });
  const reset = useApiMutation<MenuLayoutResponse>({
    url: "/menu-layout",
    method: "DELETE",
    successMessage: "menu_layout.reset_done",
    onSuccess: storeResponse,
  });
  const pending = save.isPending || reset.isPending;

  const sensors = useSensors(
    // A few pixels of movement before a drag starts, so a tap on the handle is not a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const titleOf = (id: UniqueIdentifier): string => {
    const key = String(id);
    for (const item of items) {
      if (topId(item.id) === key) return item.title;
      const sub = item.children.find((entry) => subId(item.id, entry.url) === key);
      if (sub) return sub.title;
    }
    return "";
  };
  const positionOf = (id: UniqueIdentifier): { position: number; total: number } => {
    const key = String(id);
    const top = items.findIndex((item) => topId(item.id) === key);
    if (top !== -1) return { position: top + 1, total: items.length };
    for (const item of items) {
      const at = item.children.findIndex((entry) => subId(item.id, entry.url) === key);
      if (at !== -1) return { position: at + 1, total: item.children.length };
    }
    return { position: 0, total: 0 };
  };

  const announcements: Announcements = {
    onDragStart: ({ active }) => t("menu_layout.dnd.picked", { name: titleOf(active.id) }),
    onDragOver: ({ active, over }) =>
      over ? t("menu_layout.dnd.moved", { name: titleOf(active.id), ...positionOf(over.id) }) : undefined,
    onDragEnd: ({ active, over }) =>
      over ? t("menu_layout.dnd.dropped", { name: titleOf(active.id), ...positionOf(over.id) }) : undefined,
    onDragCancel: ({ active }) => t("menu_layout.dnd.cancelled", { name: titleOf(active.id) }),
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = active.data.current?.container;
    const to = over.data.current?.container;
    // Sub-items stay inside their own group; top-level items stay at the top level.
    if (from !== to) return;

    if (from === TOP) {
      const oldIndex = items.findIndex((item) => topId(item.id) === active.id);
      const newIndex = items.findIndex((item) => topId(item.id) === over.id);
      if (oldIndex !== -1 && newIndex !== -1) setDraft(arrayMove(items, oldIndex, newIndex));
      return;
    }

    setDraft(
      items.map((item) => {
        if (String(item.id) !== from) return item;
        const oldIndex = item.children.findIndex((sub) => subId(item.id, sub.url) === active.id);
        const newIndex = item.children.findIndex((sub) => subId(item.id, sub.url) === over.id);
        if (oldIndex === -1 || newIndex === -1) return item;
        return { ...item, children: arrayMove(item.children, oldIndex, newIndex) };
      }),
    );
  };

  const pickIcon = (icon: MenuIconName | null) => {
    if (!pickerFor) return;
    setDraft(items.map((item) => (item.id === pickerFor.id ? { ...item, icon } : item)));
    setPickerFor(null);
  };

  const filteredIcons = useMemo(() => {
    const query = iconQuery.trim().toLowerCase();
    return query ? MENU_ICON_NAMES.filter((name) => name.replace(/-/g, " ").includes(query) || name.includes(query)) : MENU_ICON_NAMES;
  }, [iconQuery]);

  if (!canEdit) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">{t("menu_layout.no_access")}</p>
      </Card>
    );
  }

  const savedAt = savedLayout?.updated_at ? new Date(savedLayout.updated_at) : null;
  const savedAtText =
    savedAt && !Number.isNaN(savedAt.getTime())
      ? savedAt.toLocaleString(i18n.language === "bn" ? "bn-BD" : "en-GB", { dateStyle: "medium", timeStyle: "short" })
      : "";

  return (
    // -m-4 p-4 takes over the page area's 16px padding, so the button bar below can reach its edges
    // whichever element scrolls (the page itself in fixed table layout, the page area in full layout).
    <div className="-m-4 grid gap-4 p-4">
      <header className="grid gap-1">
        <h1 className="text-xl font-semibold">{t("menu_layout.title")}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          {t(isReseller ? "menu_layout.description_reseller" : "menu_layout.description")}
        </p>
      </header>

      <Card className="flex min-h-12 flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2.5" aria-live="polite">
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            isCustom ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
          )}
        >
          {t(isCustom ? "menu_layout.status.custom" : "menu_layout.status.default")}
        </span>
        {/* The saved time is formatted in the viewer's time zone, which the server may not share. */}
        <span className="text-sm text-muted-foreground" suppressHydrationWarning>
          {isCustom
            ? t("menu_layout.status.saved_by", { name: savedLayout?.updated_by ?? "—", date: savedAtText })
            : t("menu_layout.status.default_hint")}
        </span>
        {/* Always rendered so the line keeps its height when the pill comes and goes. */}
        <span
          className={cn(
            "theme-badge-warning ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold",
            !dirty && "invisible",
          )}
        >
          {t("menu_layout.status.unsaved")}
        </span>
      </Card>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b px-4 py-3">
            <h2 className="text-base font-semibold">{t("menu_layout.items_title")}</h2>
            <span className="text-xs text-muted-foreground">{t("menu_layout.items_hint")}</span>
          </div>

          <DndContext
            id={dndId}
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            accessibility={{ announcements, screenReaderInstructions: { draggable: t("menu_layout.dnd.instructions") } }}
          >
            <SortableContext items={items.map((item) => topId(item.id))} strategy={verticalListSortingStrategy}>
              <ol className="grid gap-1 p-2">
                {items.map((item) => {
                  const Icon = menuIcon(item.icon, item.defaultIcon);
                  const expanded = !!open[item.id];
                  const hasChildren = item.children.length > 0;
                  return (
                    <SortableRow key={item.id} id={topId(item.id)} container={TOP} label={t("menu_layout.move", { name: item.title })}>
                      {(handle) => (
                        <>
                          <div className="flex min-h-11 items-center gap-2 rounded-lg bg-card py-1 pl-1 pr-2 hover:bg-muted/60">
                            {handle}
                            <button
                              type="button"
                              onClick={() => {
                                setIconQuery("");
                                setPickerFor(item);
                              }}
                              aria-label={t("menu_layout.change_icon", { name: item.title })}
                              title={t("menu_layout.change_icon", { name: item.title })}
                              className="grid size-9 shrink-0 place-items-center rounded-lg border border-dashed bg-card hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <Icon className="size-[18px]" aria-hidden="true" />
                            </button>
                            <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.title}</span>
                            {item.icon && item.icon !== null && (
                              <span className="hidden rounded-full bg-primary/15 px-2 py-0.5 text-[0.7rem] font-semibold text-primary sm:inline">
                                {t("menu_layout.icon_changed")}
                              </span>
                            )}
                            {hasChildren && (
                              <>
                                <span className="whitespace-nowrap text-xs text-muted-foreground">
                                  {t("menu_layout.sub_count", { count: item.children.length })}
                                </span>
                                <button
                                  type="button"
                                  aria-expanded={expanded}
                                  aria-label={t(expanded ? "menu_layout.hide_sub" : "menu_layout.show_sub", { name: item.title })}
                                  onClick={() => setOpen((current) => ({ ...current, [item.id]: !expanded }))}
                                  className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                  <ChevronRight className={cn("size-4 transition-transform", expanded && "rotate-90")} aria-hidden="true" />
                                </button>
                              </>
                            )}
                          </div>
                          {hasChildren && expanded && (
                            <SortableContext
                              items={item.children.map((sub) => subId(item.id, sub.url))}
                              strategy={verticalListSortingStrategy}
                            >
                              <ol className="my-1 ml-12 grid gap-0.5 border-l-2 pl-2.5">
                                {item.children.map((sub) => (
                                  <SortableRow
                                    key={sub.url}
                                    id={subId(item.id, sub.url)}
                                    container={String(item.id)}
                                    label={t("menu_layout.move_in", { name: sub.title, group: item.title })}
                                  >
                                    {(subHandle) => (
                                      <div className="flex min-h-9 items-center gap-2 rounded-md bg-card pr-2 hover:bg-muted/60">
                                        {subHandle}
                                        <span className="min-w-0 flex-1 truncate text-sm">{sub.title}</span>
                                      </div>
                                    )}
                                  </SortableRow>
                                ))}
                              </ol>
                            </SortableContext>
                          )}
                        </>
                      )}
                    </SortableRow>
                  );
                })}
              </ol>
            </SortableContext>
          </DndContext>

          <p className="flex flex-wrap gap-x-4 gap-y-1 px-4 pb-4 text-xs text-muted-foreground">
            <span>{t("menu_layout.keyboard_hint")}</span>
            <span>{t("menu_layout.icon_hint")}</span>
          </p>
        </Card>

        <Card className="min-w-0 lg:sticky lg:top-4" aria-label={t("menu_layout.preview_title")}>
          <div className="flex items-baseline justify-between gap-2 border-b px-4 py-3">
            <h2 className="text-base font-semibold">{t("menu_layout.preview_title")}</h2>
            <span className="text-xs text-muted-foreground">{t("menu_layout.preview_hint")}</span>
          </div>
          <nav className="max-h-[70vh] overflow-y-auto bg-sidebar p-2 text-sidebar-foreground" aria-hidden="true">
            {items.map((item, index) => {
              const Icon = menuIcon(item.icon, item.defaultIcon);
              return (
                <div key={item.id}>
                  <div
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                      index === 0 && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{item.title}</span>
                    {item.children.length > 0 && <ChevronRight className="size-3.5 opacity-60" />}
                  </div>
                  {open[item.id] && item.children.length > 0 && (
                    <div className="mb-1 ml-4 border-l border-sidebar-border pl-2.5">
                      {item.children.map((sub) => (
                        <div key={sub.url} className="truncate px-2 py-1 text-[0.8rem] opacity-80">
                          {sub.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </Card>
      </div>

      {/* Flush with the window's sides and bottom: -mx-4/-mb-4 cover the padding, -bottom-4 pins it past the scroll padding. */}
      <div className="sticky -bottom-4 z-10 -mx-4 -mb-4 flex flex-wrap items-center justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur">
        <span className="mr-auto text-sm text-muted-foreground">
          {dirty
            ? [
                changes.moved ? t("menu_layout.changes.moved", { count: changes.moved }) : null,
                changes.icons ? t("menu_layout.changes.icons", { count: changes.icons }) : null,
              ]
                .filter(Boolean)
                .join(" · ")
            : t("menu_layout.changes.none")}
        </span>
        <MyButton
          type="button"
          action="reset"
          variant="outline"
          size="default"
          disabled={pending || (!isCustom && sameLayout(items, defaultItems))}
          onClick={() => setConfirmReset(true)}
          title={t("menu_layout.actions.reset")}
        />
        <MyButton
          type="button"
          action="cancel"
          variant="outline"
          size="default"
          disabled={pending || !dirty}
          onClick={() => setDraft(null)}
          title={t("menu_layout.actions.discard")}
        />
        <MyButton
          type="button"
          action="save"
          size="default"
          loading={save.isPending}
          disabled={pending || !dirty}
          onClick={() => save.mutate({ items: withHiddenItems(layoutItemsFrom(items), savedLayout) })}
          title={t("menu_layout.actions.save")}
        />
      </div>

      <MyDialog
        open={pickerFor !== null}
        onOpenChange={(next) => !next && setPickerFor(null)}
        title={t("menu_layout.icon_picker.title", { name: pickerFor?.title ?? "" })}
        size="xl"
        showFooter={false}
      >
        <div className="grid gap-3">
          <Input
            type="search"
            value={iconQuery}
            onChange={(event) => setIconQuery(event.target.value)}
            placeholder={t("menu_layout.icon_picker.search")}
            aria-label={t("menu_layout.icon_picker.search")}
            autoComplete="off"
          />
          <div
            className="grid max-h-[50vh] grid-cols-[repeat(auto-fill,minmax(5.25rem,1fr))] content-start gap-1.5 overflow-y-auto"
            role="group"
            aria-label={t("menu_layout.icon_picker.title", { name: pickerFor?.title ?? "" })}
          >
            {filteredIcons.length === 0 ? (
              <p className="col-span-full py-2 text-sm text-muted-foreground">
                {t("menu_layout.icon_picker.empty", { query: iconQuery })}
              </p>
            ) : (
              filteredIcons.map((name) => {
                const Icon = MENU_ICONS[name];
                const selected = pickerFor?.icon === name;
                return (
                  <button
                    key={name}
                    type="button"
                    aria-pressed={selected}
                    title={name}
                    onClick={() => pickIcon(name)}
                    className={cn(
                      "grid justify-items-center gap-1 rounded-lg border bg-card px-1 pb-2 pt-2.5 text-[0.7rem] text-muted-foreground hover:border-primary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selected && "border-primary bg-primary/10 font-semibold text-primary",
                    )}
                  >
                    <Icon className="size-5 text-foreground" aria-hidden="true" />
                    <span className="max-w-full truncate">{name.replace(/-/g, " ")}</span>
                  </button>
                );
              })
            )}
          </div>
          <div className="flex items-center justify-between gap-2 border-t pt-3">
            <MyButton type="button" variant="ghost" size="sm" icon={false} onClick={() => pickIcon(null)}>
              {t("menu_layout.icon_picker.use_default")}
            </MyButton>
            <span className="text-xs text-muted-foreground">
              {t("menu_layout.icon_picker.count", { count: filteredIcons.length })}
            </span>
          </div>
        </div>
      </MyDialog>

      <MyDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title={t("menu_layout.reset_confirm.title")}
        description={t(isReseller ? "menu_layout.reset_confirm.description_reseller" : "menu_layout.reset_confirm.description")}
        confirmText={t("menu_layout.reset_confirm.confirm")}
        loading={reset.isPending}
        onConfirm={async () => {
          if (isCustom) {
            await reset.mutateAsync(undefined);
          } else {
            setDraft(null);
          }
        }}
      />
    </div>
  );
}
