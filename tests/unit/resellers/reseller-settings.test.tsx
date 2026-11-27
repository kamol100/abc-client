import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ResellerSettingsDialog } from "@/components/resellers/reseller-settings-dialog";
import { sectionKeys as getSectionFieldKeys } from "@/components/settings/registry/sections";

class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverMock);
// The dropdown (Radix Select) needs these in jsdom.
Element.prototype.hasPointerCapture = () => false;
Element.prototype.setPointerCapture = () => {};
Element.prototype.releasePointerCapture = () => {};
Element.prototype.scrollIntoView = () => {};

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

    // রিসেলারের তথ্য ও সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «removes the termination-date setting from general settings»।
    it("Reseller settings: removes the termination-date setting from general settings", () => {
        expect(getSectionFieldKeys("general")).not.toContain(
            "auto_inactive_reseller_client_termination_date",
        );
    });

    // রিসেলারের তথ্য ও সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows the selected reseller and the existing inactive setting»।
    it("Reseller settings: shows the selected reseller and the existing inactive setting", () => {
        renderDialog();

        expect(screen.getByText("reseller.settings.title")).toBeInTheDocument();
        expect(screen.getByText("North Reseller")).toBeInTheDocument();
        expect(
            screen.getByText("settings.fields.auto_inactive_reseller_client_termination_date.label"),
        ).toBeInTheDocument();
        expect(screen.getByText("common.inactive")).toBeInTheDocument();
    });

    // রিসেলারের তথ্য ও সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «saves through the existing company settings payload»।
    it("Reseller settings: saves through the existing company settings payload", async () => {
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

    // রিসেলারের তথ্য ও সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows the client auto inactive time and keeps it disabled while the switch is off»।
    it("Reseller settings: shows the client auto inactive time and keeps it disabled while the switch is off", async () => {
        renderDialog();

        expect(screen.getByText("settings.fields.auto_inactive_client_time.label")).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByRole("switch")).toBeEnabled();
        });
        expect(screen.getByRole("combobox")).toBeDisabled();
        expect(screen.getByRole("combobox")).toHaveTextContent("12");
    });

    // রিসেলারের তথ্য ও সেটিংস যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows the saved hour and saves a newly chosen hour for the reseller»।
    it("Reseller settings: shows the saved hour and saves a newly chosen hour for the reseller", async () => {
        state.fetch.mockResolvedValue({
            success: true,
            data: {
                settings: {
                    auto_inactive_reseller_client_termination_date: 1,
                    auto_inactive_client_time: 9,
                },
            },
        });
        const user = userEvent.setup();
        renderDialog();

        await waitFor(() => {
            expect(screen.getByRole("combobox")).toBeEnabled();
        });
        expect(screen.getByRole("combobox")).toHaveTextContent("09");

        await user.click(screen.getByRole("combobox"));
        await user.click(await screen.findByRole("option", { name: "18" }));

        await waitFor(() => {
            expect(state.fetch).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: "/company/settings",
                    method: "POST",
                    data: {
                        reseller_uuid: "reseller-1",
                        settings: { auto_inactive_client_time: 18 },
                    },
                }),
            );
        });
        expect(screen.getByRole("combobox")).toHaveTextContent("18");
    });
});
