import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResellerSettingsDialog } from "@/components/resellers/reseller-settings-dialog";
import { getSectionFieldKeys } from "@/components/settings/settings-form-schema";

class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);

const state = vi.hoisted(() => ({
    fetch: vi.fn(async (_options?: unknown) => ({ success: true, data: {} })),
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

vi.mock("@/app/actions", () => ({
    useFetch: (options: unknown) => state.fetch(options),
}));

const renderDialog = (name = "North Reseller") => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    return render(
        <QueryClientProvider client={queryClient}>
            <ResellerSettingsDialog
                reseller={{ id: "reseller-1", name }}
                open
                onOpenChange={vi.fn()}
            />
        </QueryClientProvider>,
    );
};

describe("Reseller settings", () => {
    beforeEach(() => {
        state.fetch.mockReset();
        state.fetch.mockResolvedValue({ success: true, data: {} });
    });

    it("removes the termination-date setting from general settings", () => {
        expect(getSectionFieldKeys("general")).not.toContain(
            "auto_inactive_reseller_client_termination_date",
        );
    });

    it("shows the selected reseller and the existing inactive setting", () => {
        renderDialog();

        expect(screen.getByText("reseller.settings.title")).toBeInTheDocument();
        expect(screen.getByText("North Reseller")).toBeInTheDocument();
        expect(
            screen.getByText("settings.fields.auto_inactive_reseller_client_termination_date.label"),
        ).toBeInTheDocument();
        expect(screen.getByText("common.inactive")).toBeInTheDocument();
    });

    it("saves through the existing company settings payload", async () => {
        const user = userEvent.setup();
        renderDialog("East Reseller");

        await waitFor(() => {
            expect(screen.getByRole("switch")).toBeEnabled();
        });
        await user.click(screen.getByRole("switch"));

        expect(state.fetch).toHaveBeenCalledWith(
            expect.objectContaining({
                url: "/company/settings",
                method: "POST",
                data: {
                    reseller_uuid: "reseller-1",
                    settings: {
                        auto_inactive_reseller_client_termination_date: 1,
                    },
                },
            }),
        );
    });
});
