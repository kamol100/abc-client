import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, renderHook, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Row } from "@tanstack/react-table";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ResellerRowActions from "@/components/resellers/reseller-row-actions";
import { ResellerRow } from "@/components/resellers/reseller-type";
import { useStartImpersonation } from "@/hooks/use-start-impersonation";
import type { ImpersonationResponse } from "@/types/app";

const state = vi.hoisted(() => ({
    permissions: ["impersonate.start"] as string[],
    roles: ["Admin"] as string[],
    fetch: vi.fn(),
    updateSession: vi.fn(async () => undefined),
    setImpersonation: vi.fn(),
    saveOriginalToken: vi.fn(),
    setSettings: vi.fn(),
    setProfile: vi.fn(),
    setPermissions: vi.fn(),
    isImpersonating: false,
    sessionToken: "original-token" as string | null,
    assign: vi.fn(),
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (value: string) => value,
        i18n: { language: "en" },
    }),
}));

vi.mock("react-toastify", () => ({
    toast: { error: vi.fn(), success: vi.fn() },
}));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next-auth/react", () => ({
    useSession: () => ({
        data: state.sessionToken ? { token: state.sessionToken } : null,
        update: state.updateSession,
    }),
}));

vi.mock("@/app/actions", () => ({
    useFetch: (...args: unknown[]) => state.fetch(...args),
}));

vi.mock("@/lib/pwa-utils", () => ({
    clearServiceWorkerCaches: vi.fn(),
}));

vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({
        hasPermission: (permission: string) => state.permissions.includes(permission),
        setPermissions: state.setPermissions,
    }),
    useSettings: () => ({
        settings: { roles: state.roles },
        setSettings: state.setSettings,
    }),
    useProfile: () => ({ setProfile: state.setProfile }),
    useImpersonation: () => ({
        impersonation: {
            is_impersonating: state.isImpersonating,
            chain: [],
            original_user_id: null,
        },
        setImpersonation: state.setImpersonation,
        saveOriginalToken: state.saveOriginalToken,
        clearOriginalToken: vi.fn(),
        getOriginalToken: () => null,
    }),
}));

const impersonationResult: ImpersonationResponse = {
    token: "impersonation-token",
    user: {
        id: "user-1",
        name: "North User",
        email: "north@example.com",
        reseller_id: "reseller-1",
        company: { id: "company-1", name: "Acme", logo: "logo.png", favicon: "fav.png" },
    },
    impersonation: {
        is_impersonating: true,
        chain: [1],
        original_user_id: 1,
    },
};

const reseller = {
    id: "reseller-1",
    name: "North Reseller",
    user: { uuid: "user-uuid-1", username: "north" },
} as ResellerRow;

const renderActions = (row: ResellerRow = reseller) => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <ResellerRowActions row={{ original: row } as Row<ResellerRow>} />
        </QueryClientProvider>,
    );
};

const openMenu = async () => {
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    return user;
};

describe("Reseller row switch scope", () => {
    beforeEach(() => {
        state.permissions = ["impersonate.start"];
        state.roles = ["Admin"];
        state.fetch.mockReset();
        state.updateSession.mockClear();
        state.setImpersonation.mockClear();
        state.saveOriginalToken.mockClear();
        state.setSettings.mockClear();
        state.setProfile.mockClear();
        state.setPermissions.mockClear();
        state.isImpersonating = false;
        state.sessionToken = "original-token";
        state.assign.mockReset();
        Object.defineProperty(window, "location", {
            configurable: true,
            value: { assign: state.assign },
        });
    });

    it("switches into the reseller from the row menu", async () => {
        state.fetch.mockResolvedValue({ success: false, message: "Failed to impersonate" });
        renderActions();
        const user = await openMenu();

        await user.click(screen.getByText("reseller.actions.switch_scope"));

        await waitFor(() => {
            expect(state.fetch).toHaveBeenCalledWith({
                url: "/impersonate/user-uuid-1",
                method: "POST",
                data: { reseller_id: "reseller-1" },
            });
        });
    });

    it("hides the switch when the current scope is already a reseller", async () => {
        state.roles = ["Reseller"];
        renderActions();
        await openMenu();

        expect(screen.queryByText("reseller.actions.switch_scope")).not.toBeInTheDocument();
    });

    it("hides the switch without impersonate permission", async () => {
        state.permissions = [];
        renderActions();
        await openMenu();

        expect(screen.queryByText("reseller.actions.switch_scope")).not.toBeInTheDocument();
    });

    it("hides the switch when the reseller has no login user", async () => {
        renderActions({ ...reseller, user: null });
        await openMenu();

        expect(screen.queryByText("reseller.actions.switch_scope")).not.toBeInTheDocument();
    });
});

describe("useStartImpersonation", () => {
    beforeEach(() => {
        state.fetch.mockReset();
        state.updateSession.mockClear();
        state.setImpersonation.mockClear();
        state.saveOriginalToken.mockClear();
        state.isImpersonating = false;
        state.sessionToken = "original-token";
        state.assign.mockReset();
        Object.defineProperty(window, "location", {
            configurable: true,
            value: { assign: state.assign },
        });
    });

    const renderImpersonation = () => {
        const queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
        });

        return renderHook(() => useStartImpersonation(), {
            wrapper: ({ children }) => (
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            ),
        });
    };

    it("saves the original token, refreshes the session, and opens the reseller scope", async () => {
        state.fetch
            .mockResolvedValueOnce({ success: true, data: impersonationResult })
            .mockResolvedValueOnce({
                success: true,
                data: { settings: { roles: ["Reseller"] }, profile: { name: "North User" }, permissions: [] },
            });

        const { result } = renderImpersonation();
        await act(async () => {
            await result.current.impersonate(
                { id: "reseller-1", userUuid: "user-uuid-1" },
                "reseller",
            );
        });

        expect(state.saveOriginalToken).toHaveBeenCalledWith("original-token");
        expect(state.setImpersonation).toHaveBeenCalledWith(impersonationResult.impersonation);
        expect(state.updateSession).toHaveBeenCalledWith({
            token: "impersonation-token",
            user: {
                name: "North User",
                email: "north@example.com",
                reseller_id: "reseller-1",
                logo: "logo.png",
                favicon: "fav.png",
            },
        });
        expect(state.assign).toHaveBeenCalledWith("/");
    });

    it("sends a company id when switching a company", async () => {
        state.fetch.mockResolvedValueOnce({ success: false, message: "Failed to impersonate" });

        const { result } = renderImpersonation();
        await act(async () => {
            await result.current.impersonate({ id: "company-9", userUuid: "owner-uuid" }, "company");
        });

        expect(state.fetch).toHaveBeenCalledWith({
            url: "/impersonate/owner-uuid",
            method: "POST",
            data: { company_id: "company-9" },
        });
        expect(state.assign).not.toHaveBeenCalled();
    });
});
