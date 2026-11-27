import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildMenuConfig, selectMenuItems, type MenuAccess } from "@/hooks/use-menu-items";
import {
    canOpenSettingsPage,
    firstSettingsPath,
    notificationCategoryPermission,
    SETTINGS_PAGES,
    SETTINGS_PERMISSIONS,
} from "@/components/settings/registry/permissions";
import { permittedGroups, SECTIONS } from "@/components/settings/registry/sections";
import { SettingsButton } from "@/components/settings/ui/settings-button";
import { SettingsPanel } from "@/components/settings/ui/settings-panel";

const state = vi.hoisted(() => ({ allowed: new Set<string>() }));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

vi.mock("@/context/app-provider", () => ({
    useSettings: () => ({ settings: {}, updateSettings: vi.fn() }),
    usePermissions: () => ({ hasPermission: (permission: string) => state.allowed.has(permission) }),
}));

vi.mock("@/hooks/use-api-mutation", () => ({
    default: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("@/components/sms-sent/sms-gateway", () => ({
    useSmsGatewayStatus: () => ({ isLoading: false, status: "active" }),
}));

const has = (...permissions: string[]) => {
    const allowed = new Set(permissions);
    return (permission: string) => allowed.has(permission);
};

const menuAccess = (...permissions: string[]): MenuAccess => ({ hasPermission: has(...permissions), isReseller: false });

const settingsMenuUrls = (...permissions: string[]): string[] => {
    const items = selectMenuItems(buildMenuConfig((key) => key), menuAccess(...permissions));
    return items.find((item) => item.id === 31)?.items?.map((sub) => sub.url) ?? [];
};

describe("settings permissions", () => {
    beforeEach(() => {
        state.allowed = new Set();
    });

    // অ্যাপের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «gives every settings menu item its own permission»।
    it("Settings permissions: gives every settings menu item its own permission", () => {
        const permissions = SETTINGS_PAGES.map((page) => page.permission);

        expect(new Set(permissions).size).toBe(SETTINGS_PAGES.length);
        expect(SETTINGS_PAGES.map((page) => page.url)).toEqual([
            "/settings/general",
            "/settings/dashboard",
            "/settings/sms",
            "/settings/map",
            "/settings/monitoring",
            "/settings/olt",
            "/settings/notifications",
            "/settings/invoice-print",
            "/settings/menu",
        ]);
    });

    // অ্যাপের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows only the settings menu items the user has permission for»।
    it("Settings permissions: shows only the settings menu items the user has permission for", () => {
        expect(settingsMenuUrls("company-settings.access", "company-settings.sms", "company-settings.map")).toEqual([
            "/settings/sms",
            "/settings/map",
        ]);
        // The old route permissions alone no longer open any settings page.
        expect(settingsMenuUrls("company-settings.access", "company-settings.edit")).toEqual([]);
        // A page permission needs the settings read permission too; the menu page does not.
        expect(settingsMenuUrls("company-settings.sms")).toEqual([]);
        expect(settingsMenuUrls("menu-layout.edit")).toEqual(["/settings/menu"]);
    });

    // অ্যাপের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «points the plain Settings link to the first page the user may open»।
    it("Settings permissions: points the plain Settings link to the first page the user may open", () => {
        expect(firstSettingsPath(has("company-settings.access", "company-settings.olt"))).toBe("/settings/olt");
        expect(firstSettingsPath(has("company-settings.access", "company-settings.edit"))).toBeNull();
        expect(canOpenSettingsPage(SETTINGS_PERMISSIONS.olt, has("company-settings.olt"))).toBe(false);
    });

    // অ্যাপের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «gives each block of a page with several blocks its own permission»।
    it("Settings permissions: gives each block of a page with several blocks its own permission", () => {
        expect(SECTIONS.general.groups.map((group) => group.permission)).toEqual([
            "company-settings.general.id-prefixes",
            "company-settings.general.clients",
            "company-settings.general.books",
        ]);
        expect(SECTIONS.sms.groups.map((group) => group.permission)).toEqual([
            "company-settings.sms.client-events",
            "company-settings.sms.invoices",
            "company-settings.sms.due-reminders",
        ]);
        expect(notificationCategoryPermission("platform_support")).toBe("company-settings.notifications.platform-support");
        expect(permittedGroups("general", has("company-settings.general.books")).map((group) => group.title)).toEqual([
            "settings.groups.books",
        ]);
    });

    // অ্যাপের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows only the permitted blocks on the general page»।
    it("Settings permissions: shows only the permitted blocks on the general page", () => {
        state.allowed = new Set(["company-settings.access", "company-settings.general", "company-settings.general.clients"]);
        render(<SettingsPanel section="general" />);

        expect(screen.getByText("settings.groups.clients")).toBeInTheDocument();
        expect(screen.queryByText("settings.groups.id_prefixes")).not.toBeInTheDocument();
        expect(screen.queryByText("settings.groups.books")).not.toBeInTheDocument();
    });

    // অ্যাপের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows a no-permission notice on a settings page opened without its permission»।
    it("Settings permissions: shows a no-permission notice on a settings page opened without its permission", () => {
        state.allowed = new Set(["company-settings.access", "company-settings.edit", "company-settings.general.clients"]);
        render(<SettingsPanel section="general" />);

        expect(screen.getByText("settings.common.no_permission")).toBeInTheDocument();
        expect(screen.queryByText("settings.groups.clients")).not.toBeInTheDocument();
    });

    // অ্যাপের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps a list page's own settings behind their block permission in the gear dialog»।
    it("Settings permissions: keeps a list page's own settings behind their block permission in the gear dialog", () => {
        state.allowed = new Set(["company-settings.access"]);
        render(<SettingsPanel section="list_clients" inDialog />);

        // The filter position has no block permission; the client settings do.
        expect(screen.getByText("settings.groups.filter")).toBeInTheDocument();
        expect(screen.queryByText("settings.fields.payment_deadline.label")).not.toBeInTheDocument();
    });

    // অ্যাপের সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «hides the gear button when the user may see none of the section's blocks»।
    it("Settings permissions: hides the gear button when the user may see none of the section's blocks", () => {
        state.allowed = new Set(["company-settings.access"]);
        const { container, rerender } = render(<SettingsButton section="sms" />);
        expect(container).toBeEmptyDOMElement();

        state.allowed = new Set(["company-settings.access", "company-settings.sms.invoices"]);
        rerender(<SettingsButton section="sms" />);
        expect(screen.getByRole("button", { name: "settings.sections.sms.title" })).toBeInTheDocument();
    });
});
