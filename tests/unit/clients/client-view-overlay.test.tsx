import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MyDialog } from "@/components/my-dialog";
import ClientViewOverlay, { OVERLAY_EXIT_MS } from "@/components/clients/view-mode/client-view-overlay";
import { getClientViewOpening, setClientViewOpening } from "@/components/clients/view-mode/client-view-overlay-history";

const useFetch = vi.hoisted(() => vi.fn());

vi.mock("@/app/actions", () => ({ useFetch }));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string, values?: { current?: number; total?: number }) =>
            values?.total ? `${values.current} of ${values.total}` : key,
    }),
}));

// The view itself is covered by its own tests; here it stands in with one real dialog (like Pay),
// to check that dialogs opened from the view stack on top of the modal / drawer.
vi.mock("@/components/clients/client-view", () => ({
    default: function FakeClientView({ clientId }: { clientId: string }) {
        const [payOpen, setPayOpen] = useState(false);
        return (
            <div>
                <p>view of {clientId}</p>
                <button type="button" onClick={() => setPayOpen(true)}>client.actions.pay</button>
                <MyDialog open={payOpen} onOpenChange={setPayOpen} title="invoice.pay_title">
                    <p>pay dialog body</p>
                </MyDialog>
            </div>
        );
    },
}));

const LIST = ["c-1", "c-2", "c-3"].map((id) => ({ id, name: `Client ${id}`, pppoe_username: `${id}-ppp`, status: 1 }));

function setup({ clientId = "c-2", mode = "modal" as "modal" | "drawer", withList = true } = {}) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    if (withList) {
        queryClient.setQueryData(["clients", { page: 1 }], { success: true, data: { data: LIST, pagination: {} } });
    }
    const props = { onClose: vi.fn(), onNavigate: vi.fn(), onOpenFullPage: vi.fn() };
    render(
        <QueryClientProvider client={queryClient}>
            <ClientViewOverlay clientId={clientId} mode={mode} {...props} />
        </QueryClientProvider>,
    );
    return props;
}

describe("ClientViewOverlay", () => {
    beforeEach(() => {
        useFetch.mockReset();
        useFetch.mockImplementation(async ({ url }: { url: string }) => {
            const id = url.split("/")[2];
            return { success: true, data: { id, name: `Client ${id}`, pppoe_username: `${id}-ppp`, status: 1 } };
        });
    });

    // মডাল ও ড্রয়ার দুটোই ডায়ালগ হিসেবে খোলে এবং উপরের বারে নাম, Client ID ও তালিকায় অবস্থান দেখায় কি না যাচাই করি।
    it.each(["modal", "drawer"] as const)(
        "Client view overlay (%s): opens as a dialog with the name, Client ID and place in the list",
        async (mode) => {
            setup({ mode });

            const dialog = screen.getByRole("dialog");
            expect(dialog).toHaveAttribute("data-client-view-overlay", mode);
            expect(await screen.findByRole("heading", { name: "Client c-2" })).toBeInTheDocument();
            expect(screen.getByText("c-2-ppp · 2 of 3")).toBeInTheDocument();
            expect(screen.getByText("view of c-2")).toBeInTheDocument();
        },
    );

    // আগের/পরের বোতাম তালিকার ক্রম অনুযায়ী পাশের ক্লায়েন্টে যায় এবং প্রথম ক্লায়েন্টে "আগের" বন্ধ থাকে কি না যাচাই করি।
    it("Client view overlay: Previous and Next follow the list order and Previous is off on the first client", async () => {
        const middle = setup({ clientId: "c-2" });
        fireEvent.click(screen.getByRole("button", { name: "client.view_overlay.next" }));
        fireEvent.click(screen.getByRole("button", { name: "client.view_overlay.previous" }));
        expect(middle.onNavigate.mock.calls).toEqual([["c-3"], ["c-1"]]);
    });

    // তালিকার প্রথম ক্লায়েন্টে "আগের" বোতাম নিষ্ক্রিয় থাকে কি না যাচাই করি।
    it("Client view overlay: Previous is disabled on the first client of the list", () => {
        setup({ clientId: "c-1" });
        expect(screen.getByRole("button", { name: "client.view_overlay.previous" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "client.view_overlay.next" })).toBeEnabled();
    });

    // ক্লায়েন্ট তালিকা থেকে না খুললে (যেমন ইনভয়েস থেকে) আগের/পরের বোতাম লুকানো থাকে কি না যাচাই করি।
    it("Client view overlay: hides Previous and Next when the client was not opened from a client list", () => {
        setup({ withList: false });
        expect(screen.queryByRole("button", { name: "client.view_overlay.next" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "client.view_overlay.previous" })).not.toBeInTheDocument();
    });

    // বন্ধ বোতাম ও Esc দিয়ে বন্ধ হয়, আর "পুরো পেজে খুলুন" পুরো পেজে নেয় কি না যাচাই করি।
    it("Client view overlay: Close, Esc and Open full page call their actions", async () => {
        const user = userEvent.setup();
        const props = setup();

        await user.click(screen.getByRole("button", { name: "client.view_overlay.open_full_page" }));
        expect(props.onOpenFullPage).toHaveBeenCalledTimes(1);

        await user.click(screen.getByRole("button", { name: "client.view_overlay.close" }));
        await user.keyboard("{Escape}");
        expect(props.onClose).toHaveBeenCalledTimes(2);
    });

    // ভিউ থেকে খোলা ডায়ালগ (যেমন Pay) মডালের উপরে খোলে, আর Esc শুধু সেই ডায়ালগ বন্ধ করে, মডাল খোলা থাকে কি না যাচাই করি।
    it.each(["modal", "drawer"] as const)(
        "Client view overlay (%s): a dialog opened from the view stacks on top, and Esc closes only that dialog",
        async (mode) => {
            const user = userEvent.setup();
            const props = setup({ mode });

            await user.click(screen.getByRole("button", { name: "client.actions.pay" }));
            expect(await screen.findByText("pay dialog body")).toBeInTheDocument();
            // The modal / drawer underneath is hidden from assistive tech while the top dialog is open.
            expect(screen.getAllByRole("dialog", { hidden: true })).toHaveLength(2);

            await user.keyboard("{Escape}");

            await waitFor(() => expect(screen.queryByText("pay dialog body")).not.toBeInTheDocument());
            expect(props.onClose).not.toHaveBeenCalled();
            expect(screen.getByText("view of c-2")).toBeInTheDocument();
        },
    );

    // ক্লায়েন্টের তথ্য লোড হওয়ার সময় শিরোনাম-বারের নিচে লোডিং লাইন দেখায় এবং লোড শেষ হলে সরে যায় কি না যাচাই করি।
    it("Client view overlay: shows the loading line under the title bar while the client loads, then removes it", async () => {
        let finish: (value: unknown) => void = () => undefined;
        useFetch.mockImplementation(
            () =>
                new Promise((resolve) => {
                    finish = resolve;
                }),
        );
        setup({ clientId: "c-2" });

        expect(await screen.findByRole("progressbar", { name: "common.loading" })).toBeInTheDocument();
        // The list row is shown meanwhile, so the title is already the client's name.
        expect(screen.getByRole("heading", { name: "Client c-2" })).toBeInTheDocument();

        finish({ success: true, data: { id: "c-2", name: "Client c-2", pppoe_username: "c-2-ppp", status: 1 } });

        await waitFor(() => expect(screen.queryByRole("progressbar")).not.toBeInTheDocument());
    });

    // মডাল/ড্রয়ার পর্দায় এলে "opening" অবস্থা শেষ হয়, ফলে চোখের আইকনের স্পিনার থামে কি না যাচাই করি।
    it("Client view overlay: once shown, it ends the opening state that drives the eye icon's spinner", async () => {
        setClientViewOpening("c-2");
        setup({ clientId: "c-2" });

        await waitFor(() => expect(getClientViewOpening()).toBeNull());
    });

    // বন্ধ অবস্থায় (open=false) অ্যানিমেশনের সময় পেরোলে onExited ডাকা হয়, খোলা অবস্থায় ডাকা হয় না কি না যাচাই করি।
    it("Client view overlay: when closing, reports the end of its exit animation; never while open", async () => {
        const onExited = vi.fn();
        const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        const overlay = (open: boolean) => (
            <QueryClientProvider client={queryClient}>
                <ClientViewOverlay
                    clientId="c-2"
                    mode="drawer"
                    open={open}
                    onExited={onExited}
                    onClose={vi.fn()}
                    onNavigate={vi.fn()}
                    onOpenFullPage={vi.fn()}
                />
            </QueryClientProvider>
        );
        const view = render(overlay(true));
        await screen.findByText("view of c-2");
        await new Promise((resolve) => setTimeout(resolve, OVERLAY_EXIT_MS + 50));
        expect(onExited).not.toHaveBeenCalled();

        view.rerender(overlay(false));

        await waitFor(() => expect(onExited).toHaveBeenCalledTimes(1));
    });
});

