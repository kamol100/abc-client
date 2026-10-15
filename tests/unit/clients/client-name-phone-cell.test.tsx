import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
        expect(screen.getByText("—")).toBeInTheDocument();
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
});
