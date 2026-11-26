import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { lazy, Suspense, useState, type ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MyDialog } from "@/components/my-dialog";
import ClientViewOverlay from "@/components/clients/view-mode/client-view-overlay";

const useFetch = vi.hoisted(() => vi.fn());
const lazyPart = vi.hoisted(() => ({ resolve: (() => undefined) as () => void, clicked: 0 }));

vi.mock("@/app/actions", () => ({ useFetch }));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

// Stands in for a lazy field such as the Pay dialog's fund dropdown: code that is still downloading
// when the dialog opens and has no Suspense boundary of its own. MyDialog's body boundary must catch it.
const SlowField = lazy(
    () =>
        new Promise<{ default: () => ReactElement }>((resolve) => {
            lazyPart.resolve = () =>
                resolve({
                    default: () => (
                        <button type="button" onClick={() => (lazyPart.clicked += 1)}>
                            fund field
                        </button>
                    ),
                });
        }),
);

vi.mock("@/components/clients/client-view", () => ({
    default: function FakeClientView() {
        const [payOpen, setPayOpen] = useState(false);
        return (
            <div>
                <button type="button" onClick={() => setPayOpen(true)}>client.actions.pay</button>
                <MyDialog open={payOpen} onOpenChange={setPayOpen} title="invoice.pay_title">
                    <SlowField />
                </MyDialog>
            </div>
        );
    },
}));

describe("ClientViewOverlay with a dialog that loads code after it opens", () => {
    beforeEach(() => {
        useFetch.mockReset();
        useFetch.mockResolvedValue({ success: true, data: { id: "c-1", name: "Client c-1", status: 1 } });
        lazyPart.clicked = 0;
    });

    // ভিউয়ের ভিতরের ডায়ালগ (যেমন Pay) খোলার পর তার কোড লোড হলেও ডায়ালগটি উপরের স্তরে থাকে ও ক্লিক করা যায়, মডাল/ড্রয়ার নিজে লুকিয়ে আবার দেখা দেয় না কি না যাচাই করি।
    it("Client view overlay: a dialog that loads code after opening stays on top and clickable", async () => {
        {
            const user = userEvent.setup();
            render(
                <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
                    {/* As in the dashboard layout: the overlay sits under a Suspense boundary. */}
                    <Suspense fallback={null}>
                        <ClientViewOverlay
                            clientId="c-1"
                            mode="modal"
                            onClose={vi.fn()}
                            onNavigate={vi.fn()}
                            onOpenFullPage={vi.fn()}
                        />
                    </Suspense>
                </QueryClientProvider>,
            );

            await user.click(await screen.findByRole("button", { name: "client.actions.pay" }));
            await act(async () => {
                lazyPart.resolve();
            });
            const field = await screen.findByRole("button", { name: "fund field" });

            const overlay = document.querySelector<HTMLElement>("[data-client-view-overlay]");
            const payDialog = field.closest<HTMLElement>('[role="dialog"]');
            await waitFor(() => expect(payDialog?.style.pointerEvents).toBe("auto"));
            expect(overlay?.style.pointerEvents).toBe("none");

            await user.click(field);
            expect(lazyPart.clicked).toBe(1);
        }
    });
});
