import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { toast } from "react-toastify";
import ClientBasicView from "@/components/clients/basic-view";
import ClientNamePhoneCell from "@/components/clients/client-name-phone-cell";
import { ClientRow } from "@/components/clients/client-type";

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

const client = (phone: string | null): ClientRow => ({
    status: 1,
    name: "Kamal",
    pppoe_username: "kamal01",
    phone,
} as ClientRow);

describe("ClientNamePhoneCell WhatsApp link", () => {
    it("opens WhatsApp with a local Bangladesh number", () => {
        render(<ClientNamePhoneCell client={client("01712345678")} />);

        const link = screen.getByRole("link", { name: "client.whatsapp" });
        expect(link).toHaveAttribute("href", "https://wa.me/8801712345678");
        expect(link).toHaveAttribute("target", "_blank");
    });

    it("keeps an international number and drops the plus", () => {
        render(<ClientNamePhoneCell client={client("+8801712345678")} />);

        expect(screen.getByRole("link", { name: "client.whatsapp" })).toHaveAttribute(
            "href",
            "https://wa.me/8801712345678"
        );
    });

    it("hides the icon when there is no phone number", () => {
        render(<ClientNamePhoneCell client={client(null)} />);

        expect(screen.queryByRole("link", { name: "client.whatsapp" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "client.copy_phone" })).not.toBeInTheDocument();
        expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("hides the copy icon when the phone is blank", () => {
        render(<ClientNamePhoneCell client={client("   ")} />);

        expect(screen.queryByRole("button", { name: "client.copy_phone" })).not.toBeInTheDocument();
    });

    it("copies the phone number", async () => {
        const writeText = vi.fn().mockResolvedValue(undefined);
        vi.stubGlobal("navigator", { clipboard: { writeText } });
        Object.defineProperty(window, "isSecureContext", { configurable: true, get: () => true });

        render(<ClientNamePhoneCell client={client(" 01712345678 ")} />);
        fireEvent.click(screen.getByRole("button", { name: "client.copy_phone" }));
        await vi.waitFor(() => expect(writeText).toHaveBeenCalled());

        expect(writeText).toHaveBeenCalledWith("01712345678");
        expect(toast.success).toHaveBeenCalledWith("client.phone_copied");
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("copies with the document command when the clipboard API is unavailable", () => {
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

        render(<ClientNamePhoneCell client={client("01712345678")} />);
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

    it("opens the client details page from the username", () => {
        permissions.allowed = true;
        permissions.newTab = false;
        render(<ClientNamePhoneCell client={viewable} />);

        const link = screen.getByRole("link", { name: "kamal01" });
        expect(link).toHaveAttribute("href", "/clients/view/client-uuid");
        expect(link).toHaveAttribute("target", "_self");
    });

    it("opens the details page in a new tab when that setting is on", () => {
        permissions.newTab = true;
        render(<ClientNamePhoneCell client={viewable} />);

        expect(screen.getByRole("link", { name: "kamal01" })).toHaveAttribute("target", "_blank");
        permissions.newTab = false;
    });

    it("keeps the username as text without view permission", () => {
        permissions.allowed = false;
        render(<ClientNamePhoneCell client={viewable} />);

        expect(screen.queryByRole("link", { name: "kamal01" })).not.toBeInTheDocument();
        expect(screen.getByText("kamal01")).toBeInTheDocument();
        permissions.allowed = true;
    });

    it("does not link when the details page is turned off", () => {
        render(<ClientNamePhoneCell client={viewable} linkToView={false} />);

        expect(screen.queryByRole("link", { name: "kamal01" })).not.toBeInTheDocument();
    });
});

describe("ClientBasicView WhatsApp link", () => {
    it("shows a WhatsApp icon next to the phone number", () => {
        render(<ClientBasicView client={client("01712345678")} />);

        expect(screen.getByRole("link", { name: "01712345678" })).toHaveAttribute("href", "tel:01712345678");
        expect(screen.getByRole("link", { name: "client.whatsapp" })).toHaveAttribute(
            "href",
            "https://wa.me/8801712345678"
        );
    });

    it("copies the phone number from the icon after WhatsApp", async () => {
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
