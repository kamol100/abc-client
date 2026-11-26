import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ClientViewLink from "@/components/clients/view-mode/client-view-link";
import { takeClientViewOpenedInApp } from "@/components/clients/view-mode/client-view-overlay-history";

const nav = vi.hoisted(() => ({ pathname: "/clients" }));
const settings = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));

vi.mock("next/navigation", () => ({
    usePathname: () => nav.pathname,
}));

vi.mock("@/context/app-provider", () => ({
    useSettings: () => ({ settings: settings.value }),
}));

function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
}

function renderLink() {
    render(<ClientViewLink clientId="c-1">Kamal</ClientViewLink>, { wrapper: Wrapper });
    return screen.getByRole("link", { name: "Kamal" });
}

/** Fires a click and reports whether the link's navigation was stopped. */
function click(link: HTMLElement, init: MouseEventInit = {}): boolean {
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init });
    fireEvent(link, event);
    return event.defaultPrevented;
}

describe("ClientViewLink", () => {
    let pushState: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        nav.pathname = "/clients";
        window.history.replaceState(null, "", "/clients?page=2");
        takeClientViewOpenedInApp();
        pushState?.mockRestore();
        pushState = vi.spyOn(window.history, "pushState").mockImplementation(() => undefined);
    });

    // প্রতিটি মোডে লিংকের href পুরো ভিউ পেজ থাকে, যাতে কপি বা নতুন ট্যাবে খোলা আগের মতো কাজ করে কি না যাচাই করি।
    it.each(["modal", "drawer", "page", "new_tab"])("Client view link (%s): points at the full client page", (mode) => {
        settings.value = { client_view_open_mode: mode };
        expect(renderLink()).toHaveAttribute("href", "/clients/view/c-1");
    });

    // "একই পেজ" মোডে সাধারণ লিংকের মতো চলে, কোনো মডাল খোলে না কি না যাচাই করি।
    it("Client view link (same page): a click follows the link in this tab", () => {
        settings.value = { client_view_open_mode: "page" };
        const link = renderLink();

        expect(link).not.toHaveAttribute("target");
        expect(click(link)).toBe(false);
        expect(pushState).not.toHaveBeenCalled();
    });

    // "নতুন ট্যাব" মোডে লিংক নতুন ট্যাবে খোলে এবং নিরাপদ rel থাকে কি না যাচাই করি।
    it("Client view link (new tab): opens in a new tab with noopener", () => {
        settings.value = { client_view_open_mode: "new_tab" };
        const link = renderLink();

        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
        expect(click(link)).toBe(false);
    });

    // মডাল/ড্রয়ার মোডে ক্লিক বর্তমান পেজেই থাকে, সার্ভারে না গিয়ে URL-এ view_client যোগ হয় এবং পেজের প্যারামিটার থাকে কি না যাচাই করি।
    it.each(["modal", "drawer"])(
        "Client view link (%s): a click stays on the page and adds view_client to the URL",
        (mode) => {
            settings.value = { client_view_open_mode: mode };
            const link = renderLink();

            expect(click(link)).toBe(true);
            expect(pushState).toHaveBeenCalledWith(null, "", "/clients?page=2&view_client=c-1");
            expect(takeClientViewOpenedInApp()).toBe(true);
        },
    );

    // Ctrl/Cmd/Shift বা মাঝের বোতামে ক্লিক করলে ব্রাউজারের নিজস্ব আচরণ (নতুন ট্যাব) থাকে কি না যাচাই করি।
    it.each([
        ["Ctrl", { ctrlKey: true }],
        ["Cmd", { metaKey: true }],
        ["Shift", { shiftKey: true }],
        ["middle button", { button: 1 }],
    ])("Client view link (modal): a %s click is left to the browser", (_label, init) => {
        settings.value = { client_view_open_mode: "modal" };
        const link = renderLink();

        expect(click(link, init)).toBe(false);
        expect(pushState).not.toHaveBeenCalled();
    });

    // একই ক্লায়েন্টের পুরো পেজে থাকলে মডাল খোলে না কি না যাচাই করি।
    it("Client view link (modal): on that client's own page a click opens nothing over it", () => {
        settings.value = { client_view_open_mode: "modal" };
        nav.pathname = "/clients/view/c-1";
        const link = renderLink();

        expect(click(link)).toBe(false);
        expect(pushState).not.toHaveBeenCalled();
    });

    // মেনু আইটেমের মতো প্যারেন্টের onClick আগে চলে এবং তারপর মডাল খোলে কি না যাচাই করি।
    it("Client view link (modal): runs the parent's onClick, then opens the view", () => {
        settings.value = { client_view_open_mode: "modal" };
        const onClick = vi.fn();
        render(<ClientViewLink clientId="c-1" onClick={onClick}>Kamal</ClientViewLink>, { wrapper: Wrapper });

        click(screen.getByRole("link", { name: "Kamal" }));

        expect(onClick).toHaveBeenCalledTimes(1);
        expect(pushState).toHaveBeenCalledTimes(1);
    });
});
