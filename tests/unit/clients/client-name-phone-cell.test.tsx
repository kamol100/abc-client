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
