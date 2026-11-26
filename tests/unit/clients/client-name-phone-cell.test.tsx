import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { toast } from "react-toastify";
import ClientBasicView from "@/components/clients/basic-view";
import ClientNamePhoneCell from "@/components/clients/client-name-phone-cell";
import { ClientRow } from "@/components/clients/client-type";

// ClientViewLink reads the router (modal / drawer open over the current page).
vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
    usePathname: () => "/list",
}));


vi.mock("react-toastify", () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/components/clients/client-router-info", () => ({
    default: () => null,
}));

vi.mock("react-i18next", () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock("next/link", () => ({
    default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
        <a href={href} {...props}>{children}</a>
    ),
}));

const permissions = vi.hoisted(() => ({ allowed: true, newTab: false }));

vi.mock("@/hooks/use-api-query", () => ({
    default: () => ({ data: undefined, isLoading: false, isFetching: false, isError: false }),
}));

vi.mock("@/context/app-provider", () => ({
    usePermissions: () => ({
        hasPermission: (name: string) => name === "clients.show" && permissions.allowed,
    }),
    useSettings: () => ({
        settings: { client_view_open_on_new_tab: permissions.newTab },
    }),
}));

// The view link prefetches the client detail, so the cell needs a query client, as in the app.
function QueryWrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
}

const client = (phone: string | null): ClientRow => ({
    status: 1,
    name: "Kamal",
    pppoe_username: "kamal01",
    phone,
} as ClientRow);

describe("ClientNamePhoneCell WhatsApp link", () => {
    // ক্লায়েন্টের তথ্য ও নিয়ন্ত্রণ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «opens WhatsApp with a local Bangladesh number»।
    it("Client identity and contact links: opens WhatsApp with a local Bangladesh number", () => {
        render(<ClientNamePhoneCell client={client("01712345678")} />, { wrapper: QueryWrapper });

        const link = screen.getByRole("link", { name: "client.whatsapp" });
        expect(link).toHaveAttribute("href", "https://wa.me/8801712345678");
        expect(link).toHaveAttribute("target", "_blank");
    });

    // ক্লায়েন্টের তথ্য ও নিয়ন্ত্রণ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps an international number and drops the plus»।
    it("Client identity and contact links: keeps an international number and drops the plus", () => {
        render(<ClientNamePhoneCell client={client("+8801712345678")} />, { wrapper: QueryWrapper });

        expect(screen.getByRole("link", { name: "client.whatsapp" })).toHaveAttribute(
            "href",
            "https://wa.me/8801712345678"
        );
    });

    // ক্লায়েন্টের তথ্য ও নিয়ন্ত্রণ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «hides the icon when there is no phone number»।
    it("Client identity and contact links: hides the icon when there is no phone number", () => {
        render(<ClientNamePhoneCell client={client(null)} />, { wrapper: QueryWrapper });

        expect(screen.queryByRole("link", { name: "client.whatsapp" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "client.copy_phone" })).not.toBeInTheDocument();
        expect(screen.getByText("—")).toBeInTheDocument();
    });

    // ক্লায়েন্টের তথ্য ও নিয়ন্ত্রণ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «hides the copy icon when the phone is blank»।
    it("Client identity and contact links: hides the copy icon when the phone is blank", () => {
        render(<ClientNamePhoneCell client={client("   ")} />, { wrapper: QueryWrapper });

        expect(screen.queryByRole("button", { name: "client.copy_phone" })).not.toBeInTheDocument();
    });

    // ক্লায়েন্টের তথ্য ও নিয়ন্ত্রণ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «copies the phone number»।
    it("Client identity and contact links: copies the phone number", async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal("navigator", { clipboard: { writeText } });
        Object.defineProperty(window, "isSecureContext", { configurable: true, get: () => true });

        render(<ClientNamePhoneCell client={client(" 01712345678 ")} />, { wrapper: QueryWrapper });
        fireEvent.click(screen.getByRole("button", { name: "client.copy_phone" }));
        await vi.waitFor(() => expect(writeText).toHaveBeenCalled());

        expect(writeText).toHaveBeenCalledWith("01712345678");
        expect(toast.success).toHaveBeenCalledWith("client.phone_copied");
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    // ক্লায়েন্টের তথ্য ও নিয়ন্ত্রণ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «copies with the document command when the clipboard API is unavailable»।
    it("Client identity and contact links: copies with the document command when the clipboard API is unavailable", () => {
        vi.stubGlobal("navigator", {});
        Object.defineProperty(window, "isSecureContext", { configurable: true, get: () => false });
        let copiedValue = "";
        const execCommand = vi.fn((command: string) => {
            if (command !== "copy") return false;
            copiedValue = document.querySelector("textarea")?.value ?? "";
            return true;
        });
        Object.defineProperty(document, "execCommand", {
            configurable: true,
            writable: true,
            value: execCommand,
        });
        vi.mocked(toast.success).mockClear();
        vi.mocked(toast.error).mockClear();

        render(<ClientNamePhoneCell client={client("01712345678")} />, { wrapper: QueryWrapper });
        fireEvent.click(screen.getByRole("button", { name: "client.copy_phone" }));

        expect(document.querySelector("textarea")).toBeNull();
        expect(copiedValue).toBe("01712345678");
        expect(execCommand).toHaveBeenCalledWith("copy");
        expect(toast.success).toHaveBeenCalledWith("client.phone_copied");
        expect(toast.error).not.toHaveBeenCalled();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });
});

describe("ClientNamePhoneCell view link", () => {
    const viewable = { ...client("01712345678"), id: "client-uuid" };

    // ক্লায়েন্টের তথ্য ও নিয়ন্ত্রণ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «opens the client details page from the username»।
    it("Client identity and contact links: opens the client details page from the username", () => {
        permissions.allowed = true;
        permissions.newTab = false;
        render(<ClientNamePhoneCell client={viewable} />, { wrapper: QueryWrapper });

        const link = screen.getByRole("link", { name: "kamal01" });
        expect(link).toHaveAttribute("href", "/clients/view/client-uuid");
        expect(link).not.toHaveAttribute("target");
    });

    // ক্লায়েন্টের তথ্য ও নিয়ন্ত্রণ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «opens the details page in a new tab when that setting is on»।
    it("Client identity and contact links: opens the details page in a new tab when that setting is on", () => {
        permissions.newTab = true;
        render(<ClientNamePhoneCell client={viewable} />, { wrapper: QueryWrapper });

        expect(screen.getByRole("link", { name: "kamal01" })).toHaveAttribute("target", "_blank");
        permissions.newTab = false;
    });

    // ক্লায়েন্টের তথ্য ও নিয়ন্ত্রণ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «keeps the username as text without view permission»।
    it("Client identity and contact links: keeps the username as text without view permission", () => {
        permissions.allowed = false;
        render(<ClientNamePhoneCell client={viewable} />, { wrapper: QueryWrapper });

        expect(screen.queryByRole("link", { name: "kamal01" })).not.toBeInTheDocument();
        expect(screen.getByText("kamal01")).toBeInTheDocument();
        permissions.allowed = true;
    });

    // ক্লায়েন্টের তথ্য ও নিয়ন্ত্রণ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «does not link when the details page is turned off»।
    it("Client identity and contact links: does not link when the details page is turned off", () => {
        render(<ClientNamePhoneCell client={viewable} linkToView={false} />, { wrapper: QueryWrapper });

        expect(screen.queryByRole("link", { name: "kamal01" })).not.toBeInTheDocument();
    });
});

describe("ClientBasicView WhatsApp link", () => {
    // ক্লায়েন্টের তথ্য ও নিয়ন্ত্রণ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «shows a WhatsApp icon next to the phone number»।
    it("Client identity and contact links: shows a WhatsApp icon next to the phone number", () => {
        render(<ClientBasicView client={client("01712345678")} />);

        expect(screen.getByRole("link", { name: "01712345678" })).toHaveAttribute("href", "tel:01712345678");
        expect(screen.getByRole("link", { name: "client.whatsapp" })).toHaveAttribute(
            "href",
            "https://wa.me/8801712345678"
        );
    });

    // ক্লায়েন্টের তথ্য ও নিয়ন্ত্রণ যাচাই করি। এই কেসের নির্দিষ্ট শর্ত ও প্রত্যাশা: «copies the phone number from the icon after WhatsApp»।
    it("Client identity and contact links: copies the phone number from the icon after WhatsApp", async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal("navigator", { clipboard: { writeText } });
        Object.defineProperty(window, "isSecureContext", { configurable: true, get: () => true });
        vi.mocked(toast.success).mockClear();

        render(<ClientBasicView client={client(" 01712345678 ")} />);
        fireEvent.click(screen.getByRole("button", { name: "client.copy_phone" }));
        await vi.waitFor(() => expect(writeText).toHaveBeenCalled());

        expect(writeText).toHaveBeenCalledWith("01712345678");
        expect(toast.success).toHaveBeenCalledWith("client.phone_copied");
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });
});
