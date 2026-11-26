import type { SettingOption } from "@/components/settings/registry/define";

/**
 * How a "view client" link opens the client view (company setting `client_view_open_mode`).
 * - modal / drawer: over the current page, with `?view_client={id}` in the URL
 * - page: the full page in this tab (the default)
 * - new_tab: the full page in a new browser tab
 */
export const CLIENT_VIEW_MODES = ["modal", "drawer", "page", "new_tab"] as const;
export type ClientViewMode = (typeof CLIENT_VIEW_MODES)[number];

export const CLIENT_VIEW_MODE_KEY = "client_view_open_mode";
/** The on/off setting this replaced; read only until the API migration has copied it. */
export const LEGACY_CLIENT_VIEW_NEW_TAB_KEY = "client_view_open_on_new_tab";
export const DEFAULT_CLIENT_VIEW_MODE: ClientViewMode = "page";

/** Query parameter that opens the client view as a modal or drawer over the current page. */
export const CLIENT_VIEW_PARAM = "view_client";

export const CLIENT_VIEW_MODE_OPTIONS: SettingOption[] = CLIENT_VIEW_MODES.map((mode) => ({
    value: mode,
    label: `settings.options.client_view_open_mode_${mode}`,
}));

export function isClientViewMode(value: unknown): value is ClientViewMode {
    return typeof value === "string" && (CLIENT_VIEW_MODES as readonly string[]).includes(value);
}

/** The stored mode, or the default for a missing or unknown value. */
export function toClientViewMode(raw: unknown): ClientViewMode {
    return isClientViewMode(raw) ? raw : DEFAULT_CLIENT_VIEW_MODE;
}

function isOn(raw: unknown): boolean {
    return raw === true || raw === 1 || raw === "1" || raw === "true";
}

/** The mode from the settings payload; falls back to the old on/off setting when no mode is saved. */
export function clientViewModeFromSettings(settings: Record<string, unknown> | null | undefined): ClientViewMode {
    const raw = settings?.[CLIENT_VIEW_MODE_KEY];
    if (isClientViewMode(raw)) return raw;
    return isOn(settings?.[LEGACY_CLIENT_VIEW_NEW_TAB_KEY]) ? "new_tab" : DEFAULT_CLIENT_VIEW_MODE;
}

export function isOverlayMode(mode: ClientViewMode): mode is "modal" | "drawer" {
    return mode === "modal" || mode === "drawer";
}

/** The full client view page. */
export function clientViewPageHref(clientId: string): string {
    return `/clients/view/${clientId}`;
}

/** The current URL with the overlay parameter set to `clientId` (or removed when null). */
export function withClientViewParam(pathname: string, search: string, clientId: string | null): string {
    const params = new URLSearchParams(search);
    if (clientId) params.set(CLIENT_VIEW_PARAM, clientId);
    else params.delete(CLIENT_VIEW_PARAM);
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
}
