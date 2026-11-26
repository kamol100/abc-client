import { act, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ClientViewOverlayHost from "@/components/clients/view-mode/client-view-overlay-host";
import {
    markClientViewOpenedInApp,
    takeClientViewOpenedInApp,
} from "@/components/clients/view-mode/client-view-overlay-history";

const nav = vi.hoisted(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    search: "",
}));
const app = vi.hoisted(() => ({ mode: "modal", allowed: true }));

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: nav.push, replace: nav.replace, back: nav.back }),
    usePathname: () => "/clients",
    useSearchParams: () => new URLSearchParams(nav.search),
}));

vi.mock("@/context/app-provider", () => ({
    useSettings: () => ({ settings: { client_view_open_mode: app.mode } }),
    usePermissions: () => ({ hasPermission: (name: string) => name === "clients.show" && app.allowed }),
}));

// The overlay has its own tests; here it shows what the host passed and exposes its callbacks.
vi.mock("@/components/clients/view-mode/client-view-overlay", () => ({
    default: (props: {
        clientId: string;
        mode: string;
        open: boolean;
        onExited: () => void;
        onClose: () => void;
        onNavigate: (id: string) => void;
        onOpenFullPage: () => void;
    }) => (
        <div data-testid="overlay">
            <span>{`${props.mode}:${props.clientId}`}</span>
            <span>{props.open ? "state:open" : "state:closing"}</span>
            <button type="button" onClick={props.onExited}>exited</button>
            <button type="button" onClick={props.onClose}>close</button>
            <button type="button" onClick={() => props.onNavigate("c-9")}>next</button>
            <button type="button" onClick={props.onOpenFullPage}>full</button>
        </div>
    ),
}));

function openAt(search: string) {
    nav.search = search;
    window.history.replaceState(null, "", `/clients${search}`);
    return render(<ClientViewOverlayHost />);
}

describe("ClientViewOverlayHost", () => {
    let historyBack: ReturnType<typeof vi.spyOn>;
    let replaceState: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        historyBack?.mockRestore();
        replaceState?.mockRestore();
        nav.push.mockReset();
        nav.replace.mockReset();
        nav.back.mockReset();
        app.mode = "modal";
        app.allowed = true;
        takeClientViewOpenedInApp();
    });

    // Spy after openAt() set the URL, so only the host's own history calls are recorded.
    function spyHistory() {
        historyBack = vi.spyOn(window.history, "back").mockImplementation(() => undefined);
        replaceState = vi.spyOn(window.history, "replaceState").mockImplementation(() => undefined);
    }

    // URL-এ view_client না থাকলে কিছুই দেখায় না কি না যাচাই করি।
    it("Client overlay host: shows nothing without view_client in the URL", () => {
        openAt("?page=2");
        expect(screen.queryByTestId("overlay")).not.toBeInTheDocument();
    });

    // সেটিং মডাল বা ড্রয়ার হলে URL-এর ক্লায়েন্টটি সেই মোডে খোলে কি না যাচাই করি।
    it.each(["modal", "drawer"])("Client overlay host: opens the client from the URL as a %s", async (mode) => {
        app.mode = mode;
        openAt("?page=2&view_client=c-1");
        expect(await screen.findByText(`${mode}:c-1`)).toBeInTheDocument();
    });

    // সেটিং একই পেজ বা নতুন ট্যাব হলে শেয়ার করা view_client লিংক পুরো পেজে যায় কি না যাচাই করি।
    it.each(["page", "new_tab"])("Client overlay host: with the setting on %s, a view_client URL opens the full page", async (mode) => {
        app.mode = mode;
        openAt("?view_client=c-1");

        await waitFor(() => expect(nav.replace).toHaveBeenCalledWith("/clients/view/c-1"));
        expect(screen.queryByTestId("overlay")).not.toBeInTheDocument();
    });

    // ক্লায়েন্ট দেখার অনুমতি না থাকলে কিছুই খোলে না কি না যাচাই করি।
    it("Client overlay host: opens nothing without the clients.show permission", () => {
        app.allowed = false;
        openAt("?view_client=c-1");
        expect(screen.queryByTestId("overlay")).not.toBeInTheDocument();
    });

    // অ্যাপের ভিতরে ক্লিক করে খুললে বন্ধ করলে Back হয়, যাতে ইতিহাসে বাড়তি এন্ট্রি না থাকে কি না যাচাই করি।
    it("Client overlay host: closing an overlay opened in the app goes Back", async () => {
        markClientViewOpenedInApp();
        openAt("?page=2&view_client=c-1");
        spyHistory();

        (await screen.findByRole("button", { name: "close" })).click();

        expect(historyBack).toHaveBeenCalledTimes(1);
        expect(replaceState).not.toHaveBeenCalled();
    });

    // পেস্ট করা বা রিফ্রেশ করা লিংকে বন্ধ করলে শুধু view_client মুছে যায়, পেজের অন্য প্যারামিটার থাকে কি না যাচাই করি।
    it("Client overlay host: closing an overlay from a pasted link removes view_client and keeps the page's parameters", async () => {
        openAt("?page=2&view_client=c-1");
        spyHistory();

        (await screen.findByRole("button", { name: "close" })).click();

        expect(historyBack).not.toHaveBeenCalled();
        expect(replaceState).toHaveBeenCalledWith(null, "", "/clients?page=2");
    });

    // আগের/পরের ক্লায়েন্টে যেতে URL replace হয় (Back তখনও মডাল বন্ধ করে), আর "পুরো পেজ" push করে কি না যাচাই করি।
    it("Client overlay host: Previous / Next replace the URL and Open full page pushes the client page", async () => {
        openAt("?page=2&view_client=c-1");
        spyHistory();

        (await screen.findByRole("button", { name: "next" })).click();
        screen.getByRole("button", { name: "full" }).click();

        expect(replaceState).toHaveBeenCalledWith(null, "", "/clients?page=2&view_client=c-9");
        expect(nav.push).toHaveBeenCalledWith("/clients/view/c-1");
    });

    // URL থেকে view_client সরে গেলে (X, ব্যাকড্রপ, Esc বা Back) বন্ধ হওয়ার অ্যানিমেশনের জন্য ওভারলে থাকে, অ্যানিমেশন শেষে সরে যায় কি না যাচাই করি।
    it("Client overlay host: keeps the overlay for its closing animation after view_client leaves the URL, then removes it", async () => {
        const view = openAt("?page=2&view_client=c-1");
        expect(await screen.findByText("state:open")).toBeInTheDocument();

        nav.search = "?page=2";
        view.rerender(<ClientViewOverlayHost />);

        expect(screen.getByText("modal:c-1")).toBeInTheDocument();
        expect(screen.getByText("state:closing")).toBeInTheDocument();

        act(() => screen.getByRole("button", { name: "exited" }).click());

        expect(screen.queryByTestId("overlay")).not.toBeInTheDocument();
    });

    // বন্ধ হওয়ার অ্যানিমেশন চলাকালে অন্য ক্লায়েন্ট খুললে ওভারলে নতুন ক্লায়েন্ট নিয়ে আবার খোলা অবস্থায় আসে কি না যাচাই করি।
    it("Client overlay host: opening another client during the closing animation shows that client, open", async () => {
        const view = openAt("?view_client=c-1");
        await screen.findByText("state:open");
        nav.search = "";
        view.rerender(<ClientViewOverlayHost />);
        expect(screen.getByText("state:closing")).toBeInTheDocument();

        nav.search = "?view_client=c-2";
        view.rerender(<ClientViewOverlayHost />);

        expect(screen.getByText("modal:c-2")).toBeInTheDocument();
        expect(screen.getByText("state:open")).toBeInTheDocument();
    });
});

