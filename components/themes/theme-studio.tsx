"use client";

import { DeleteModal } from "@/components/delete-modal";
import MyButton from "@/components/my-button";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useThemeSettings } from "@/context/theme-data-provider";
import { useTheme } from "@/context/theme-provider";
import { apiErrorText } from "@/lib/helper/helper";
import { cn } from "@/lib/utils";
import type { ThemeMode } from "@/types/theme-types";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Loader2, Lock, Monitor, Moon, Palette, Sun, Users } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  activateThemeRequest,
  recordSettings,
  THEMES_QUERY_KEY,
  useThemes,
  type SavedTheme,
} from "@/components/themes/theme-api";
import { ThemeBuilder, type ThemeDraft } from "@/components/themes/theme-builder";
import { ThemePreview } from "@/components/themes/theme-preview";

type BuilderState = { key: number; draft: ThemeDraft; editingId: string | null };

/**
 * The staff theme screen, opened from the existing theme customizer button and the
 * "Theme settings" menu item. It covers the whole window like a page: the theme
 * library on the left, the builder or the current theme on the right.
 */
export function ThemeStudio({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { settings, applyTheme } = useThemeSettings();
  const { theme: mode, setTheme: setMode, resolvedTheme } = useTheme();
  const { data, isLoading } = useThemes(open);
  const [builder, setBuilder] = useState<BuilderState | null>(null);

  const themes = data?.data?.themes ?? [];
  const activeId = data?.data?.active_theme_id ?? settings.themeId;
  const systemThemes = themes.filter((theme) => theme.is_system);
  const myThemes = themes.filter((theme) => theme.is_mine);
  const sharedThemes = themes.filter((theme) => !theme.is_system && !theme.is_mine);
  const activeTheme = themes.find((theme) => theme.id === activeId) ?? null;

  const { mutate: activate, isPending: activating, variables: activatingId } = useMutation({
    mutationFn: (id: string) => activateThemeRequest(id),
    onSuccess: (theme) => {
      applyTheme(recordSettings(theme.settings), theme.id);
      void queryClient.invalidateQueries({ queryKey: [THEMES_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(apiErrorText(error, t, "themes.activate_failed"));
    },
  });

  const openBuilder = (draft: ThemeDraft, editingId: string | null = null) =>
    setBuilder({ key: Date.now(), draft, editingId });

  const createTheme = () => {
    const start = (activeTheme?.is_system ? activeTheme : null) ?? systemThemes[0];
    if (!start) return;
    openBuilder({ name: "", visibility: "private", startId: start.id, settings: recordSettings(start.settings) });
  };

  const copyTheme = (theme: SavedTheme) =>
    openBuilder({
      name: t("themes.copy_name", { name: theme.name }).slice(0, 40),
      visibility: "private",
      startId: theme.is_system ? theme.id : null,
      settings: recordSettings(theme.settings),
    });

  const editTheme = (theme: SavedTheme) =>
    openBuilder(
      { name: theme.name, visibility: theme.visibility, startId: null, settings: recordSettings(theme.settings) },
      theme.id,
    );

  const handleSaved = (theme: SavedTheme, created: boolean) => {
    setBuilder(null);
    if (created || theme.id === activeId) {
      activate(theme.id);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) setBuilder(null);
    onOpenChange(next);
  };

  const row = (theme: SavedTheme) => {
    const active = theme.id === activeId;
    const pending = activating && activatingId === theme.id;
    return (
      <li key={theme.id} className={cn("flex items-center gap-1 rounded-lg border bg-card pr-1", active && "border-primary ring-1 ring-primary")}>
        <button
          type="button"
          onClick={() => activate(theme.id)}
          disabled={activating}
          aria-pressed={active}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-l-lg p-2 text-left hover:bg-accent/40 disabled:cursor-wait"
        >
          <span className="block h-9 w-14 shrink-0 overflow-hidden rounded-md border">
            <ThemePreview settings={theme.settings} dark={resolvedTheme === "dark"} variant="card" />
          </span>
          <span className="grid min-w-0 flex-1">
            <span className="truncate text-sm font-medium">{theme.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {theme.is_system
                ? t("themes.isptik")
                : theme.is_mine
                  ? t(`themes.visibility.${theme.visibility}`)
                  : t("themes.shared_by", { name: theme.owner_name ?? "" })}
            </span>
          </span>
          <span className="grid size-5 shrink-0 place-items-center">
            {pending ? (
              <Loader2 className="size-4 animate-spin text-muted-foreground" />
            ) : active ? (
              <Check className="size-4 text-primary" aria-label={t("themes.in_use")} />
            ) : null}
          </span>
        </button>
        {theme.is_mine && (
          <MyButton
            action="edit"
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            tooltip={t("themes.edit")}
            aria-label={`${t("themes.edit")} ${theme.name}`}
            onClick={() => editTheme(theme)}
          />
        )}
        <MyButton
          variant="ghost"
          size="icon"
          icon={false}
          className="size-8 shrink-0"
          tooltip={t("themes.copy")}
          aria-label={`${t("themes.copy")} ${theme.name}`}
          onClick={() => copyTheme(theme)}
        >
          <Copy className="size-4" />
        </MyButton>
        {theme.is_mine && (
          <DeleteModal
            api_url={`/themes/${theme.id}`}
            keys={THEMES_QUERY_KEY}
            message="themes.deleted"
            confirmMessage="themes.delete_confirm"
            tooltip={t("common.delete")}
          />
        )}
      </li>
    );
  };

  const group = (title: string, icon: ReactNode, list: SavedTheme[], empty?: string) => (
    <section className="grid gap-2" aria-label={title}>
      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </h3>
      {list.length > 0 ? (
        <ul className="grid gap-2">{list.map(row)}</ul>
      ) : (
        empty && <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">{empty}</p>
      )}
    </section>
  );

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          className="fixed inset-0 z-50 flex h-dvh w-screen flex-col bg-background text-foreground outline-none"
          aria-describedby="theme-studio-description"
        >
          <header className="flex flex-wrap items-center gap-3 border-b px-4 py-3 sm:px-6">
            <Palette className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <DialogPrimitive.Title className="text-lg font-semibold leading-tight">{t("themes.title")}</DialogPrimitive.Title>
              <DialogPrimitive.Description id="theme-studio-description" className="truncate text-sm text-muted-foreground">
                {t("themes.description")}
              </DialogPrimitive.Description>
            </div>
            <ToggleGroup
              type="single"
              value={mode}
              onValueChange={(value) => value && setMode(value as ThemeMode)}
              className="gap-1"
              aria-label={t("theme_customizer.mode.label")}
            >
              {([["light", Sun], ["dark", Moon], ["system", Monitor]] as const).map(([value, Icon]) => (
                <ToggleGroupItem key={value} value={value} variant={mode === value ? "default" : "outline"} className="h-8 px-2.5 text-xs">
                  <Icon className="size-3.5" />
                  <span className="hidden sm:inline">{t(`theme_customizer.mode.${value}`)}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <DialogPrimitive.Close asChild>
              <MyButton action="cancel" variant="outline" size="icon" className="size-8" aria-label={t("themes.close")} tooltip={t("themes.close")} />
            </DialogPrimitive.Close>
          </header>

          <div className="grid min-h-0 flex-1 lg:grid-cols-[22rem_minmax(0,1fr)]">
            <nav
              aria-label={t("themes.library")}
              className={cn("min-h-0 overflow-y-auto border-r p-4 sm:p-5", builder && "hidden lg:block")}
            >
              <div className="grid gap-5">
                <MyButton action="create" size="default" className="w-full" onClick={createTheme} disabled={isLoading} title={t("themes.create")} />
                {isLoading ? (
                  <div className="grid gap-2" aria-busy="true">
                    {Array.from({ length: 6 }, (_, index) => (
                      <Skeleton key={index} className="h-[3.25rem] w-full rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <>
                    {group(t("themes.groups.isptik"), <Lock className="size-3" />, systemThemes)}
                    {group(t("themes.groups.mine"), <Palette className="size-3" />, myThemes, t("themes.groups.mine_empty"))}
                    {sharedThemes.length > 0 && group(t("themes.groups.shared"), <Users className="size-3" />, sharedThemes)}
                  </>
                )}
              </div>
            </nav>

            <main className={cn("min-h-0 overflow-y-auto p-4 sm:p-6", !builder && "hidden lg:block")}>
              {builder ? (
                <div className="mx-auto grid max-w-6xl gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base font-semibold">
                      {t(builder.editingId ? "themes.builder.edit_title" : "themes.builder.create_title")}
                    </h2>
                    <MyButton
                      action="cancel"
                      variant="ghost"
                      size="icon"
                      className="size-8 lg:hidden"
                      aria-label={t("common.cancel")}
                      onClick={() => setBuilder(null)}
                    />
                  </div>
                  <ThemeBuilder
                    key={builder.key}
                    systemThemes={systemThemes}
                    initial={builder.draft}
                    editingId={builder.editingId}
                    onCancel={() => setBuilder(null)}
                    onSaved={handleSaved}
                  />
                </div>
              ) : (
                <div className="mx-auto grid max-w-4xl gap-4">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("themes.in_use")}</p>
                      <h2 className="truncate text-xl font-semibold">{activeTheme?.name ?? t("themes.device_settings")}</h2>
                    </div>
                    {activeTheme && (
                      <div className="flex gap-2">
                        {activeTheme.is_mine && (
                          <MyButton action="edit" variant="outline" size="default" onClick={() => editTheme(activeTheme)} title={t("themes.edit")} />
                        )}
                        <MyButton variant="outline" size="default" icon={false} onClick={() => copyTheme(activeTheme)}>
                          <Copy className="size-4" /> {t("themes.copy")}
                        </MyButton>
                      </div>
                    )}
                  </div>
                  <ThemePreview
                    settings={activeTheme ? activeTheme.settings : recordSettings(settings)}
                    dark={resolvedTheme === "dark"}
                  />
                  <p className="text-sm text-muted-foreground">{t("themes.overview_hint")}</p>
                </div>
              )}
            </main>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
